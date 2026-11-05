-- Phase 22: durable, retryable report artifact generation.

ALTER TABLE report_exports
  ADD COLUMN IF NOT EXISTS row_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS summary JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_error_code TEXT,
  ADD COLUMN IF NOT EXISTS next_attempt_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE report_exports DROP CONSTRAINT IF EXISTS report_exports_status_check;
ALTER TABLE report_exports ADD CONSTRAINT report_exports_status_check
  CHECK (status IN ('Queued', 'Prepared', 'Processing', 'Ready', 'Failed'));
ALTER TABLE report_exports DROP CONSTRAINT IF EXISTS report_exports_attempts_check;
ALTER TABLE report_exports ADD CONSTRAINT report_exports_attempts_check CHECK (attempts BETWEEN 0 AND 3);

CREATE INDEX IF NOT EXISTS idx_report_exports_due
  ON report_exports(status, next_attempt_at, created_at)
  WHERE status IN ('Queued', 'Prepared', 'Processing', 'Failed');
CREATE INDEX IF NOT EXISTS idx_report_exports_requester
  ON report_exports(requested_by, created_at DESC);
