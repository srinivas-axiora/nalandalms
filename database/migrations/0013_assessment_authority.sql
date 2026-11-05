-- Phase 14: transactional assessment/question authority and database-derived
-- attempt eligibility. The relational learning flag remains fail-closed.

ALTER TABLE assessments
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

ALTER TABLE assessments
  DROP CONSTRAINT IF EXISTS assessments_version_positive,
  ADD CONSTRAINT assessments_version_positive CHECK (version >= 1);

ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE questions
  DROP CONSTRAINT IF EXISTS questions_metadata_object,
  ADD CONSTRAINT questions_metadata_object CHECK (jsonb_typeof(metadata) = 'object'),
  DROP CONSTRAINT IF EXISTS questions_points_positive,
  ADD CONSTRAINT questions_points_positive CHECK (points > 0);

CREATE TABLE IF NOT EXISTS assessment_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  version INTEGER NOT NULL CHECK (version >= 1),
  snapshot JSONB NOT NULL CHECK (jsonb_typeof(snapshot) = 'object'),
  change_note TEXT NOT NULL,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (assessment_id, version)
);

CREATE INDEX IF NOT EXISTS idx_assessment_versions_assessment
  ON assessment_versions(assessment_id, version DESC);

ALTER TABLE assessment_attempts
  ADD COLUMN IF NOT EXISTS assessment_version INTEGER,
  ADD COLUMN IF NOT EXISTS duration_minutes_snapshot INTEGER,
  ADD COLUMN IF NOT EXISTS pass_score_snapshot NUMERIC(5,2);

UPDATE assessment_attempts attempt
SET assessment_version = COALESCE(attempt.assessment_version, assessment.version, 1),
    duration_minutes_snapshot = COALESCE(
      attempt.duration_minutes_snapshot, assessment.duration_minutes, 15
    ),
    pass_score_snapshot = COALESCE(
      attempt.pass_score_snapshot, assessment.pass_score, 70
    )
FROM assessments assessment
WHERE assessment.id = attempt.assessment_id
  AND (
    attempt.assessment_version IS NULL
    OR attempt.duration_minutes_snapshot IS NULL
    OR attempt.pass_score_snapshot IS NULL
  );

UPDATE assessment_attempts
SET assessment_version = COALESCE(assessment_version, 1),
    duration_minutes_snapshot = COALESCE(duration_minutes_snapshot, 15),
    pass_score_snapshot = COALESCE(pass_score_snapshot, 70)
WHERE assessment_version IS NULL
   OR duration_minutes_snapshot IS NULL
   OR pass_score_snapshot IS NULL;

ALTER TABLE assessment_attempts
  ALTER COLUMN assessment_version SET DEFAULT 1,
  ALTER COLUMN assessment_version SET NOT NULL,
  ALTER COLUMN duration_minutes_snapshot SET DEFAULT 15,
  ALTER COLUMN duration_minutes_snapshot SET NOT NULL,
  ALTER COLUMN pass_score_snapshot SET DEFAULT 70,
  ALTER COLUMN pass_score_snapshot SET NOT NULL,
  DROP CONSTRAINT IF EXISTS assessment_attempts_assessment_version_positive,
  ADD CONSTRAINT assessment_attempts_assessment_version_positive
    CHECK (assessment_version >= 1),
  DROP CONSTRAINT IF EXISTS assessment_attempts_duration_snapshot_valid,
  ADD CONSTRAINT assessment_attempts_duration_snapshot_valid
    CHECK (duration_minutes_snapshot BETWEEN 1 AND 360),
  DROP CONSTRAINT IF EXISTS assessment_attempts_pass_score_snapshot_valid,
  ADD CONSTRAINT assessment_attempts_pass_score_snapshot_valid
    CHECK (pass_score_snapshot BETWEEN 1 AND 100);

CREATE UNIQUE INDEX IF NOT EXISTS uq_active_assessment_attempt
  ON assessment_attempts(assessment_id, user_id)
  WHERE status IN ('InProgress', 'Paused');
