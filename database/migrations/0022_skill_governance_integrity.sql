-- Phase 66 — skill-governance referential and scope integrity.
--
-- The API performs the same checks before writes. These constraints make
-- PostgreSQL the final authority if another writer bypasses the API.

DO $$
BEGIN
  ALTER TABLE target_skills
    ADD CONSTRAINT target_skills_skill_fk
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE RESTRICT NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE target_skills
    ADD CONSTRAINT target_skills_user_fk
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE target_skills
    ADD CONSTRAINT target_skills_scope_reference_ck CHECK (
      (scope = 'Organization' AND department IS NULL AND designation IS NULL AND user_id IS NULL)
      OR (scope = 'Department' AND department IS NOT NULL AND designation IS NULL AND user_id IS NULL)
      OR (scope = 'Role' AND department IS NULL AND designation IS NOT NULL AND user_id IS NULL)
      OR (scope = 'Employee' AND department IS NULL AND designation IS NULL AND user_id IS NOT NULL)
    ) NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE target_skills
    ADD CONSTRAINT target_skills_score_positive_ck
    CHECK (target_score >= 1 AND target_score <= 100) NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Validation deliberately fails the release if historical rows violate the
-- new authority rules; repair those rows explicitly instead of silently
-- discarding governance data.
ALTER TABLE target_skills VALIDATE CONSTRAINT target_skills_skill_fk;
ALTER TABLE target_skills VALIDATE CONSTRAINT target_skills_user_fk;
ALTER TABLE target_skills VALIDATE CONSTRAINT target_skills_scope_reference_ck;
ALTER TABLE target_skills VALIDATE CONSTRAINT target_skills_score_positive_ck;
