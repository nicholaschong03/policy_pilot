CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS kb_docs(
    id text PRIMARY KEY,
    title text NOT NULL,
    type text NOT NULL,
    size integer NOT NULL,
    storage_path text NOT NULL,
    status text NOT NULL CHECK (status IN ('uploaded', 'processing', 'ingested', 'failed')),
    error text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kb_chunks(
    id bigserial PRIMARY KEY,
    doc_id text NOT NULL REFERENCES kb_docs(id) ON DELETE CASCADE,
    chunk_index integer NOT NULL,
    text text NOT NULL,
    embedding vector(384) NOT NULL
);

CREATE INDEX IF NOT EXISTS kb_chunks_embedding_idx
    ON kb_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);