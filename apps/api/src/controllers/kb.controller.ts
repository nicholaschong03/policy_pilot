import { Request, Response } from "express";
import path from "path";
import {
  deleteKnowledgeBaseFile,
  listKnowledgeBaseFiles,
} from "../services/kb.service";
import { KnowledgeBaseFileMeta } from "../types/kb";
import fs from "fs";
import { getKbStorageDir } from "../services/kb.service";

export async function uploadDocuments(req: Request, res: Response) {
  const files = ((req as any).files as any[]) || [];
  const uploaded: KnowledgeBaseFileMeta[] = files.map((f) => ({
    id: path.basename(f.filename),
    title: path.basename(f.originalname),
    type: "OTHER",
    uploadDate: new Date().toISOString().split("T")[0],
    size: f.size,
  }));
  return res.status(201).json({ files: uploaded });
}

export async function listDocuments(_req: Request, res: Response) {
  const files = await listKnowledgeBaseFiles();
  return res.json({ files });
}

export async function deleteDocument(req: Request, res: Response) {
  const { filename } = req.params as { filename: string };
  await deleteKnowledgeBaseFile(filename);
  return res.status(204).send();
}

export async function getDocument(req: Request, res: Response) {
  const { filename } = req.params as { filename: string };
  const full = path.join(getKbStorageDir(), filename);
  if (!fs.existsSync(full)) {
    return res.status(404).json({ error: "Not found" });
  }
  res.setHeader("Content-Disposition", `inline; filename="${path.basename(filename)}"`);
  return res.sendFile(full);
}

