import { Request, Response } from "express";

export async function postChat(req: Request, res: Response) {
  // For now, return the same stubbed response as before to avoid breaking the UI
  return res.json({
    answer: "This is a stubbed answer.",
    citations: [],
    confidence: 0.0,
    unanswerable: false,
  });
}


