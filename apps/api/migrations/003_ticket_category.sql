DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_category') THEN
    CREATE TYPE ticket_category AS ENUM (
      'General',
      'Billing',
      'Account_Access',
      'Technical',
      'Security',
      'Product',
      'Feedback'
    );
  END IF;
END $$;

-- Migrate predicted_category to use the enum type if the column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tickets' AND column_name = 'predicted_category'
  ) THEN
    BEGIN
      ALTER TABLE tickets
        ALTER COLUMN predicted_category TYPE ticket_category
        USING (predicted_category::ticket_category);
    EXCEPTION WHEN others THEN
      -- If existing values are not in enum, keep as text
      RAISE NOTICE 'Skipping predicted_category type change due to incompatible values.';
    END;
  END IF;
END $$;


