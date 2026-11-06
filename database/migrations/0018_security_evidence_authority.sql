-- Phase 32: durable application audit and security-event authority.

ALTER TABLE audit_logs
  DROP CONSTRAINT IF EXISTS audit_logs_actor_id_fkey;

ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS ingest_key TEXT;

ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_shape;
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_shape CHECK (
  length(btrim(action)) BETWEEN 1 AND 200
  AND length(btrim(entity_type)) BETWEEN 1 AND 100
  AND length(btrim(entity_id)) BETWEEN 1 AND 300
  AND (actor_id IS NULL OR length(actor_id) <= 200)
  AND jsonb_typeof(metadata) = 'object'
  AND (ingest_key IS NULL OR length(ingest_key) <= 200)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_audit_logs_ingest_key
  ON audit_logs(ingest_key) WHERE ingest_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_created
  ON audit_logs(created_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  actor_id TEXT,
  ip_address TEXT,
  http_method TEXT,
  request_path TEXT,
  user_agent TEXT,
  request_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  ingest_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE security_events DROP CONSTRAINT IF EXISTS security_events_shape;
ALTER TABLE security_events ADD CONSTRAINT security_events_shape CHECK (
  length(btrim(event_type)) BETWEEN 1 AND 200
  AND (actor_id IS NULL OR length(actor_id) <= 200)
  AND (ip_address IS NULL OR length(ip_address) <= 200)
  AND (http_method IS NULL OR length(http_method) BETWEEN 1 AND 16)
  AND (request_path IS NULL OR length(request_path) <= 2048)
  AND (user_agent IS NULL OR length(user_agent) <= 1024)
  AND (request_id IS NULL OR length(request_id) <= 200)
  AND jsonb_typeof(metadata) = 'object'
  AND (ingest_key IS NULL OR length(ingest_key) <= 200)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_security_events_ingest_key
  ON security_events(ingest_key) WHERE ingest_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_security_events_created
  ON security_events(created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_type
  ON security_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_actor
  ON security_events(actor_id, created_at DESC) WHERE actor_id IS NOT NULL;

-- Enforce the metadata boundary below every repository. This recursively
-- removes credential derivatives and direct identity fields, including values
-- nested inside arrays/objects, before evidence reaches durable storage.
CREATE OR REPLACE FUNCTION nalanda_redact_evidence_metadata(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
IMMUTABLE
PARALLEL SAFE
AS $$
DECLARE
  result JSONB;
BEGIN
  IF payload IS NULL THEN RETURN '{}'::jsonb; END IF;
  IF jsonb_typeof(payload) = 'object' THEN
    SELECT COALESCE(jsonb_object_agg(item.key, nalanda_redact_evidence_metadata(item.value)), '{}'::jsonb)
      INTO result
      FROM jsonb_each(payload) AS item
      WHERE lower(item.key) NOT IN (
        'password', 'passwordhash', 'currentpassword', 'newpassword',
        'resettoken', 'accesstoken', 'refreshtoken', 'authorization',
        'cookie', 'secret', 'apikey', 'privatekey',
        'email', 'name', 'candidateemail', 'candidatename'
      );
    RETURN result;
  END IF;
  IF jsonb_typeof(payload) = 'array' THEN
    SELECT COALESCE(jsonb_agg(nalanda_redact_evidence_metadata(item.value)), '[]'::jsonb)
      INTO result FROM jsonb_array_elements(payload) AS item(value);
    RETURN result;
  END IF;
  RETURN payload;
END;
$$;

CREATE OR REPLACE FUNCTION nalanda_scrub_evidence_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.metadata := nalanda_redact_evidence_metadata(NEW.metadata);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_scrub_audit_metadata ON audit_logs;
CREATE TRIGGER trg_scrub_audit_metadata
  BEFORE INSERT OR UPDATE OF metadata ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION nalanda_scrub_evidence_metadata();

DROP TRIGGER IF EXISTS trg_scrub_security_metadata ON security_events;
CREATE TRIGGER trg_scrub_security_metadata
  BEFORE INSERT OR UPDATE OF metadata ON security_events
  FOR EACH ROW EXECUTE FUNCTION nalanda_scrub_evidence_metadata();

UPDATE audit_logs SET metadata = nalanda_redact_evidence_metadata(metadata);
UPDATE security_events SET metadata = nalanda_redact_evidence_metadata(metadata);
