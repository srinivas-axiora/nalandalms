import { query, withTransaction } from "../db/pool.js";

const mapTask = (row) => row && ({
  attemptId: row.attempt_id,
  objectKey: row.object_key,
  objectKeySha256: row.object_key_sha256,
  deleteAttempts: Number(row.delete_attempts || 0),
});

export function createProctorMediaRetentionRepository(db = { query, withTransaction }) {
  const listDue = async ({ retentionDays, limit = 100 }) => {
    const { rows } = await db.query(
      `SELECT media.* FROM proctor_media_objects media
       JOIN assessment_attempts attempt ON attempt.id = media.attempt_id
       WHERE attempt.submitted_at IS NOT NULL
         AND attempt.submitted_at < now() - ($1::integer * interval '1 day')
         AND media.status IN ('Active', 'Failed')
         AND (media.next_attempt_at IS NULL OR media.next_attempt_at <= now())
         AND media.delete_attempts < 5
       ORDER BY attempt.submitted_at, media.created_at, media.object_key_sha256
       LIMIT $2`,
      [retentionDays, limit],
    );
    return rows.map(mapTask);
  };

  const claimDue = async ({ retentionDays }) => db.withTransaction(async (client) => {
    const { rows } = await client.query(
      `WITH terminal_stale_claims AS (
         UPDATE proctor_media_objects SET
           status = 'Failed', claimed_at = NULL, next_attempt_at = NULL,
           last_error_code = 'CLAIM_EXHAUSTED'
         WHERE status = 'Deleting' AND delete_attempts >= 5
           AND claimed_at < now() - interval '15 minutes'
         RETURNING attempt_id
       ), candidate AS (
         SELECT media.attempt_id, media.object_key_sha256
         FROM proctor_media_objects media
         JOIN assessment_attempts attempt ON attempt.id = media.attempt_id
         WHERE attempt.submitted_at IS NOT NULL
           AND attempt.submitted_at < now() - ($1::integer * interval '1 day')
           AND (
             media.status = 'Active'
             OR (media.status = 'Failed' AND media.next_attempt_at <= now())
             OR (media.status = 'Deleting' AND media.claimed_at < now() - interval '15 minutes')
           )
           AND media.delete_attempts < 5
         ORDER BY attempt.submitted_at, media.created_at, media.object_key_sha256
         FOR UPDATE OF media SKIP LOCKED
         LIMIT 1
       )
       UPDATE proctor_media_objects media SET
         status = 'Deleting', claimed_at = now(), next_attempt_at = NULL,
         delete_attempts = media.delete_attempts + 1, last_error_code = NULL
       FROM candidate
       WHERE media.attempt_id = candidate.attempt_id
         AND media.object_key_sha256 = candidate.object_key_sha256
       RETURNING media.*`,
      [retentionDays],
    );
    return mapTask(rows[0]);
  });

  const markDeleted = async ({ attemptId, objectKeySha256, objectKey }) =>
    db.withTransaction(async (client) => {
      const completed = await client.query(
        `UPDATE proctor_media_objects SET
           status = 'Deleted', object_key = NULL, claimed_at = NULL,
           next_attempt_at = NULL, last_error_code = NULL, deleted_at = now()
         WHERE attempt_id = $1 AND object_key_sha256 = $2 AND status = 'Deleting'
         RETURNING attempt_id`,
        [attemptId, objectKeySha256],
      );
      if (!completed.rows[0]) {
        throw new Error("Proctor media retention task is no longer claimed");
      }
      await client.query(
        `UPDATE assessment_attempts SET
           video_chunks = COALESCE((
             SELECT jsonb_agg(chunk)
             FROM jsonb_array_elements(video_chunks) chunk
             WHERE chunk->>'key' <> $2
           ), '[]'::jsonb),
           version = version + 1
         WHERE id = $1`,
        [attemptId, objectKey],
      );
      await client.query(
        `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
         VALUES (NULL, 'RETENTION_MEDIA_DELETED', 'ASSESSMENT_ATTEMPT', $1, $2::jsonb)`,
        [attemptId, JSON.stringify({ objectKeySha256 })],
      );
      return true;
    });

  const markFailed = ({ attemptId, objectKeySha256, errorCode, retryDelaySeconds = 300 }) =>
    db.query(
      `UPDATE proctor_media_objects SET
         status = 'Failed', claimed_at = NULL, last_error_code = $3,
         next_attempt_at = CASE WHEN delete_attempts < 5
           THEN now() + ($4::integer * interval '1 second') ELSE NULL END
       WHERE attempt_id = $1 AND object_key_sha256 = $2 AND status = 'Deleting'`,
      [attemptId, objectKeySha256, String(errorCode).slice(0, 100), retryDelaySeconds],
    );

  return { listDue, claimDue, markDeleted, markFailed };
}

export const proctorMediaRetentionRepository = createProctorMediaRetentionRepository();
