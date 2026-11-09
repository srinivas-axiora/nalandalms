-- Phase 50: normalize Copilot attendance, performance-review and internal
-- communication state so course cutover is safe across multiple API tasks.

CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  check_in_at TIMESTAMPTZ NOT NULL,
  check_out_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'Present'
    CHECK (status IN ('Present', 'Absent', 'Leave')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_attendance_user_date UNIQUE (user_id, attendance_date),
  CHECK (check_out_at IS NULL OR check_out_at >= check_in_at)
);

CREATE INDEX IF NOT EXISTS idx_attendance_user_date
  ON attendance_records(user_id, attendance_date DESC);

CREATE TABLE IF NOT EXISTS performance_reviews (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  reviewer_name TEXT NOT NULL CHECK (char_length(trim(reviewer_name)) BETWEEN 1 AND 200),
  review_date DATE NOT NULL,
  rating NUMERIC(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comments TEXT NOT NULL CHECK (char_length(comments) BETWEEN 1 AND 4000),
  goals TEXT NOT NULL CHECK (char_length(goals) BETWEEN 1 AND 8000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_performance_reviews_user_date
  ON performance_reviews(user_id, review_date DESC, id);

CREATE TABLE IF NOT EXISTS workplace_communications (
  id TEXT PRIMARY KEY,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL CHECK (char_length(trim(sender_name)) BETWEEN 1 AND 200),
  recipient_id TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'Direct'
    CHECK (kind IN ('Direct', 'Announcement', 'SelfAppraisal')),
  content TEXT NOT NULL CHECK (char_length(trim(content)) BETWEEN 1 AND 4000),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((kind = 'Announcement') = (recipient_id = 'ALL'))
);

CREATE INDEX IF NOT EXISTS idx_workplace_communications_recipient
  ON workplace_communications(recipient_id, sent_at DESC, id);
CREATE INDEX IF NOT EXISTS idx_workplace_communications_sender
  ON workplace_communications(sender_id, sent_at DESC, id);

-- New stores expand privacy coverage. Never allow an in-flight erasure to
-- complete under the old acknowledgement. Reviewed but unfinished work must be
-- explicitly reviewed again after deployment.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM privacy_requests WHERE status = 'Processing') THEN
    RAISE EXCEPTION 'cannot apply workplace privacy coverage while an erasure is Processing';
  END IF;
END $$;

UPDATE privacy_requests SET
  status = 'PendingReview', reviewed_by = NULL, reviewed_at = NULL,
  review_reason = NULL, legal_hold_reason = NULL, next_attempt_at = NULL,
  last_error_code = NULL, coverage_version = 'normalized-v2', version = version + 1
WHERE status IN ('PendingReview', 'Approved', 'Blocked', 'Failed');

ALTER TABLE privacy_requests
  ALTER COLUMN coverage_version SET DEFAULT 'normalized-v2';
