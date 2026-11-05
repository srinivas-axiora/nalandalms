-- Phase 12: fields and invariants required by the transactional learning
-- content/enrollment authority. Existing feature flags remain disabled until
-- backfill, reconciliation and the live verifier pass.

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS content_types TEXT[] NOT NULL DEFAULT ARRAY['Rich Text']::text[],
  ADD COLUMN IF NOT EXISTS storage_metadata JSONB NOT NULL DEFAULT '{"files":[]}'::jsonb;

ALTER TABLE enrollments
  ADD COLUMN IF NOT EXISTS chapter_heartbeat_timestamps JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS video_progress JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS last_heartbeat_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 0;

ALTER TABLE courses
  DROP CONSTRAINT IF EXISTS courses_storage_metadata_object,
  ADD CONSTRAINT courses_storage_metadata_object
    CHECK (jsonb_typeof(storage_metadata) = 'object');

ALTER TABLE enrollments
  DROP CONSTRAINT IF EXISTS enrollments_heartbeat_timestamps_object,
  ADD CONSTRAINT enrollments_heartbeat_timestamps_object
    CHECK (jsonb_typeof(chapter_heartbeat_timestamps) = 'object'),
  DROP CONSTRAINT IF EXISTS enrollments_video_progress_object,
  ADD CONSTRAINT enrollments_video_progress_object
    CHECK (jsonb_typeof(video_progress) = 'object'),
  DROP CONSTRAINT IF EXISTS enrollments_version_nonnegative,
  ADD CONSTRAINT enrollments_version_nonnegative CHECK (version >= 0);

CREATE INDEX IF NOT EXISTS idx_courses_owner ON courses(owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enrollments_assigned_by ON enrollments(assigned_by, started_at DESC);
