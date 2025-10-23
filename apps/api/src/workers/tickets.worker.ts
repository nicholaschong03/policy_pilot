import { Worker } from "bullmq";
import { ticketsTriageQueue, type TriageJob } from "../queues/tickets.queue";
import { classifyTicket } from "../services/triage.service";
import { query } from "../repos/db";

const connection = { url: process.env.REDIS_URL || "redis://localhost:6379" };

console.log("Tickets triage worker booting...");

export const ticketsWorker = new Worker<TriageJob>(
  "tickets-triage",
  async (job) => {
    const { ticketId } = job.data;
    console.log(`[triage] start job id=${job.id} ticketId=${ticketId}`);
    // Load current ticket
    const { rows } = await query(
      `SELECT id, subject, body FROM tickets WHERE id=$1`,
      [ticketId]
    );
    if (rows.length === 0) return;
    const t = rows[0] as { id: string; subject: string; body: string };

    const cls = await classifyTicket({ subject: t.subject, body: t.body });
    console.log(`[triage] classified ticketId=${ticketId} ->`, cls);

    // Persist classification
    await query(
      `UPDATE tickets
         SET predicted_category=$2,
             priority=$3,
             confidence=$4,
             risk_flags=$5::jsonb,
             status='active',
             updated_at=now()
       WHERE id=$1`,
      [ticketId, cls.category, cls.priority, cls.confidence, JSON.stringify(cls.riskFlags)]
    );
    console.log(`[triage] updated ticketId=${ticketId}`);
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



