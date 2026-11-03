-- Phase 11: durable, reviewable privacy-erasure workflow with restart-safe
-- object deletion and non-PII completion evidence.

CREATE TABLE IF NOT EXISTS privacy_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  request_type TEXT NOT NULL DEFAULT 'Erasure' CHECK (request_type = 'Erasure'),
  status TEXT NOT NULL DEFAULT 'PendingReview' CHECK (status IN (
    'PendingReview', 'Approved', 'Processing', 'Blocked', 'Failed',
    'Completed', 'Cancelled'
  )),
  reason TEXT NOT NULL,
  reason_sha256 TEXT NOT NULL CHECK (reason_sha256 ~ '^[a-f0-9]{64}$'),
  verification_method TEXT NOT NULL DEFAULT 'STEP_UP_EMAIL'
    CHECK (verification_method = 'STEP_UP_EMAIL'),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  grace_ends_at TIMESTAMPTZ NOT NULL,
  reviewed_by TEXT REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  review_reason TEXT,
  processing_started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  legal_hold_reason TEXT,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  next_attempt_at TIMESTAMPTZ,
  last_error_code TEXT,
  coverage_version TEXT NOT NULL DEFAULT 'normalized-v1',
  completion_evidence JSONB NOT NULL DEFAULT '{}'
    CHECK (jsonb_typeof(completion_evidence) = 'object'),
  version INTEGER NOT NULL DEFAULT 0 CHECK (version >= 0),
  CHECK (grace_ends_at > requested_at),
  CHECK ((status = 'Completed') = (completed_at IS NOT NULL)),
  CHECK ((status = 'Cancelled') = (cancelled_at IS NOT NULL)),
  CHECK ((status = 'Blocked') = (legal_hold_reason IS NOT NULL)),
  CHECK (
    status NOT IN ('Approved', 'Processing', 'Blocked', 'Failed', 'Completed')
    OR (reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL AND length(trim(review_reason)) >= 10)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_privacy_one_active_request
  ON privacy_requests(user_id)
  WHERE status IN ('PendingReview', 'Approved', 'Processing', 'Blocked', 'Failed');
CREATE INDEX IF NOT EXISTS idx_privacy_requests_due
  ON privacy_requests(status, grace_ends_at, next_attempt_at);

CREATE TABLE IF NOT EXISTS privacy_erasure_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL REFERENCES privacy_requests(id) ON DELETE CASCADE,
  object_key TEXT,
  object_key_sha256 TEXT NOT NULL CHECK (object_key_sha256 ~ '^[a-f0-9]{64}$'),
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Deleted', 'Failed')),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_error_code TEXT,
  deleted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_privacy_object_key UNIQUE (request_id, object_key_sha256),
  CHECK (
    (status = 'Deleted' AND object_key IS NULL AND deleted_at IS NOT NULL)
    OR (status <> 'Deleted' AND object_key IS NOT NULL AND deleted_at IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_privacy_objects_work
  ON privacy_erasure_objects(request_id, status, updated_at);
