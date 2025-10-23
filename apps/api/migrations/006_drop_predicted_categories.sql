-- Revert multi-category support: drop predicted_categories if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tickets' AND column_name = 'predicted_categories'
  ) THEN
    ALTER TABLE tickets DROP COLUMN predicted_categories;
  END IF;
END $$;


