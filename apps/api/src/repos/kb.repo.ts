import { query } from "./db";

export async function insertDoc(args: {
  id: string; title: string; type: string; size: number; storagePath: string; status: "uploaded" | "processing" | "ingested" | "failed"; error?: string | null;
}) {
  await query(
    `INSERT INTO kb_docs (id, title, type, size, storage_path, status, error)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, type=EXCLUDED.type, size=EXCLUDED.size, storage_path=EXCLUDED.storage_path, status=EXCLUDED.status, error=EXCLUDED.error, updated_at=now()`,
    [args.id, args.title, args.type, args.size, args.storagePath, args.status, args.error ?? null]
  );
}

export async function updateDocStatus(id: string, status: "uploaded" | "processing" | "ingested" | "failed", error: string | null = null) {
  await query(`UPDATE kb_docs SET status=$2, error=$3, updated_at=now() WHERE id=$1`, [id, status, error]);
}

export async function insertChunks(docId: string, chunks: { index: number; text: string; embedding: number[] }[]) {
  // single multi-row insert
  const values: any[] = [];
  const rows = chunks
    .map((c, i) => {
      values.push(docId, c.index, c.text, c.embedding);
      return `($${values.length - 3}, $${values.length - 2}, $${values.length - 1}, $${values.length}::vector)`;
    })
    .join(", ");
  await query(
    `INSERT INTO kb_chunks (doc_id, chunk_index, text, embedding) VALUES ${rows}`,
    values
  );
}