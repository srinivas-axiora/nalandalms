-- Phase 21: scoped, durable AI generation feedback authority.

CREATE TABLE IF NOT EXISTS ai_generation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name TEXT NOT NULL CHECK (length(skill_name) BETWEEN 1 AND 200),
  course_level TEXT NOT NULL CHECK (course_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('Course', 'Chapter', 'Assessment', 'Overall')),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL CHECK (length(comment) BETWEEN 10 AND 1200),
  created_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Revoked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '180 days'),
  CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS idx_ai_feedback_creator
  ON ai_generation_feedback(created_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_relevance
  ON ai_generation_feedback(skill_name, course_level, created_at DESC)
  WHERE status = 'Active';
CREATE INDEX IF NOT EXISTS idx_ai_feedback_expiry
  ON ai_generation_feedback(expires_at)
  WHERE status = 'Active';
