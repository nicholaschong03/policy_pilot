import { Request, Response } from "express";

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


