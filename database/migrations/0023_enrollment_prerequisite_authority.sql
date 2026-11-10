-- Phase 67 — server-authoritative course prerequisite eligibility.

ALTER TABLE payment_orders
  ADD COLUMN IF NOT EXISTS course_version INTEGER,
  ADD COLUMN IF NOT EXISTS prerequisite_ids TEXT[],
  ADD COLUMN IF NOT EXISTS eligibility_bound_at TIMESTAMPTZ;

-- Orders created by older code have no trustworthy eligibility snapshot.
-- Expire only unsettled orders; paid ledger evidence remains unchanged.
UPDATE payment_orders
SET status = 'Expired', updated_at = now()
WHERE status = 'Created'
  AND (course_version IS NULL OR prerequisite_ids IS NULL OR eligibility_bound_at IS NULL);

CREATE OR REPLACE FUNCTION require_payment_order_eligibility_binding()
RETURNS trigger AS $$
BEGIN
  IF NEW.course_version IS NULL
     OR NEW.prerequisite_ids IS NULL
     OR NEW.eligibility_bound_at IS NULL THEN
    RAISE EXCEPTION 'payment order eligibility binding is required';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_payment_order_eligibility_required ON payment_orders;
CREATE TRIGGER trg_payment_order_eligibility_required
BEFORE INSERT ON payment_orders
FOR EACH ROW EXECUTE FUNCTION require_payment_order_eligibility_binding();

CREATE OR REPLACE FUNCTION prevent_payment_order_binding_change()
RETURNS trigger AS $$
BEGIN
  IF NEW.order_id IS DISTINCT FROM OLD.order_id
     OR NEW.receipt IS DISTINCT FROM OLD.receipt
     OR NEW.provider IS DISTINCT FROM OLD.provider
     OR NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.course_id IS DISTINCT FROM OLD.course_id
     OR NEW.course_version IS DISTINCT FROM OLD.course_version
     OR NEW.prerequisite_ids IS DISTINCT FROM OLD.prerequisite_ids
     OR NEW.eligibility_bound_at IS DISTINCT FROM OLD.eligibility_bound_at
     OR NEW.amount_cents IS DISTINCT FROM OLD.amount_cents
     OR NEW.currency IS DISTINCT FROM OLD.currency
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
     OR NEW.expires_at IS DISTINCT FROM OLD.expires_at THEN
    RAISE EXCEPTION 'payment order binding fields are immutable';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
