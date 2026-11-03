-- Phase 9: durable certificate authority, public verification snapshots and
-- auditable revocation.

ALTER TABLE issued_certificates
  ALTER COLUMN html_snapshot SET DEFAULT '',
  ADD COLUMN IF NOT EXISTS attempt_id TEXT REFERENCES assessment_attempts(id),
  ADD COLUMN IF NOT EXISTS recipient_name TEXT,
  ADD COLUMN IF NOT EXISTS recipient_email TEXT,
  ADD COLUMN IF NOT EXISTS course_title TEXT,
  ADD COLUMN IF NOT EXISTS proctoring_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS exam_score NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS signature_version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS signature TEXT,
  ADD COLUMN IF NOT EXISTS verification_url TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_share_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS revoked_by TEXT REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS revocation_reason TEXT;

UPDATE issued_certificates c SET
  recipient_name = COALESCE(c.recipient_name, u.name),
  recipient_email = COALESCE(c.recipient_email, u.email::text),
  course_title = COALESCE(c.course_title, course.title),
  verification_url = COALESCE(c.verification_url, '/verify/' || c.id)
FROM users u, courses course
WHERE c.employee_id = u.id AND c.course_id = course.id;

ALTER TABLE issued_certificates
  ALTER COLUMN recipient_name SET NOT NULL,
  ALTER COLUMN recipient_email SET NOT NULL,
  ALTER COLUMN course_title SET NOT NULL,
  ALTER COLUMN verification_url SET NOT NULL;

ALTER TABLE issued_certificates
  DROP CONSTRAINT IF EXISTS issued_certificates_signature_check,
  DROP CONSTRAINT IF EXISTS issued_certificates_signature_version_check,
  DROP CONSTRAINT IF EXISTS issued_certificates_status_check,
  DROP CONSTRAINT IF EXISTS issued_certificates_revocation_check;
ALTER TABLE issued_certificates
  ADD CONSTRAINT issued_certificates_signature_check
    CHECK (signature IS NULL OR signature ~ '^[a-f0-9]{64}$'),
  ADD CONSTRAINT issued_certificates_signature_version_check
    CHECK (signature_version IN (1, 2)),
  ADD CONSTRAINT issued_certificates_status_check
    CHECK (status IN ('Active', 'Revoked')),
  ADD CONSTRAINT issued_certificates_revocation_check CHECK (
    (status = 'Active' AND revoked_by IS NULL AND revoked_at IS NULL AND revocation_reason IS NULL)
    OR
    (status = 'Revoked' AND revoked_by IS NOT NULL AND revoked_at IS NOT NULL AND length(trim(revocation_reason)) >= 10)
  );

ALTER TABLE issued_certificates
  ALTER COLUMN signature_version SET DEFAULT 2;

CREATE INDEX IF NOT EXISTS idx_certificates_status
  ON issued_certificates(status, issued_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_certificates_one_active_per_course
  ON issued_certificates(employee_id, course_id) WHERE status = 'Active';
