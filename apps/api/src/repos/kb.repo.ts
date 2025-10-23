import { query } from "./db";

export async function insertDoc(args: {
  id: string;
  title: string;
  type: string;
  size: number;
  storagePath: string;
  status: "uploaded" | "processing" | "ingested" | "failed";
  error?: string | null;
}) {
  await query(
    `INSERT INTO kb_docs (id, title, type, size, storage_path, status, error)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title, type=EXCLUDED.type, size=EXCLUDED.size, storage_path=EXCLUDED.storage_path, status=EXCLUDED.status, error=EXCLUDED.error, updated_at=now()`,
    [
      args.id,
      args.title,
      args.type,
      args.size,
      args.storagePath,
      args.status,
      args.error ?? null,
    ]
  );
}

export async function updateDocStatus(
  id: string,
  status: "uploaded" | "processing" | "ingested" | "failed",
  error: string | null = null
) {
  await query(
    `UPDATE kb_docs SET status=$2, error=$3, updated_at=now() WHERE id=$1`,
    [id, status, error]
  );
}

export async function insertChunks(
  docId: string,
  chunks: { index: number; text: string; embedding: number[] }[]
) {
  // single multi-row insert
  const values: any[] = [];
  const toVectorLiteral = (arr: number[]): string =>
    `[${arr.map((n) => (typeof n === "number" ? n : Number(n))).join(",")}]`;
  const rows = chunks
    .map((c, i) => {
      // pgvector expects a text literal like "[0.1,0.2,...]", not a Postgres array literal {..}
      const vectorText = toVectorLiteral(c.embedding as number[]);
      values.push(docId, c.index, c.text, vectorText);
      return `($${values.length - 3}, $${values.length - 2}, $${
        values.length - 1
      }, $${values.length}::vector)`;
    })
    .join(", ");
  await query(
    `INSERT INTO kb_chunks (doc_id, chunk_index, text, embedding) VALUES ${rows}`,
    values
  );
}

export type KbDocRow = {
  id: string;
  title: string;
  type: string;
  size: number;
  storage_path: string;
  status: "uploaded" | "processing" | "ingested" | "failed";
  error: string | null;
  created_at: string;
  updated_at: string;
};

export async function listDocs(): Promise<KbDocRow[]> {
  const { rows } = await query<KbDocRow>(
    `SELECT id, title, type, size, storage_path, status, error, created_at, updated_at
     FROM kb_docs
     ORDER BY updated_at DESC`
  );
  return rows;
}


export async function deleteDocReturningPath(
  id: string
): Promise<string | null> {
  const { rows } = await query<{ storage_path: string }>(
    `DELETE FROM kb_docs WHERE id=$1 RETURNING storage_path`,
    [id]
  );
  return rows[0]?.storage_path ?? null;
}
