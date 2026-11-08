-- Phase 47: durable, multi-worker-safe proctoring media retention.

CREATE TABLE IF NOT EXISTS proctor_media_objects (
  attempt_id TEXT NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  object_key TEXT,
  object_key_sha256 TEXT NOT NULL,
  chunk_index INTEGER,
  stream_role TEXT,
  size_bytes BIGINT,
  content_type TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  delete_attempts INTEGER NOT NULL DEFAULT 0,
  claimed_at TIMESTAMPTZ,
  next_attempt_at TIMESTAMPTZ,
  last_error_code TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (attempt_id, object_key_sha256),
  CONSTRAINT proctor_media_status_check
    CHECK (status IN ('Active', 'Deleting', 'Failed', 'Deleted')),
  CONSTRAINT proctor_media_attempts_check CHECK (delete_attempts BETWEEN 0 AND 5),
  CONSTRAINT proctor_media_deleted_key_check
    CHECK ((status = 'Deleted' AND object_key IS NULL AND deleted_at IS NOT NULL)
      OR (status <> 'Deleted' AND object_key IS NOT NULL AND deleted_at IS NULL))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_proctor_media_object_key
  ON proctor_media_objects(object_key) WHERE object_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_proctor_media_retention_due
  ON proctor_media_objects(status, next_attempt_at, created_at)
  WHERE status IN ('Active', 'Deleting', 'Failed');

INSERT INTO proctor_media_objects (
  attempt_id, object_key, object_key_sha256, chunk_index, stream_role,
  size_bytes, content_type, created_at
)
SELECT attempt.id,
       chunk->>'key',
       encode(digest(chunk->>'key', 'sha256'), 'hex'),
       CASE WHEN (chunk->>'chunkIndex') ~ '^\d+$' THEN (chunk->>'chunkIndex')::integer END,
       NULLIF(chunk->>'streamRole', ''),
       CASE WHEN (chunk->>'sizeBytes') ~ '^\d+$' THEN (chunk->>'sizeBytes')::bigint END,
       NULLIF(chunk->>'contentType', ''),
       COALESCE(attempt.submitted_at, attempt.started_at, now())
FROM assessment_attempts attempt
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(attempt.video_chunks, '[]'::jsonb)) chunk
WHERE NULLIF(chunk->>'key', '') IS NOT NULL
ON CONFLICT DO NOTHING;
