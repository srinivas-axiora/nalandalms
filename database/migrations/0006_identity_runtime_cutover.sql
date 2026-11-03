-- Phase 7: fields required for the relational identity/session source of truth.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS preferences JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS joined_at DATE;

-- Preserve an explicitly reconciled higher version while still incrementing
-- every password, role or lifecycle trust change.
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

CREATE INDEX IF NOT EXISTS idx_users_active_email
  ON users (lower(email::text)) WHERE status = 'Active';
