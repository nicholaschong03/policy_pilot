import { insertTicket, TicketRow } from "../repos/tickets.repo";
import { ticketsTriageQueue } from "../queues/tickets.queue";

export type CreateTicketInput = {
  email: string;
  subject: string;
  body: string;
  priority?: "High" | "Medium" | "Low";
};

// Business logic entrypoint for creating a customer ticket.
// Centralizes persistence and future side-effects (triage enqueue, notifications, etc.).
export async function createTicket(input: CreateTicketInput): Promise<TicketRow> {
  // TODO: add dedupe, spam checks, attachment handling, triage enqueue
  const ticket = await insertTicket(input);
  if (process.env.AUTO_TRIAGE_ENABLED === "true") {
    await ticketsTriageQueue.add("triage", { ticketId: ticket.id }, { jobId: ticket.id });
  }
  return ticket;
}


