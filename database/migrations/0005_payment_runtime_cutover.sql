-- Phase 6: make the relational payment ledger usable by the application.
-- The base schema must be loaded before forward migrations (see
-- docs/POSTGRES-MIGRATION.md).

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS price_cents INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'INR';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'courses_price_cents_nonnegative'
  ) THEN
    ALTER TABLE courses
      ADD CONSTRAINT courses_price_cents_nonnegative CHECK (price_cents >= 0);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'courses_currency_iso4217'
  ) THEN
    ALTER TABLE courses
      ADD CONSTRAINT courses_currency_iso4217 CHECK (currency ~ '^[A-Z]{3}$');
  END IF;
END $$;

-- At most one reusable checkout order may be open for a learner/course pair.
-- Expired rows are transitioned before a replacement is inserted.
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_orders_one_open
  ON payment_orders(user_id, course_id) WHERE status = 'Created';
