import { Worker } from "bullmq";
import { ticketsTriageQueue, type TriageJob } from "../queues/tickets.queue";
import { classifyTicket } from "../services/triage.service";
import { retrieve } from "../services/retrieval.service";
import { generateSuggestedReplyFromChunks } from "../services/reply.service";
import { computeDueDates, getSlaConfig } from "../services/sla.service";
import { decide } from "../services/decision.service";
import { query } from "../repos/db";
import { chooseAssigneeForTicket } from "../services/assignment.service";
import { assignTicketTo } from "../repos/tickets.repo";

import dotenv from "dotenv";
dotenv.config();

const connection = { url: process.env.REDIS_URL || "redis://localhost:6379" };

console.log("Tickets triage worker booting...");

export const ticketsWorker = new Worker<TriageJob>(
  "tickets-triage",
  async (job) => {
    const { ticketId } = job.data;
    console.log(`[triage] start job id=${job.id} ticketId=${ticketId}`);
    // Load current ticket
    const { rows } = await query(
      `SELECT id, subject, body, created_at, email FROM tickets WHERE id=$1`,
      [ticketId]
    );
    if (rows.length === 0) return;
    const t = rows[0] as { id: string; subject: string; body: string; created_at: string; email: string | null };

    const cls = await classifyTicket({ subject: t.subject, body: t.body });
    console.log(`[triage] classified ticketId=${ticketId} ->`, cls);

    // Build suggested reply using top-k KB chunks
    let suggestedReply: string | null = null;
    try {
      const chunks = await retrieve(`${t.subject}\n${t.body}`, 5);
      suggestedReply = await generateSuggestedReplyFromChunks(
        { subject: t.subject, body: t.body },
        chunks
      );
    } catch (e: any) {
      console.warn("[triage] reply generation failed:", e?.message || e);
      suggestedReply = null;
    }

    // Compute SLA due dates using configured SLA
    let first_response_due: string | null = null;
    let resolution_due: string | null = null;
    let escalation_due: string | null = null;
    try {
      if (cls.priority) {
        const cfg = await getSlaConfig();
        const due = computeDueDates(t.created_at, cls.priority, cfg);
        first_response_due = due.first_response_due;
        resolution_due = due.resolution_due;
        escalation_due = due.escalation_due;
      }
    } catch (e: any) {
      console.warn("[triage] SLA compute failed:", e?.message || e);
    }

    // Decide next action
    const action = decide({
      priority: cls.priority,
      confidence: cls.confidence,
      riskFlags: cls.riskFlags,
    });

    // Apply action effects
    let first_response_sent_at: string | null = null;
    let resolved_at: string | null = null;
    let status: string = "active";
    let queue: string | null = null;
    if (action === "AUTO_ACK_ONLY") {
      // Keep active; do not mark first_response_sent_at until an actual reply is sent
      status = "active";
    } else if (action === "AUTO_RESOLVE") {
      resolved_at = new Date().toISOString();
      status = "resolved";
    } else if (action === "ESCALATE") {
      status = "active";
      queue = "escalation";
    }

    // Persist classification, SLA, and action
    await query(
      `UPDATE tickets
         SET predicted_category=$2,
             priority=$3,
             confidence=$4,
             risk_flags=$5::jsonb,
             suggested_reply=$6,
             first_response_due=$7::timestamptz,
             resolution_due=$8::timestamptz,
             escalation_due=$9::timestamptz,
             action=$10,
             status=$11,
             queue=$12,
             first_response_sent_at=COALESCE($13::timestamptz, first_response_sent_at),
             resolved_at=COALESCE($14::timestamptz, resolved_at),
             updated_at=now()
       WHERE id=$1`,
      [
        ticketId,
        cls.category,
        cls.priority,
        cls.confidence,
        JSON.stringify(cls.riskFlags),
        suggestedReply,
        first_response_due,
        resolution_due,
        escalation_due,
        action,
        status,
        queue,
        first_response_sent_at,
        resolved_at,
      ]
    );
    console.log(`[triage] updated ticketId=${ticketId}`);

    // Auto-assign based on action
    try {
      if (status === "active") {
        const role: "agent" | "admin" = action === "ESCALATE" ? "admin" : "agent";
        const assignee = await chooseAssigneeForTicket(t.email || undefined, role);
        if (assignee) {
          await assignTicketTo(ticketId, assignee);
          console.log(`[triage] assigned ticketId=${ticketId} to userId=${assignee}`);
        }
      }
    } catch (e: any) {
      console.warn(`[triage] assignment failed for ticketId=${ticketId}:`, e?.message || e);
    }
  },
  { connection }
);

// Re-export queue for convenience (optional)
export { ticketsTriageQueue };

// Lifecycle logs
ticketsWorker.on("ready", () => {
  console.log("Tickets triage worker ready (queue=tickets-triage)");
});
ticketsWorker.on("error", (err) => {
  console.error("Tickets triage worker error:", err?.message || err);
});
ticketsWorker.on("failed", (job, err) => {
  console.error(`Tickets triage job failed id=${job?.id}`, err?.message || err);
});
ticketsWorker.on("completed", (job) => {
  console.log(`Tickets triage job completed id=${job.id}`);
});



