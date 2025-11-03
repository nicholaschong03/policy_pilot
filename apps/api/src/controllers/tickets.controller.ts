import { Request, Response } from "express";
import { z } from "zod";
import { createTicket as createTicketService } from "../services/tickets.service";
import { classifyTicket } from "../services/triage.service";
import { retrieve } from "../services/retrieval.service";
import { generateSuggestedReplyFromChunks } from "../services/reply.service";
import { decide } from "../services/decision.service";
import { getTicketByIdForEmail, listTicketsByEmail, assignTicketTo } from "../repos/tickets.repo";
import { query } from "../repos/db";
import { getSlaConfig } from "../services/sla.service";

export async function postTriage(req: Request, res: Response) {
  const { subject, body, top_k } = (req.body || {}) as {
    subject: string;
    body: string;
    top_k?: number;
  };
  if (!subject || !body) {
    return res.status(400).json({ error: "subject and body are required" });
  }
  try {
    const classification = await classifyTicket({ subject, body });
    const chunks = await retrieve(`${subject}\n${body}`, Number(top_k) || 5);
    const reply = await generateSuggestedReplyFromChunks({ subject, body }, chunks);
    const action = decide({
      priority: classification.priority,
      confidence: classification.confidence,
      riskFlags: classification.riskFlags,
    });
    const slaCfg = await getSlaConfig();
    const pri = classification.priority as "High" | "Medium" | "Low";
    const slaForPriority = slaCfg[pri];
    const ackMessage = action === "AUTO_ACK_ONLY"
      ? `Thanks for reaching out. We\'ve received your request and assigned it a ${pri} priority. Our team will send a first response within ${slaForPriority.first_response_minutes} minutes. If you have additional details, just reply to this message.`
      : undefined;
    return res.json({
      category: classification.category,
      priority: classification.priority,
      confidence: classification.confidence,
      risk_flags: classification.riskFlags,
      suggested_reply: reply,
      sources: chunks.map((c, i) => ({ index: i + 1, doc_id: c.doc_id, chunk_index: c.chunk_index, score: c.score })),
      action,
      sla: {
        first_response_minutes: slaForPriority.first_response_minutes,
        resolution_hours: slaForPriority.resolution_hours,
      },
      acknowledgement_message: ackMessage,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "triage failed" });
  }
}

const createTicketSchema = z.object({
  email: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
  priority: z.enum(["High", "Medium", "Low"]).optional(),
});

export async function createTicket(req: Request, res: Response) {
  const parsed = createTicketSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
  }
  try {
    const ticket = await createTicketService(parsed.data);
    return res.status(201).json({ ticket });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Failed to create ticket" });
  }
}

export async function listTickets(req: Request, res: Response) {
  const email = (req.method === "GET" ? (req.query.email as string) : (req.body?.email as string)) || "";
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ error: "A valid email is required" });
  }
  const rows = await listTicketsByEmail(email);
  return res.json({ tickets: rows });
}

export async function getTicketByEmail(req: Request, res: Response) {
  const id = req.params.id;
  const email = (req.method === "GET" ? (req.query.email as string) : (req.body?.email as string)) || "";
  if (!id || !email) return res.status(400).json({ error: "id and email required" });
  const row = await getTicketByIdForEmail(id, email);
  if (!row) return res.status(404).json({ error: "Not found" });
  return res.json({ ticket: row });
}

