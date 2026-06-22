-- Migration 0001 — Skills pilot (Phase-2 relational data layer).
--
-- Reconciliation decisions vs database/schema.sql (the original aspirational schema):
--   • IDs are TEXT, not UUID. The running app uses string ids ("SKILL-SEC",
--     "SKILL-1234", "TS-001", ...). Keeping TEXT preserves existing data and the
--     API contract; we are migrating storage, not reissuing identifiers.
--   • Timestamps are TIMESTAMPTZ; the repository maps created_at <-> createdAt.
--   • CHECK constraints mirror the zod enums enforced in the app layer.
--
-- Idempotent: safe to run repeatedly (CREATE TABLE IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS skills (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  category    TEXT NOT NULL DEFAULT 'Technical'
                CHECK (category IN ('Technical', 'Functional', 'Leadership', 'Compliance', 'Behavioral')),
  description TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL DEFAULT 'Active'
                CHECK (status IN ('Active', 'Inactive')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Case-insensitive uniqueness on name (the app rejects duplicate names ignoring case).
CREATE UNIQUE INDEX IF NOT EXISTS idx_skills_name_lower ON skills (lower(name));

CREATE TABLE IF NOT EXISTS target_skills (
  id           TEXT PRIMARY KEY,
  skill_id     TEXT NOT NULL,
  scope        TEXT NOT NULL CHECK (scope IN ('Organization', 'Department', 'Role', 'Employee')),
  department   TEXT,
  designation  TEXT,
  user_id      TEXT,
  target_level TEXT NOT NULL DEFAULT 'Intermediate'
                 CHECK (target_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  target_score INTEGER NOT NULL DEFAULT 80 CHECK (target_score >= 0 AND target_score <= 100),
  priority     TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_target_skills_skill ON target_skills (skill_id);
CREATE INDEX IF NOT EXISTS idx_target_skills_scope ON target_skills (scope);
