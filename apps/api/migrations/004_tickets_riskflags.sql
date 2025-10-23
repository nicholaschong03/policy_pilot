-- Add risk flags array to tickets
ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS risk_flags jsonb NOT NULL DEFAULT '[]'::jsonb;