export async function countActiveTickets(_req: Request, res: Response) {
  // Active tickets are those with status='active'
  const { rows } = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM tickets WHERE status='active'`
  );
  const count = Number(rows?.[0]?.count ?? 0);
  return res.json({ count });
}

// Admin stats: average first response time (minutes) and resolution rate (%)
export async function getAdminTicketStats(_req: Request, res: Response) {
  try {
    // Average minutes from created_at to first_response_sent_at for tickets that have a first response
    const avgRespSql = `
      SELECT AVG(
               EXTRACT(
                 EPOCH FROM ((
                   COALESCE(first_response_sent_at, resolved_at, now())
                 ) - created_at)
               ) / 60.0
             ) AS avg_minutes
        FROM tickets
    `;
    const avgResp = await query<{ avg_minutes: number | null }>(avgRespSql);

    // Resolution rate: resolved tickets over total tickets (exclude untriaged? keep all for now)
    const resolutionSql = `
      SELECT
        (CASE WHEN total.count = 0 THEN 0
              ELSE (resolved.count::decimal / total.count::decimal) * 100 END) AS resolution_rate
      FROM
        (SELECT COUNT(*) AS count FROM tickets) AS total,
        (SELECT COUNT(*) AS count FROM tickets WHERE status = 'resolved') AS resolved
    `;
    const resolution = await query<{ resolution_rate: string | number | null }>(resolutionSql);

    const rawAvg = (avgResp.rows?.[0] as any)?.avg_minutes;
    const avgFirstResponseMinutes = rawAvg === null || rawAvg === undefined ? null : Number(rawAvg);
    const resolutionRate = Number((resolution.rows?.[0] as any)?.resolution_rate ?? 0);

    return res.json({
      avg_first_response_minutes: avgFirstResponseMinutes,
      resolution_rate_percent: resolutionRate,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Failed to compute stats" });
  }
}

// Admin analytics: 7d ticket volume, category split, and AI vs Human resolution by day
export async function getAdminAnalytics(_req: Request, res: Response) {
  try {
    // 7-day series helper
    const volumeSql = `
      WITH days AS (
        SELECT generate_series(
                 date_trunc('day', now()) - interval '6 days',
                 date_trunc('day', now()),
                 interval '1 day'
               ) AS day
      ),
      counts AS (
        SELECT date_trunc('day', created_at) AS day, COUNT(*)::int AS cnt
          FROM tickets
         WHERE created_at >= now() - interval '7 days'
         GROUP BY 1
      )
      SELECT to_char(d.day, 'YYYY-MM-DD') AS date, COALESCE(c.cnt, 0) AS count
        FROM days d
        LEFT JOIN counts c ON c.day = d.day
       ORDER BY d.day`;
    const volume = await query<{ date: string; count: number }>(volumeSql);

    const categoriesSql = `
      SELECT COALESCE(predicted_category, 'General') AS category,
             COUNT(*)::int AS count
        FROM tickets
       WHERE created_at >= now() - interval '7 days'
       GROUP BY 1
       ORDER BY count DESC`;
    const categories = await query<{ category: string; count: number }>(categoriesSql);

    const byDaySql = `
      WITH days AS (
        SELECT generate_series(
                 date_trunc('day', now()) - interval '6 days',
                 date_trunc('day', now()),
                 interval '1 day'
               ) AS day
      ),
      base AS (
        SELECT date_trunc('day', created_at) AS day,
               action
          FROM tickets
         WHERE created_at >= now() - interval '7 days'
      ),
      agg AS (
        SELECT day,
               SUM(CASE WHEN action = 'AUTO_RESOLVE' THEN 1 ELSE 0 END)::int AS ai,
               SUM(CASE WHEN action IN ('AUTO_ACK_ONLY','ESCALATE') THEN 1 ELSE 0 END)::int AS human
          FROM base
         GROUP BY 1
      )
      SELECT to_char(d.day, 'YYYY-MM-DD') AS date,
             COALESCE(a.ai, 0) AS ai,
             COALESCE(a.human, 0) AS human
        FROM days d
        LEFT JOIN agg a ON a.day = d.day
       ORDER BY d.day`;
    const resolutionByDay = await query<{ date: string; ai: number; human: number }>(byDaySql);

    const totalsSql = `
      SELECT
        (SELECT COUNT(*) FROM tickets WHERE created_at >= now() - interval '7 days')::int AS total,
        (SELECT COUNT(*) FROM tickets WHERE created_at >= now() - interval '7 days' AND action='AUTO_RESOLVE')::int AS ai,
        (SELECT COUNT(*) FROM tickets WHERE created_at >= now() - interval '7 days' AND action IN ('AUTO_ACK_ONLY','ESCALATE'))::int AS human`;
    const totals = await query<{ total: number; ai: number; human: number }>(totalsSql);

    return res.json({
      period_days: 7,
      volume_by_day: volume.rows,
      category_distribution: categories.rows.map(r => ({ name: r.category, count: r.count })),
      resolution_by_day: resolutionByDay.rows,
      resolution_totals: totals.rows?.[0] ?? { total: 0, ai: 0, human: 0 },
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Failed to compute analytics' });
  }
}

export async function assignTicket(req: Request, res: Response) {
  const id = req.params.id;
  const { assigned_to } = (req.body || {}) as { assigned_to?: string | null };
  if (!id) return res.status(400).json({ error: "Missing ticket id" });
  try {
    await assignTicketTo(id, assigned_to ?? null);
    return res.status(204).send();
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Failed to assign ticket" });
  }
}

// Staff: fetch ticket by id without customer email (agent/admin only)
export async function getTicketForStaff(req: Request, res: Response) {
  const id = req.params.id;
  if (!id) return res.status(400).json({ error: "Missing ticket id" });
  try {
    const { rows } = await query(
      `SELECT id, subject, body, status, priority, predicted_category, created_at,
              first_response_due, resolution_due, escalation_due,
              first_response_sent_at, first_response_text, resolved_at, action, assigned_to, queue, suggested_reply
         FROM tickets WHERE id=$1 LIMIT 1`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    return res.json({ ticket: rows[0] });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Failed to load ticket" });
  }
}

// Staff: resolve a ticket
export async function resolveTicket(req: Request, res: Response) {
  const id = req.params.id;
  if (!id) return res.status(400).json({ error: "Missing ticket id" });
  try {
    await query(
      `UPDATE tickets
          SET status='resolved', resolved_at=now(), updated_at=now()
        WHERE id=$1`,
      [id]
    );
    return res.status(204).send();
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Failed to resolve ticket" });
  }
}

// Staff: record first response with optional text
export async function recordFirstResponse(req: Request, res: Response) {
  const id = req.params.id;
  const { text } = (req.body || {}) as { text?: string };
  if (!id) return res.status(400).json({ error: "Missing ticket id" });
  try {
    await query(
      `UPDATE tickets
          SET first_response_sent_at=COALESCE(first_response_sent_at, now()),
              first_response_text=COALESCE($2, first_response_text),
              updated_at=now()
        WHERE id=$1`,
      [id, text ?? null]
    );
    return res.status(204).send();
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Failed to record first response" });
  }
}


