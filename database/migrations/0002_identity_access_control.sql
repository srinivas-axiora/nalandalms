-- Phase 1: align database roles and revoke sessions when account trust changes.
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'InstituteAdmin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'Instructor';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'Learner';

CREATE OR REPLACE FUNCTION revoke_user_sessions_on_trust_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status
     OR OLD.role IS DISTINCT FROM NEW.role
     OR OLD.password_hash IS DISTINCT FROM NEW.password_hash THEN
    NEW.session_version := OLD.session_version + 1;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_revoke_user_sessions_on_deactivate ON users;
DROP TRIGGER IF EXISTS trg_revoke_user_sessions_on_trust_change ON users;
CREATE TRIGGER trg_revoke_user_sessions_on_trust_change
BEFORE UPDATE OF status, role, password_hash ON users
FOR EACH ROW
EXECUTE FUNCTION revoke_user_sessions_on_trust_change();
