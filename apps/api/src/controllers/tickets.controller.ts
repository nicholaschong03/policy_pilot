import { Request, Response } from "express";
import { z } from "zod";
import { createTicket as createTicketService } from "../services/tickets.service";

export async function postTriage(req: Request, res: Response) {
  // Mirror the previous stub to keep UI working
  return res.json({
    category: "Billing",
    priority: "Low",
    suggested_reply: "Thanks for reaching out. (stub)",
    supports: [],
    confidence: 0.5,
    action: "AUTO_ACK_ONLY",
    sla: { first_response_minutes: 60, resolution_hours: 24 },
  });
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


