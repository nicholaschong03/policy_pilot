-- Add array of categories to capture multi-label classification
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tickets' AND column_name = 'predicted_categories'
  ) THEN
    ALTER TABLE tickets ADD COLUMN predicted_categories ticket_category[];
  END IF;
END $$;


