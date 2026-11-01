-- Read-only audit view for accounts that were created by the public registration
-- flow with a privileged role. Review every row before disabling or correcting it.
CREATE OR REPLACE VIEW privileged_self_registration_audit AS
SELECT
  u.id AS user_id,
  u.email,
  u.role,
  u.status,
  u.created_at,
  a.id AS registration_audit_id,
  a.created_at AS registration_recorded_at
FROM users u
LEFT JOIN audit_logs a
  ON a.entity_type = 'USER'
 AND a.entity_id = u.id
 AND a.action = 'REGISTER'
WHERE u.role IN ('Super Admin', 'Admin', 'InstituteAdmin', 'Manager', 'Instructor');

COMMENT ON VIEW privileged_self_registration_audit IS
  'Phase 1 triage list only. Investigate provenance before revoking sessions, changing roles, or disabling accounts.';
