-- Phase 33: durable, complete course/assessment archive authority.

ALTER TABLE deleted_archives
  ADD COLUMN IF NOT EXISTS source_key TEXT;

ALTER TABLE deleted_archives
  DROP CONSTRAINT IF EXISTS deleted_archives_json_shape;
ALTER TABLE deleted_archives
  ADD CONSTRAINT deleted_archives_json_shape CHECK (
    jsonb_typeof(entity_data) = 'object'
    AND jsonb_typeof(related_data) = 'object'
    AND length(entity_id) BETWEEN 1 AND 200
    AND length(deleted_by_name) <= 300
    AND length(deletion_comment) <= 5000
    AND (source_key IS NULL OR source_key ~ '^[a-f0-9]{64}$')
  );

CREATE UNIQUE INDEX IF NOT EXISTS uq_deleted_archives_source_key
  ON deleted_archives(source_key) WHERE source_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deleted_archives_order
  ON deleted_archives(deleted_at DESC, id DESC);
