-- Nalanda Training & Development PostgreSQL schema
-- Designed for RBAC, immutable audit history, course versioning, strict assessments, and reporting.
-- Updated: includes login security, session versioning, certificates, archive, and Super Admin role.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE user_role AS ENUM ('Super Admin', 'Admin', 'InstituteAdmin', 'Manager', 'Instructor', 'Employee', 'Learner');
CREATE TYPE lifecycle_status AS ENUM ('Active', 'Inactive');
CREATE TYPE approval_status AS ENUM ('Draft', 'Pending', 'Approved', 'Rejected');
CREATE TYPE assessment_type AS ENUM ('MCQ', 'Descriptive', 'Timed Quiz', 'Mixed');

CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email CITEXT NOT NULL UNIQUE,
  password_hash TEXT,
  role user_role NOT NULL DEFAULT 'Employee',
  login_id TEXT GENERATED ALWAYS AS (
    CASE WHEN role = 'Super Admin'::user_role THEN 'Super Admin' ELSE email::TEXT END
  ) STORED UNIQUE,
  department_id UUID REFERENCES departments(id),
  team TEXT NOT NULL DEFAULT 'Unassigned',
  designation TEXT NOT NULL DEFAULT 'Employee',
  manager_id TEXT REFERENCES users(id),
  status lifecycle_status NOT NULL DEFAULT 'Active',
  session_version INTEGER NOT NULL DEFAULT 0,
  preferences JSONB NOT NULL DEFAULT '{}',
  joined_at DATE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT users_not_self_managed CHECK (manager_id IS NULL OR manager_id <> id)
);

CREATE INDEX idx_users_role_status ON users(role, status);
CREATE INDEX idx_users_manager ON users(manager_id);
CREATE INDEX idx_users_department ON users(department_id);

COMMENT ON COLUMN users.login_id IS 'Super Admin signs in with "Super Admin"; all other users sign in with their email address.';
COMMENT ON COLUMN users.password_hash IS 'Store bcrypt hashes only. Seed/demo passwords are supplied via SEED_*_PASSWORD environment variables and must be rotated before production use.';

-- Every account trust change invalidates all previously issued JWTs.
-- Tokens carry the user's session_version claim and the API rejects mismatches.
CREATE OR REPLACE FUNCTION revoke_user_sessions_on_trust_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status
     OR OLD.role IS DISTINCT FROM NEW.role
     OR OLD.password_hash IS DISTINCT FROM NEW.password_hash THEN
    NEW.session_version := GREATEST(OLD.session_version + 1, NEW.session_version);
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_revoke_user_sessions_on_trust_change
BEFORE UPDATE OF status, role, password_hash ON users
FOR EACH ROW
EXECUTE FUNCTION revoke_user_sessions_on_trust_change();

