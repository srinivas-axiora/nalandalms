-- Phase 2: durable payment order binding, idempotent settlement, and webhook replay protection.

CREATE TABLE IF NOT EXISTS payment_orders (
  order_id TEXT PRIMARY KEY,
  receipt TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL DEFAULT 'Razorpay',
  user_id TEXT NOT NULL REFERENCES users(id),
  course_id TEXT NOT NULL REFERENCES courses(id),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  status TEXT NOT NULL CHECK (status IN ('Created', 'Paid', 'Expired', 'Cancelled')),
  provider_payment_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  CHECK (expires_at > created_at),
  CHECK ((status = 'Paid') = (provider_payment_id IS NOT NULL AND paid_at IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_user_course
  ON payment_orders(user_id, course_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status_expiry
  ON payment_orders(status, expires_at);

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL UNIQUE REFERENCES payment_orders(order_id),
  provider_payment_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL REFERENCES users(id),
  course_id TEXT NOT NULL REFERENCES courses(id),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  status TEXT NOT NULL CHECK (status = 'Paid'),
  source TEXT NOT NULL CHECK (source IN ('Checkout', 'Webhook')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_course
  ON payment_transactions(user_id, course_id, created_at DESC);

CREATE TABLE IF NOT EXISTS payment_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  body_sha256 TEXT NOT NULL CHECK (body_sha256 ~ '^[a-f0-9]{64}$'),
  order_id TEXT,
  provider_payment_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('Processed', 'Ignored', 'Unmatched')),
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payment_webhook_events_order
  ON payment_webhook_events(order_id, received_at DESC);

CREATE OR REPLACE FUNCTION prevent_payment_order_binding_change()
RETURNS trigger AS $$
BEGIN
  IF NEW.order_id IS DISTINCT FROM OLD.order_id
     OR NEW.receipt IS DISTINCT FROM OLD.receipt
     OR NEW.provider IS DISTINCT FROM OLD.provider
     OR NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.course_id IS DISTINCT FROM OLD.course_id
     OR NEW.amount_cents IS DISTINCT FROM OLD.amount_cents
     OR NEW.currency IS DISTINCT FROM OLD.currency
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
     OR NEW.expires_at IS DISTINCT FROM OLD.expires_at THEN
    RAISE EXCEPTION 'payment order binding fields are immutable';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_payment_order_binding_immutable ON payment_orders;
CREATE TRIGGER trg_payment_order_binding_immutable
BEFORE UPDATE ON payment_orders
FOR EACH ROW EXECUTE FUNCTION prevent_payment_order_binding_change();
