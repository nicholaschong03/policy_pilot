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
  first_response_text: string | null;
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

export async function listTicketsByEmail(email: string): Promise<Pick<TicketRow,
  "id" | "subject" | "status" | "priority" | "created_at" | "first_response_due" | "resolution_due" | "resolved_at"
>[]> {
  const { rows } = await query(
    `SELECT id, subject, status, priority, created_at, first_response_due, resolution_due, resolved_at
       FROM tickets
      WHERE email=$1
      ORDER BY created_at DESC`,
    [email]
  );
  return rows as any;
}

export async function getTicketByIdForEmail(id: string, email: string): Promise<Pick<TicketRow,
  "id" | "subject" | "body" | "status" | "priority" | "created_at" | "first_response_due" | "resolution_due" | "escalation_due" | "action" | "suggested_reply" | "first_response_sent_at" | "first_response_text" | "resolved_at"
> | null> {
  const { rows } = await query(
    `SELECT id, subject, body, status, priority, created_at, first_response_due, resolution_due, escalation_due, action, suggested_reply, first_response_sent_at, first_response_text, resolved_at
       FROM tickets
      WHERE id=$1 AND email=$2
      LIMIT 1`,
    [id, email]
  );
  if (rows.length === 0) return null;
  return rows[0] as any;
}

export async function assignTicketTo(id: string, userId: string | null): Promise<void> {
  await query(
    `UPDATE tickets SET assigned_to=$2, updated_at=now() WHERE id=$1`,
    [id, userId]
  );
}

export type TicketListItem = Pick<TicketRow,
  "id" | "subject" | "predicted_category" | "priority" | "status" | "assigned_to" |
  "first_response_due" | "resolution_due" | "first_response_sent_at" | "resolved_at" | "created_at"
>;

export async function listTicketsAssignedToUser(userId: string): Promise<TicketListItem[]> {
  const { rows } = await query<TicketListItem>(
    `SELECT id, subject, predicted_category, priority, status, assigned_to,
            first_response_due, resolution_due, first_response_sent_at, resolved_at, created_at
       FROM tickets
      WHERE assigned_to=$1
      ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

export async function listActiveTeamTickets(): Promise<TicketListItem[]> {
  const { rows } = await query<TicketListItem>(
    `SELECT id, subject, predicted_category, priority, status, assigned_to,
            first_response_due, resolution_due, first_response_sent_at, resolved_at, created_at
       FROM tickets
      WHERE status IN ('active','escalated')
      ORDER BY created_at DESC`
  );
  return rows;
}


