import { query } from "./db";

// Table is created by migration 002_tickets.sql

export type TicketRow = {
  id: string;
  source: string | null;
  email: string | null;
  subject: string;
  body: string;
  attachments: any;
  predicted_category: string | null;
  priority: "High" | "Medium" | "Low" | null;
  confidence: number | null;
  suggested_reply: string | null;
  action: string | null;
  status: string;
  assigned_to: string | null;
  queue: string | null;
  first_response_due: string | null;
  resolution_due: string | null;
  escalation_due: string | null;
  first_response_sent_at: string | null;
  resolved_at: string | null;
  escalated_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function insertTicket(args: {
  email: string;
  subject: string;
  body: string;
  priority?: "High" | "Medium" | "Low";
}): Promise<TicketRow> {
  const status = "untriaged";
  const priority = args.priority ?? null;
  const { rows } = await query<TicketRow>(
    `INSERT INTO tickets (source, email, subject, body, status, priority)
     VALUES ('customer',$1,$2,$3,$4,$5)
     RETURNING *`,
    [args.email, args.subject, args.body, status, priority]
  );
  return rows[0];
}


