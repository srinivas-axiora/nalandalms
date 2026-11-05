-- Phase 13: transactional chapter authoring and learner progress authority.
-- The feature remains behind USE_PG_COURSES until the full learning workflow
-- has passed the production-like staging gate.

ALTER TABLE chapters
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

ALTER TABLE chapters
  DROP CONSTRAINT IF EXISTS chapters_version_positive,
  ADD CONSTRAINT chapters_version_positive CHECK (version >= 1);

ALTER TABLE learning_time_events
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS claimed_seconds INTEGER;

ALTER TABLE learning_time_events
  DROP CONSTRAINT IF EXISTS learning_time_events_idempotency_key_length,
  ADD CONSTRAINT learning_time_events_idempotency_key_length
    CHECK (idempotency_key IS NULL OR length(idempotency_key) BETWEEN 16 AND 128),
  DROP CONSTRAINT IF EXISTS learning_time_events_claimed_seconds_positive,
  ADD CONSTRAINT learning_time_events_claimed_seconds_positive
    CHECK (claimed_seconds IS NULL OR claimed_seconds > 0);

CREATE UNIQUE INDEX IF NOT EXISTS uq_learning_time_event_idempotency
  ON learning_time_events(user_id, course_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;