-- ── Login Security ──
-- Tracks failed login attempts and account lockouts per email
CREATE TABLE login_security (
  email CITEXT PRIMARY KEY,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_failed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Rate Limiting ──
-- Tracks API request timestamps for sliding-window rate limiting
CREATE TABLE rate_limit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  endpoint TEXT NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rate_limit_ip_endpoint ON rate_limit_log(ip_address, endpoint, requested_at DESC);

-- Periodically clean old entries (older than 5 minutes)
-- Run via pg_cron or application-level cleanup:
-- DELETE FROM rate_limit_log WHERE requested_at < now() - INTERVAL '5 minutes';

CREATE TABLE skills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'Technical'
    CHECK (category IN ('Technical', 'Functional', 'Leadership', 'Compliance', 'Behavioral')),
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_skills_name_lower ON skills (lower(name));

CREATE TABLE target_skills (
  id TEXT PRIMARY KEY,
  skill_id TEXT NOT NULL REFERENCES skills(id),
  scope TEXT NOT NULL CHECK (scope IN ('Organization', 'Department', 'Role', 'Employee')),
  department TEXT,
  designation TEXT,
  user_id TEXT REFERENCES users(id),
  target_level TEXT NOT NULL DEFAULT 'Intermediate'
    CHECK (target_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  target_score INTEGER NOT NULL DEFAULT 80 CHECK (target_score >= 0 AND target_score <= 100),
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_target_skills_scope ON target_skills(scope, department);
CREATE INDEX idx_target_skills_skill ON target_skills(skill_id);

CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  skill TEXT NOT NULL DEFAULT '',
  skill_ids TEXT[] NOT NULL DEFAULT '{}',
  target_level TEXT NOT NULL DEFAULT 'Intermediate',
  prerequisites TEXT[] NOT NULL DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'General',
  tags TEXT[] NOT NULL DEFAULT '{}',
  thumbnail_color TEXT NOT NULL DEFAULT '#22d3ee',
  content_types TEXT[] NOT NULL DEFAULT ARRAY['Rich Text']::text[],
  storage_metadata JSONB NOT NULL DEFAULT '{"files":[]}'::jsonb
    CONSTRAINT courses_storage_metadata_object
    CHECK (jsonb_typeof(storage_metadata) = 'object'),
  status lifecycle_status NOT NULL DEFAULT 'Active',
  approval approval_status NOT NULL DEFAULT 'Draft',
  owner_id TEXT NOT NULL REFERENCES users(id),
  current_version INTEGER NOT NULL DEFAULT 1,
  difficulty TEXT NOT NULL DEFAULT 'Beginner',
  estimated_hours NUMERIC(5,1) NOT NULL DEFAULT 1,
  price_cents INTEGER NOT NULL DEFAULT 0
    CONSTRAINT courses_price_cents_nonnegative CHECK (price_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'INR'
    CONSTRAINT courses_currency_iso4217 CHECK (currency ~ '^[A-Z]{3}$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_courses_status_approval ON courses(status, approval);
CREATE INDEX idx_courses_skill ON courses(skill);
CREATE INDEX idx_courses_owner ON courses(owner_id, created_at DESC);

CREATE TABLE course_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT NOT NULL REFERENCES courses(id),
  version INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  change_note TEXT,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, version)
);

-- ── Chapters ──
CREATE TABLE chapters (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  content_type TEXT NOT NULL DEFAULT 'Rich Text'
    CHECK (content_type IN ('Rich Text', 'PDF', 'Video Link')),
  body TEXT NOT NULL DEFAULT '',
  url TEXT,
  file_name TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 10,
  minimum_time_minutes INTEGER NOT NULL DEFAULT 1 CHECK (minimum_time_minutes >= 0),
  version INTEGER NOT NULL DEFAULT 1
    CONSTRAINT chapters_version_positive CHECK (version >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chapters_course ON chapters(course_id, sequence);
COMMENT ON COLUMN chapters.minimum_time_minutes IS 'Minimum learner time required before the chapter completion/next gate can be satisfied.';

CREATE TABLE course_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT NOT NULL REFERENCES courses(id),
  version INTEGER NOT NULL,
  requested_by TEXT NOT NULL REFERENCES users(id),
  reviewed_by TEXT REFERENCES users(id),
  status approval_status NOT NULL DEFAULT 'Pending',
  feedback TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

-- ── Enrollments ──
CREATE TABLE enrollments (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  assigned_by TEXT NOT NULL REFERENCES users(id),
  due_at DATE,
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  mandatory BOOLEAN NOT NULL DEFAULT false,
  progress NUMERIC(5,2) NOT NULL DEFAULT 0,
  completed_chapters TEXT[] NOT NULL DEFAULT '{}',
  time_spent_minutes INTEGER NOT NULL DEFAULT 0,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  chapter_time_spent_total_seconds INTEGER NOT NULL DEFAULT 0,
  assessment_time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  chapter_time_spent_seconds JSONB NOT NULL DEFAULT '{}',
  chapter_heartbeat_timestamps JSONB NOT NULL DEFAULT '{}'
    CONSTRAINT enrollments_heartbeat_timestamps_object
    CHECK (jsonb_typeof(chapter_heartbeat_timestamps) = 'object'),
  video_progress JSONB NOT NULL DEFAULT '{}'
    CONSTRAINT enrollments_video_progress_object
    CHECK (jsonb_typeof(video_progress) = 'object'),
  last_heartbeat_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'Enrolled' CHECK (status IN (
    'Enrolled', 'InProgress', 'ChaptersComplete', 'AssessmentEligible',
    'Passed', 'Failed', 'Certified'
  )),
  certificate_id TEXT,
  version INTEGER NOT NULL DEFAULT 0
    CONSTRAINT enrollments_version_nonnegative CHECK (version >= 0),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  CHECK (time_spent_seconds >= 0),
  CHECK (chapter_time_spent_total_seconds >= 0),
  CHECK (assessment_time_spent_seconds >= 0),
  UNIQUE(course_id, user_id)
);

CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_assigned_by ON enrollments(assigned_by, started_at DESC);
COMMENT ON COLUMN enrollments.time_spent_seconds IS 'Course total time in seconds. Includes chapter learning time plus assessment attempt time.';
COMMENT ON COLUMN enrollments.chapter_time_spent_seconds IS 'Denormalized API cache keyed by chapter_id. Canonical reporting rows are stored in chapter_time_totals.';

CREATE TABLE chapter_time_totals (
  user_id TEXT NOT NULL REFERENCES users(id),
  course_id TEXT NOT NULL REFERENCES courses(id),
  chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0 CHECK (time_spent_seconds >= 0),
  first_recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, course_id, chapter_id),
  FOREIGN KEY (course_id, user_id) REFERENCES enrollments(course_id, user_id) ON DELETE CASCADE
);

CREATE INDEX idx_chapter_time_course ON chapter_time_totals(course_id, chapter_id);
COMMENT ON TABLE chapter_time_totals IS 'Per-learner per-chapter accumulated learning time used for gates and reporting.';

CREATE TABLE assessments (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id),
  chapter_id TEXT REFERENCES chapters(id),
  title TEXT NOT NULL,
  type assessment_type NOT NULL,
  strict_mode BOOLEAN NOT NULL DEFAULT true,
  duration_minutes INTEGER NOT NULL,
  pass_score NUMERIC(5,2) NOT NULL CHECK (pass_score >= 0 AND pass_score <= 100),
  question_limit INTEGER,
  difficulty TEXT NOT NULL DEFAULT 'Beginner',
  approval approval_status NOT NULL DEFAULT 'Draft',
  status lifecycle_status NOT NULL DEFAULT 'Active',
  owner_id TEXT NOT NULL REFERENCES users(id),
  version INTEGER NOT NULL DEFAULT 1
    CONSTRAINT assessments_version_positive CHECK (version >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assessments_course ON assessments(course_id);
CREATE INDEX idx_assessments_chapter ON assessments(chapter_id);
CREATE INDEX idx_assessments_approval ON assessments(approval);
CREATE INDEX idx_assessments_status ON assessments(status);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('MCQ', 'Descriptive')),
  prompt TEXT NOT NULL,
  options JSONB,
  correct_answer JSONB,
  points NUMERIC(6,2) NOT NULL DEFAULT 10,
  sort_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'
    CONSTRAINT questions_metadata_object CHECK (jsonb_typeof(metadata) = 'object'),
  CONSTRAINT questions_points_positive CHECK (points > 0)
);

CREATE TABLE assessment_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  version INTEGER NOT NULL CHECK (version >= 1),
  snapshot JSONB NOT NULL CHECK (jsonb_typeof(snapshot) = 'object'),
  change_note TEXT NOT NULL,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (assessment_id, version)
);

CREATE INDEX idx_assessment_versions_assessment
  ON assessment_versions(assessment_id, version DESC);

CREATE TABLE assessment_attempts (
  id TEXT PRIMARY KEY,
  assessment_id TEXT NOT NULL REFERENCES assessments(id),
  chapter_id TEXT REFERENCES chapters(id),
  course_id TEXT REFERENCES courses(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  assessment_version INTEGER NOT NULL DEFAULT 1 CHECK (assessment_version >= 1),
  duration_minutes_snapshot INTEGER NOT NULL DEFAULT 15
    CHECK (duration_minutes_snapshot BETWEEN 1 AND 360),
  pass_score_snapshot NUMERIC(5,2) NOT NULL DEFAULT 70
    CHECK (pass_score_snapshot BETWEEN 1 AND 100),
  status TEXT NOT NULL DEFAULT 'InProgress' CHECK (status IN (
    'InProgress', 'Submitted', 'AutoSubmitted', 'PendingManualReview',
    'Evaluated', 'Passed', 'Failed', 'Paused', 'Terminated'
  )),
  score NUMERIC(5,2),
  max_score NUMERIC(5,2),
  feedback TEXT,
  answers JSONB NOT NULL DEFAULT '{}',
  selected_question_ids TEXT[] NOT NULL DEFAULT '{}',
  question_map JSONB NOT NULL DEFAULT '{}',
  manual_grades JSONB NOT NULL DEFAULT '{}',
  flags JSONB NOT NULL DEFAULT '[]',
  warnings JSONB NOT NULL DEFAULT '[]',
  video_chunks JSONB NOT NULL DEFAULT '[]',
  companion JSONB,
  trust_score INTEGER NOT NULL DEFAULT 100 CHECK (trust_score BETWEEN 0 AND 100),
  tab_switch_warnings INTEGER NOT NULL DEFAULT 0,
  auto_submitted_reason TEXT,
  expires_at TIMESTAMPTZ,
  is_paused BOOLEAN NOT NULL DEFAULT false,
  paused_at TIMESTAMPTZ,
  resumed_at TIMESTAMPTZ,
  terminated_reason TEXT,
  terminated_by TEXT REFERENCES users(id),
  terminated_at TIMESTAMPTZ,
  assigned_proctor_id TEXT REFERENCES users(id),
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  evaluated_by TEXT REFERENCES users(id),
  version INTEGER NOT NULL DEFAULT 0 CHECK (version >= 0)
);

CREATE INDEX idx_attempts_user ON assessment_attempts(user_id, started_at DESC);
CREATE INDEX idx_attempts_assessment ON assessment_attempts(assessment_id);
CREATE UNIQUE INDEX uq_active_assessment_attempt
  ON assessment_attempts(assessment_id, user_id)
  WHERE status IN ('InProgress', 'Paused');

-- ── Public Candidate Assessment Runtime ──
-- Bearer link/session tokens are persisted only as SHA-256 hashes.
CREATE TABLE candidate_assessment_links (
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

CREATE INDEX idx_candidate_links_creator ON candidate_assessment_links(created_by, created_at DESC);
CREATE INDEX idx_candidate_links_assessment ON candidate_assessment_links(assessment_id, created_at DESC);

CREATE TABLE candidate_assessment_submissions (
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

CREATE INDEX idx_candidate_submissions_link ON candidate_assessment_submissions(link_id, started_at DESC);
CREATE INDEX idx_candidate_submissions_status ON candidate_assessment_submissions(status, expires_at);

CREATE TABLE candidate_proctor_events (
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

CREATE INDEX idx_candidate_events_submission ON candidate_proctor_events(submission_id, created_at);

CREATE TABLE learning_time_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  course_id TEXT NOT NULL REFERENCES courses(id),
  chapter_id TEXT REFERENCES chapters(id),
  assessment_id TEXT REFERENCES assessments(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('CHAPTER_TIME', 'ASSESSMENT_TIME')),
  seconds_spent INTEGER NOT NULL CHECK (seconds_spent > 0),
  idempotency_key TEXT
    CONSTRAINT learning_time_events_idempotency_key_length
    CHECK (idempotency_key IS NULL OR length(idempotency_key) BETWEEN 16 AND 128),
  claimed_seconds INTEGER
    CONSTRAINT learning_time_events_claimed_seconds_positive
    CHECK (claimed_seconds IS NULL OR claimed_seconds > 0),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_learning_time_user_course ON learning_time_events(user_id, course_id, recorded_at DESC);
CREATE INDEX idx_learning_time_chapter ON learning_time_events(chapter_id, recorded_at DESC);
CREATE INDEX idx_learning_time_assessment ON learning_time_events(assessment_id, recorded_at DESC);
CREATE UNIQUE INDEX uq_learning_time_event_idempotency
  ON learning_time_events(user_id, course_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE TABLE assessment_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id TEXT NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id),
  answer JSONB NOT NULL,
  auto_score NUMERIC(6,2),
  manual_score NUMERIC(6,2),
  feedback TEXT,
  UNIQUE(attempt_id, question_id)
);

-- ── Proctoring ──
CREATE TABLE proctoring_logs (
  id TEXT PRIMARY KEY,
  attempt_id TEXT NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'FACE_ABSENT', 'MULTIPLE_FACES', 'GAZE_AWAY', 'DEVICE_DETECTED',
    'TAB_SWITCH', 'FULLSCREEN_EXIT', 'AUDIO_SPIKE', 'CAMERA_OFF',
    'MIC_OFF', 'COMPANION_DISCONNECTED', 'FACE_MISMATCH', 'NOISE'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  confidence NUMERIC(4,3),
  capture_key TEXT,
  trust_score_after INTEGER CHECK (trust_score_after BETWEEN 0 AND 100),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_proctoring_attempt ON proctoring_logs(attempt_id, created_at DESC);

-- ── Proctor Captures (webcam snapshots during assessments) ──
CREATE TABLE proctor_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id TEXT NOT NULL REFERENCES assessments(id),
  course_id TEXT REFERENCES courses(id),
  chapter_id TEXT REFERENCES chapters(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  question_id UUID REFERENCES questions(id),
  image_data_url TEXT NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Chapter Feedback ──
CREATE TABLE chapter_feedbacks (
  id TEXT PRIMARY KEY,
  chapter_id TEXT NOT NULL REFERENCES chapters(id),
  course_id TEXT NOT NULL REFERENCES courses(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  clarity INTEGER NOT NULL CHECK (clarity BETWEEN 1 AND 5),
  relevance INTEGER NOT NULL CHECK (relevance BETWEEN 1 AND 5),
  comments TEXT NOT NULL DEFAULT '',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(chapter_id, user_id)
);

-- ── Skill Ratings ──
CREATE TABLE skill_ratings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  skill TEXT NOT NULL,
  score NUMERIC(5,2) NOT NULL DEFAULT 0,
  assessments_based INTEGER NOT NULL DEFAULT 0,
  trend TEXT NOT NULL DEFAULT 'stable' CHECK (trend IN ('up', 'down', 'stable')),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill)
);

CREATE INDEX idx_skill_ratings_user ON skill_ratings(user_id);

-- ── Settings ──
CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_by TEXT REFERENCES users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Reports ──
CREATE TABLE report_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by TEXT NOT NULL REFERENCES users(id),
  report_type TEXT NOT NULL CHECK (report_type IN ('User', 'Team', 'Course')),
  format TEXT NOT NULL CHECK (format IN ('PDF', 'Excel')),
  filters JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'Queued',
  storage_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- ── Audit Logs ──
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_audit_actor ON audit_logs(actor_id, created_at DESC);

-- ── Deletion Archive ──
-- Super Admin only: stores full entity snapshots with mandatory deletion reason
CREATE TABLE deleted_archives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('User', 'Course', 'Assessment')),
  entity_id TEXT NOT NULL,
  entity_data JSONB NOT NULL,
  related_data JSONB NOT NULL DEFAULT '{}',
  deleted_by TEXT NOT NULL REFERENCES users(id),
  deleted_by_name TEXT NOT NULL DEFAULT '',
  deletion_comment TEXT NOT NULL CHECK (length(trim(deletion_comment)) >= 10),
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_archives_entity ON deleted_archives(entity_type, deleted_at DESC);
CREATE INDEX idx_archives_deleted_by ON deleted_archives(deleted_by);

-- ── Privacy Erasure Workflow ──
CREATE TABLE privacy_requests (
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

CREATE UNIQUE INDEX idx_privacy_one_active_request
  ON privacy_requests(user_id)
  WHERE status IN ('PendingReview', 'Approved', 'Processing', 'Blocked', 'Failed');
CREATE INDEX idx_privacy_requests_due
  ON privacy_requests(status, grace_ends_at, next_attempt_at);

CREATE TABLE privacy_erasure_objects (
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

CREATE INDEX idx_privacy_objects_work
  ON privacy_erasure_objects(request_id, status, updated_at);

-- ── Issued Certificates ──
-- Certificates generated by Admin/Super Admin and sent to employees
CREATE TABLE issued_certificates (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL REFERENCES users(id),
  course_id TEXT NOT NULL REFERENCES courses(id),
  attempt_id TEXT REFERENCES assessment_attempts(id),
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  course_title TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Certificate of Completion',
  template TEXT NOT NULL DEFAULT 'Executive',
  accent TEXT NOT NULL DEFAULT '#0f766e',
  duration TEXT NOT NULL DEFAULT '',
  subtitle TEXT NOT NULL DEFAULT '',
  footer TEXT NOT NULL DEFAULT '',
  issued_by TEXT NOT NULL REFERENCES users(id),
  issued_by_name TEXT NOT NULL DEFAULT '',
  html_snapshot TEXT NOT NULL DEFAULT '',
  proctoring_verified BOOLEAN NOT NULL DEFAULT false,
  exam_score NUMERIC(5,2),
  signature_version INTEGER NOT NULL DEFAULT 2 CHECK (signature_version IN (1, 2)),
  signature TEXT NOT NULL CHECK (signature ~ '^[a-f0-9]{64}$'),
  verification_url TEXT NOT NULL,
  linkedin_share_url TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Revoked')),
  revoked_by TEXT REFERENCES users(id),
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (status = 'Active' AND revoked_by IS NULL AND revoked_at IS NULL AND revocation_reason IS NULL)
    OR
    (status = 'Revoked' AND revoked_by IS NOT NULL AND revoked_at IS NOT NULL AND length(trim(revocation_reason)) >= 10)
  )
);

CREATE INDEX idx_certificates_employee ON issued_certificates(employee_id);
CREATE INDEX idx_certificates_course ON issued_certificates(course_id);
CREATE INDEX idx_certificates_issued_by ON issued_certificates(issued_by);
CREATE INDEX idx_certificates_status ON issued_certificates(status, issued_at DESC);
CREATE UNIQUE INDEX idx_certificates_one_active_per_course
  ON issued_certificates(employee_id, course_id) WHERE status = 'Active';

-- ── Payment integrity ledger ──
CREATE TABLE payment_orders (
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

CREATE INDEX idx_payment_orders_user_course ON payment_orders(user_id, course_id, created_at DESC);
CREATE INDEX idx_payment_orders_status_expiry ON payment_orders(status, expires_at);
CREATE UNIQUE INDEX idx_payment_orders_one_open
  ON payment_orders(user_id, course_id) WHERE status = 'Created';

CREATE TABLE payment_transactions (
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

CREATE INDEX idx_payment_transactions_user_course ON payment_transactions(user_id, course_id, created_at DESC);

CREATE TABLE payment_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  body_sha256 TEXT NOT NULL CHECK (body_sha256 ~ '^[a-f0-9]{64}$'),
  order_id TEXT,
  provider_payment_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('Processed', 'Ignored', 'Unmatched')),
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_payment_webhook_events_order ON payment_webhook_events(order_id, received_at DESC);

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

CREATE TRIGGER trg_payment_order_binding_immutable
BEFORE UPDATE ON payment_orders
FOR EACH ROW EXECUTE FUNCTION prevent_payment_order_binding_change();

-- ── Analytics View ──
CREATE VIEW analytics_learning_time AS
SELECT
  e.user_id,
  e.course_id,
  ctt.chapter_id,
  ch.title AS chapter_title,
  ch.minimum_time_minutes * 60 AS minimum_time_seconds,
  ctt.time_spent_seconds AS chapter_time_seconds,
  COALESCE(assessment_time.assessment_time_seconds, 0) AS assessment_time_seconds,
  e.time_spent_seconds AS course_time_seconds,
  ctt.time_spent_seconds >= (ch.minimum_time_minutes * 60) AS minimum_time_met
FROM enrollments e
JOIN chapter_time_totals ctt
  ON ctt.user_id = e.user_id
  AND ctt.course_id = e.course_id
JOIN chapters ch ON ch.id = ctt.chapter_id
LEFT JOIN LATERAL (
  SELECT COALESCE(SUM(aa.time_spent_seconds), 0) AS assessment_time_seconds
  FROM assessment_attempts aa
  WHERE aa.user_id = e.user_id
    AND aa.course_id = e.course_id
    AND aa.chapter_id = ctt.chapter_id
) assessment_time ON true;

CREATE VIEW analytics_course_time_totals AS
SELECT
  e.user_id,
  e.course_id,
  e.time_spent_seconds AS course_time_seconds,
  COALESCE(chapter_time.chapter_time_seconds, 0) AS chapter_time_seconds,
  COALESCE(assessment_time.assessment_time_seconds, 0) AS assessment_time_seconds,
  e.progress,
  e.completed_at
FROM enrollments e
LEFT JOIN LATERAL (
  SELECT COALESCE(SUM(ctt.time_spent_seconds), 0) AS chapter_time_seconds
  FROM chapter_time_totals ctt
  WHERE ctt.user_id = e.user_id
    AND ctt.course_id = e.course_id
) chapter_time ON true
LEFT JOIN LATERAL (
  SELECT COALESCE(SUM(aa.time_spent_seconds), 0) AS assessment_time_seconds
  FROM assessment_attempts aa
  WHERE aa.user_id = e.user_id
    AND aa.course_id = e.course_id
) assessment_time ON true;

CREATE VIEW analytics_course_effectiveness AS
SELECT
  c.id AS course_id,
  c.title,
  COUNT(DISTINCT e.user_id) AS enrolled_users,
  AVG(e.progress) AS avg_completion,
  AVG(aa.score) AS avg_assessment_score
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.id
LEFT JOIN assessments a ON a.course_id = c.id
LEFT JOIN assessment_attempts aa ON aa.assessment_id = a.id
GROUP BY c.id, c.title;
