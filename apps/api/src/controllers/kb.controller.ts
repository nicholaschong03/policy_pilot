import { Request, Response } from "express";
import path from "path";
import {
  deleteKnowledgeBaseFile,
  listKnowledgeBaseFiles,
} from "../services/kb.service";
import { KnowledgeBaseFileMeta } from "../types/kb";
import fs from "fs";
import { getKbStorageDir } from "../services/kb.service";
import { insertDoc } from "../repos/kb.repo";
import { ingestQueue } from "../queues/ingest.queue";

function mapExtToType(filename: string): KnowledgeBaseFileMeta["type"] {
  const ext = path.extname(filename).replace(".", "").toLowerCase();
  switch (ext) {
    case "pdf":
      return "PDF";
    case "md":
    case "markdown":
      return "MD";
    case "xlsx":
    case "xls":
      return "XLSX";
    case "txt":
      return "TXT";
    default:
      return "OTHER";
  }
}

export async function uploadDocuments(req: Request, res: Response) {
  const files = ((req as any).files as any[]) || [];
  const dir = getKbStorageDir();

  const uploaded: KnowledgeBaseFileMeta[] = [];
  for (const f of files) {
    const id = path.basename(f.filename);
    const title = path.basename(f.originalname);
    const type = mapExtToType(title);
    const storagePath = path.join(dir, f.filename);

    await insertDoc({
      id,
      title,
      type,
      size: f.size,
      storagePath,
      status: "uploaded",
    });

    await ingestQueue.add("ingest", { docId: id, title, type, path: storagePath });

    uploaded.push({
      id,
      title,
      type,
      uploadDate: new Date().toISOString().split("T")[0],
      size: f.size,
    });
  }
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

