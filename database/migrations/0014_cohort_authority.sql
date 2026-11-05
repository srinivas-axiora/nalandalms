-- Phase 17: transactional cohort authority and serialized capacity checks.
-- The feature remains behind USE_PG_COURSES until staging reconciliation and
-- live concurrency verification pass.

CREATE TABLE IF NOT EXISTS cohorts (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  instructor_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 3 AND 200),
  description TEXT NOT NULL DEFAULT '' CHECK (length(description) <= 4000),
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  capacity INTEGER NOT NULL DEFAULT 100 CHECK (capacity BETWEEN 1 AND 10000),
  invite_code_hash TEXT NOT NULL UNIQUE
    CHECK (invite_code_hash ~ '^[a-f0-9]{64}$'),
  active BOOLEAN NOT NULL DEFAULT true,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_date IS NULL OR end_date > start_date)
);

ALTER TABLE enrollments
  ADD COLUMN IF NOT EXISTS cohort_id TEXT REFERENCES cohorts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_cohorts_course ON cohorts(course_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cohorts_instructor ON cohorts(instructor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enrollments_cohort ON enrollments(cohort_id)
  WHERE cohort_id IS NOT NULL;
