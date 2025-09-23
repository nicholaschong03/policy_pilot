import { Request, Response } from "express";

export async function getSearch(req: Request, res: Response) {
  // Keep returning the stub structure for now
  return res.json({ results: [] });
}


