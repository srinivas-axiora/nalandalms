-- Phase 24: operational settings and learner-feedback authority.

INSERT INTO system_settings (key, value, updated_by)
VALUES (
  'proctoring',
  '{"fullscreenRequired":true,"cameraRequired":true,"microphoneRequired":true,"tabSwitchAutoSubmit":true,"noiseThreshold":70,"maxAssessmentFlags":2}'::jsonb,
  NULL
)
ON CONFLICT (key) DO NOTHING;

ALTER TABLE system_settings
  DROP CONSTRAINT IF EXISTS system_settings_proctoring_shape;
ALTER TABLE system_settings
  ADD CONSTRAINT system_settings_proctoring_shape CHECK (
    key <> 'proctoring' OR (
      jsonb_typeof(value) = 'object'
      AND jsonb_typeof(value->'fullscreenRequired') = 'boolean'
      AND jsonb_typeof(value->'cameraRequired') = 'boolean'
      AND jsonb_typeof(value->'microphoneRequired') = 'boolean'
      AND jsonb_typeof(value->'tabSwitchAutoSubmit') = 'boolean'
      AND jsonb_typeof(value->'noiseThreshold') = 'number'
      AND jsonb_typeof(value->'maxAssessmentFlags') = 'number'
      AND (value->>'noiseThreshold')::integer BETWEEN 1 AND 100
      AND (value->>'maxAssessmentFlags')::integer BETWEEN 0 AND 100
    )
  );

CREATE INDEX IF NOT EXISTS idx_chapter_feedback_user
  ON chapter_feedbacks(user_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_chapter_feedback_course
  ON chapter_feedbacks(course_id, submitted_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chapters_id_course_unique'
  ) THEN
    ALTER TABLE chapters
      ADD CONSTRAINT chapters_id_course_unique UNIQUE (id, course_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chapter_feedbacks_chapter_course_fk'
  ) THEN
    ALTER TABLE chapter_feedbacks
      ADD CONSTRAINT chapter_feedbacks_chapter_course_fk
      FOREIGN KEY (chapter_id, course_id) REFERENCES chapters(id, course_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chapter_feedbacks_comments_length'
  ) THEN
    ALTER TABLE chapter_feedbacks
      ADD CONSTRAINT chapter_feedbacks_comments_length
      CHECK (length(comments) <= 2000);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'skill_ratings_value_bounds'
  ) THEN
    ALTER TABLE skill_ratings
      ADD CONSTRAINT skill_ratings_value_bounds CHECK (
        length(btrim(skill)) BETWEEN 1 AND 200
        AND score BETWEEN 0 AND 100
        AND assessments_based >= 0
      );
  END IF;
END $$;
