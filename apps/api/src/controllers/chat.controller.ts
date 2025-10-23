import { Request, Response } from "express";
import { answerQuery } from "../services/chat.service";
import { retrieve } from "../services/retrieval.service";

export async function postChat(req: Request, res: Response) {
  const { query, top_k } = (req.body || {}) as {
    query: string;
    top_k?: number;
  };
  if (!query || !query.trim()) {
    return res.status(400).json({ error: "query is required" });
  }
  try {
    const result = await answerQuery(query, Number(top_k) || 5);
    return res.json(result);
  } catch (e: any) {
    const message = e?.message || (typeof e === "string" ? e : "Chat failed");
    const details = e?.response?.data?.error?.message || e?.stack || undefined;
    // eslint-disable-next-line no-console
    console.error("Chat error:", message, details || "");
    const body: any = { error: message };
    if (process.env.NODE_ENV !== "production" && details) body.details = details;
    return res.status(500).json(body);
  }
}

export async function previewRetrieval(req: Request, res: Response) {
  const query = (req.method === "GET" ? (req.query.query as string) : (req.body?.query as string)) || "";
  const topKRaw = (req.method === "GET" ? (req.query.top_k as string) : (req.body?.top_k as any)) as string | number | undefined;
  const topK = Number(topKRaw ?? 8) || 8;
  if (!query.trim()) {
    return res.status(400).json({ error: "query is required" });
  }
  try {
    const results = await retrieve(query, topK);
    return res.json({ results });
  } catch (e: any) {
    const message = e?.message || (typeof e === "string" ? e : "Preview failed");
    const details = e?.stack || undefined;
    // eslint-disable-next-line no-console
    console.error("Preview retrieval error:", message, details || "");
    const body: any = { error: message };
    if (process.env.NODE_ENV !== "production" && details) body.details = details;
    return res.status(500).json(body);
  }
}
