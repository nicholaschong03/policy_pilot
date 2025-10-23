import { Queue } from "bullmq";

export type TriageJob = { ticketId: string };

export const ticketsTriageQueue = new Queue<TriageJob>("tickets-triage", {
  connection: { url: process.env.REDIS_URL || "redis://localhost:6379" }
});


