-- Phase 10: durable public candidate links, anonymous sessions, grading and
-- proctor evidence. Bearer tokens are stored only as SHA-256 hashes.

CREATE TABLE IF NOT EXISTS candidate_assessment_links (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE CHECK (token_hash ~ '^[a-f0-9]{64}$'),
  token_hint TEXT NOT NULL CHECK (length(token_hint) BETWEEN 4 AND 16),
  assessment_id TEXT NOT NULL REFERENCES assessments(id),
  title TEXT NOT NULL,
  course_id TEXT NOT NULL REFERENCES courses(id),
  course_title TEXT NOT NULL,
  chapter_id TEXT REFERENCES chapters(id),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes BETWEEN 1 AND 360),
  pass_score NUMERIC(5,2) NOT NULL CHECK (pass_score > 0 AND pass_score <= 100),
  question_limit INTEGER NOT NULL CHECK (question_limit > 0),
  question_snapshot JSONB NOT NULL CHECK (
    jsonb_typeof(question_snapshot) = 'array' AND jsonb_array_length(question_snapshot) > 0
  ),
  proctoring_required BOOLEAN NOT NULL DEFAULT true,
  fullscreen_required BOOLEAN NOT NULL DEFAULT true,
  tab_switch_auto_submit BOOLEAN NOT NULL DEFAULT false,
  max_tab_switches INTEGER NOT NULL DEFAULT 3 CHECK (max_tab_switches BETWEEN 1 AND 10),
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Closed')),
  created_by TEXT NOT NULL REFERENCES users(id),
  created_by_name TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 0 CHECK (version >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_candidate_links_creator
  ON candidate_assessment_links(created_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidate_links_assessment
  ON candidate_assessment_links(assessment_id, created_at DESC);

CREATE TABLE IF NOT EXISTS candidate_assessment_submissions (
  id TEXT PRIMARY KEY,
  link_id TEXT NOT NULL REFERENCES candidate_assessment_links(id) ON DELETE CASCADE,
  attempt_token_hash TEXT NOT NULL UNIQUE CHECK (attempt_token_hash ~ '^[a-f0-9]{64}$'),
  candidate_name TEXT NOT NULL,
  candidate_email CITEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  submitted_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'InProgress' CHECK (status IN (
    'InProgress', 'Expired', 'PendingManualReview', 'Passed', 'Failed'
  )),
  trust_score INTEGER NOT NULL DEFAULT 100 CHECK (trust_score BETWEEN 0 AND 100),
  tab_switch_count INTEGER NOT NULL DEFAULT 0 CHECK (tab_switch_count >= 0),
  flags JSONB NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(flags) = 'array'),
  answers JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(answers) = 'object'),
  question_ids TEXT[] NOT NULL CHECK (cardinality(question_ids) > 0),
  score NUMERIC(8,2) NOT NULL DEFAULT 0,
  max_score NUMERIC(8,2) NOT NULL CHECK (max_score > 0),
  percentage NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (percentage BETWEEN 0 AND 100),
  passed BOOLEAN,
  requires_manual_review BOOLEAN NOT NULL DEFAULT false,
  ignored_proctoring BOOLEAN NOT NULL DEFAULT false,
  proctoring_status TEXT NOT NULL DEFAULT 'CLEAN',
  hiring_recommendation TEXT NOT NULL DEFAULT 'Not Shortlisted',
  evaluated_responses JSONB NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(evaluated_responses) = 'array'),
  category_breakdown JSONB NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(category_breakdown) = 'object'),
  auto_submitted_reason TEXT,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0 CHECK (time_spent_seconds >= 0),
  version INTEGER NOT NULL DEFAULT 0 CHECK (version >= 0),
  UNIQUE (link_id, candidate_email),
  CHECK (
    (status = 'InProgress' AND submitted_at IS NULL)
    OR (status <> 'InProgress' AND submitted_at IS NOT NULL)
  ),
  CHECK (
    (status = 'InProgress' AND passed IS NULL AND requires_manual_review = false)
    OR (status = 'Expired' AND passed IS NULL AND requires_manual_review = false)
    OR (status = 'PendingManualReview' AND passed IS NULL AND requires_manual_review = true)
    OR (status = 'Passed' AND passed = true AND requires_manual_review = false)
    OR (status = 'Failed' AND passed = false AND requires_manual_review = false)
  ),
  CHECK (
    (status = 'Expired' AND expired_at IS NOT NULL)
    OR (status <> 'Expired' AND expired_at IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_candidate_submissions_link
  ON candidate_assessment_submissions(link_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidate_submissions_status
  ON candidate_assessment_submissions(status, expires_at);

CREATE TABLE IF NOT EXISTS candidate_proctor_events (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL REFERENCES candidate_assessment_submissions(id) ON DELETE CASCADE,
  client_event_id TEXT NOT NULL CHECK (length(client_event_id) BETWEEN 8 AND 128),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  confidence NUMERIC(5,4) CHECK (confidence >= 0 AND confidence <= 1),
  trust_score_after INTEGER NOT NULL CHECK (trust_score_after BETWEEN 0 AND 100),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (submission_id, client_event_id)
);

CREATE INDEX IF NOT EXISTS idx_candidate_events_submission
  ON candidate_proctor_events(submission_id, created_at);
