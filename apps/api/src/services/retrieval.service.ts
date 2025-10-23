import axios from "axios";
import { query } from "../repos/db";

const INGEST_BASE = process.env.INGEST_SERVICE_URL || "http://localhost:8000";

// Convert number[] to pgvector text literal: [0.1,0.2...]
function toVectorLiteral(arr: number[]): string {
  return `[${arr
    .map((n) => (typeof n === "number" ? n : Number(n)))
    .join(",")}]`;
}

export async function embedQuery(text: string): Promise<number[]> {
  const { data } = await axios.post(
    `${INGEST_BASE}/embed`,
    { text },
    { timeout: 20_000 }
  );
  const emb = data.embedding as number[];
  try {
    // Debug: log embedding length and small sample
    console.log(
      `embedQuery: textLen=${text.length}, embLen=${emb?.length}, sample=${
        Array.isArray(emb)
          ? emb
              .slice(0, 5)
              .map((n) => Number(n).toFixed(4))
              .join(",")
          : "n/a"
      }`
    );
    if (Array.isArray(emb) && emb.length !== 384) {
      console.warn(
        `embedQuery: unexpected embedding length ${emb.length} (expected 384)`
      );
    }
  } catch {}
  return emb;
}

export type RetrievedChunk = {
  doc_id: string;
  chunk_index: number;
  text: string;
  score: number;
};

export async function searchKbByEmbedding(
  embedding: number[],
  topK = 8
): Promise<RetrievedChunk[]> {
  if (!Array.isArray(embedding) || embedding.length !== 384 || embedding.some(x => !Number.isFinite(x))) {
    throw new Error(
      `Bad embedding: len=${embedding?.length}, nonfinite=${embedding?.filter(x => !Number.isFinite(x)).length}`
    );
  }

  const k = Math.max(1, Number(topK) || 8);

  // Pass the raw float[]; cast to vector in SQL, return score as float8 and never NULL
  const { rows } = await query<RetrievedChunk>(
    `
    WITH q(vec) AS (SELECT $1::float4[]::vector(384))
    SELECT
      doc_id,
      chunk_index,
      text,
      COALESCE((1 - cosine_distance(embedding, q.vec))::float8, 0.0)::float8 AS score
    FROM public.kb_chunks AS c, q
    ORDER BY cosine_distance(embedding, q.vec) NULLS LAST
    LIMIT $2::int
    `,
    [embedding, k]
  );

  console.log("[KNN] returned=", rows.length, "scores=", rows.map(r => r.score));
  return rows;
}


export async function retrieve(
  queryText: string,
  topK = 5
): Promise<RetrievedChunk[]> {
  const emb = await embedQuery(queryText);
  return await searchKbByEmbedding(emb, topK);
}
