-- Phase 8: align attempt/proctor persistence with the application contract and
-- add optimistic concurrency authority.

ALTER TABLE enrollments
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Enrolled',
  ADD COLUMN IF NOT EXISTS certificate_id TEXT;
ALTER TABLE enrollments
  DROP CONSTRAINT IF EXISTS enrollments_status_check;
ALTER TABLE enrollments
  ADD CONSTRAINT enrollments_status_check CHECK (status IN (
    'Enrolled', 'InProgress', 'ChaptersComplete', 'AssessmentEligible',
    'Passed', 'Failed', 'Certified'
  ));

ALTER TABLE assessment_answers
  DROP CONSTRAINT IF EXISTS assessment_answers_attempt_id_fkey;
ALTER TABLE proctoring_logs
  DROP CONSTRAINT IF EXISTS proctoring_logs_attempt_id_fkey;

ALTER TABLE assessment_attempts ALTER COLUMN status DROP DEFAULT;
ALTER TABLE assessment_attempts
  ALTER COLUMN id TYPE TEXT USING id::text,
  ALTER COLUMN status TYPE TEXT USING status::text;
ALTER TABLE assessment_attempts ALTER COLUMN status SET DEFAULT 'InProgress';

ALTER TABLE assessment_answers
  ALTER COLUMN attempt_id TYPE TEXT USING attempt_id::text;
ALTER TABLE proctoring_logs
  ALTER COLUMN id TYPE TEXT USING id::text,
  ALTER COLUMN attempt_id TYPE TEXT USING attempt_id::text,
  ALTER COLUMN event_type TYPE TEXT USING event_type::text;

ALTER TABLE assessment_answers
  ADD CONSTRAINT assessment_answers_attempt_id_fkey
  FOREIGN KEY (attempt_id) REFERENCES assessment_attempts(id) ON DELETE CASCADE;
ALTER TABLE proctoring_logs
  ADD CONSTRAINT proctoring_logs_attempt_id_fkey
  FOREIGN KEY (attempt_id) REFERENCES assessment_attempts(id) ON DELETE CASCADE;

ALTER TABLE assessment_attempts
  DROP CONSTRAINT IF EXISTS assessment_attempts_status_check;
ALTER TABLE assessment_attempts
  ADD CONSTRAINT assessment_attempts_status_check CHECK (status IN (
    'InProgress', 'Submitted', 'AutoSubmitted', 'PendingManualReview',
    'Evaluated', 'Passed', 'Failed', 'Paused', 'Terminated'
  ));

ALTER TABLE proctoring_logs
  DROP CONSTRAINT IF EXISTS proctoring_logs_event_type_check;
ALTER TABLE proctoring_logs
  ADD CONSTRAINT proctoring_logs_event_type_check CHECK (event_type IN (
    'FACE_ABSENT', 'MULTIPLE_FACES', 'GAZE_AWAY', 'DEVICE_DETECTED',
    'TAB_SWITCH', 'FULLSCREEN_EXIT', 'AUDIO_SPIKE', 'CAMERA_OFF',
    'MIC_OFF', 'COMPANION_DISCONNECTED', 'FACE_MISMATCH', 'NOISE'
  ));

ALTER TABLE assessment_attempts
  ADD COLUMN IF NOT EXISTS question_map JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS manual_grades JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS flags JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS warnings JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS video_chunks JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS companion JSONB,
  ADD COLUMN IF NOT EXISTS trust_score INTEGER NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_paused BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resumed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS terminated_reason TEXT,
  ADD COLUMN IF NOT EXISTS terminated_by TEXT REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS terminated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS assigned_proctor_id TEXT REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 0;

ALTER TABLE assessment_attempts
  DROP CONSTRAINT IF EXISTS assessment_attempts_trust_score_check,
  DROP CONSTRAINT IF EXISTS assessment_attempts_version_check;
ALTER TABLE assessment_attempts
  ADD CONSTRAINT assessment_attempts_trust_score_check CHECK (trust_score BETWEEN 0 AND 100),
  ADD CONSTRAINT assessment_attempts_version_check CHECK (version >= 0);

ALTER TABLE proctoring_logs
  ADD COLUMN IF NOT EXISTS confidence NUMERIC(4,3),
  ADD COLUMN IF NOT EXISTS capture_key TEXT,
  ADD COLUMN IF NOT EXISTS trust_score_after INTEGER;
ALTER TABLE proctoring_logs
  DROP CONSTRAINT IF EXISTS proctoring_logs_trust_score_after_check;
ALTER TABLE proctoring_logs
  ADD CONSTRAINT proctoring_logs_trust_score_after_check
  CHECK (trust_score_after BETWEEN 0 AND 100);

CREATE INDEX IF NOT EXISTS idx_attempts_active
  ON assessment_attempts(status, expires_at) WHERE status IN ('InProgress', 'Paused');
CREATE INDEX IF NOT EXISTS idx_attempts_pending_review
  ON assessment_attempts(status, submitted_at DESC) WHERE status = 'PendingManualReview';
