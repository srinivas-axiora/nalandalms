import assert from "node:assert/strict";
import crypto from "node:crypto";
import { closePool, query, withTransaction } from "./pool.js";
import { runRetentionCleanup } from "../workers/retention-cleanup.js";
import {
  deleteObjectCompletely,
  objectExists,
  objectVersionCount,
  uploadBuffer,
} from "../storage/object-store.js";

if (!process.env.DATABASE_URL && !process.env.PGHOST) {
  throw new Error("DATABASE_URL or PGHOST is required for proctor retention verification");
}

process.env.USE_PG_ATTEMPTS = "1";

const suffix = crypto.randomBytes(6).toString("hex");
const userId = `VERIFY-RETENTION-USER-${suffix}`;
const courseId = `VERIFY-RETENTION-COURSE-${suffix}`;
const chapterId = `VERIFY-RETENTION-CHAPTER-${suffix}`;
const assessmentId = `VERIFY-RETENTION-ASSESSMENT-${suffix}`;
const attemptId = `VERIFY-RETENTION-ATTEMPT-${suffix}`;
const objectKey = `verification/proctor-retention/${attemptId}/synthetic.webm`;
const objectKeySha256 = crypto.createHash("sha256").update(objectKey).digest("hex");
const checks = [];
const ok = (name, condition) => { assert.ok(condition, name); checks.push(name); };
let objectCreated = false;

const auditFn = async (actorId, action, entityType, entityId, metadata) => {
  await query(
    `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
     VALUES ($1, $2, $3, $4, $5::jsonb)`,
    [actorId || null, action, entityType, entityId, JSON.stringify(metadata || {})],
  );
};

try {
  await uploadBuffer(objectKey, Buffer.from("synthetic proctor retention evidence"), "video/webm");
  objectCreated = true;
  ok("synthetic retention object is durable before cleanup", await objectExists(objectKey));
  ok("synthetic retention object has a stored version before cleanup", await objectVersionCount(objectKey) >= 1);

  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO users (id, name, email, role, status)
       VALUES ($1, 'Retention verifier', $2, 'Admin', 'Active')`,
      [userId, `${userId}@example.invalid`],
    );
    await client.query(
      `INSERT INTO courses (id, title, description, owner_id, status, approval)
       VALUES ($1, 'Retention verification', 'Synthetic retention evidence', $2, 'Active', 'Approved')`,
      [courseId, userId],
    );
    await client.query(
      "INSERT INTO chapters (id, course_id, sequence, title) VALUES ($1, $2, 1, 'Retention chapter')",
      [chapterId, courseId],
    );
    await client.query(
      `INSERT INTO assessments (
         id, course_id, chapter_id, title, type, duration_minutes,
         pass_score, approval, status, owner_id
       ) VALUES ($1, $2, $3, 'Retention assessment', 'MCQ', 30, 70, 'Approved', 'Active', $4)`,
      [assessmentId, courseId, chapterId, userId],
    );
    await client.query(
      `INSERT INTO assessment_attempts (
         id, assessment_id, chapter_id, course_id, user_id, status,
         video_chunks, started_at, submitted_at
       ) VALUES (
         $1, $2, $3, $4, $5, 'Passed', $6::jsonb,
         now() - interval '100 days', now() - interval '91 days'
       )`,
      [attemptId, assessmentId, chapterId, courseId, userId,
        JSON.stringify([{ key: objectKey, chunkIndex: 0, contentType: "video/webm" }])],
    );
    await client.query(
      `INSERT INTO proctor_media_objects (
         attempt_id, object_key, object_key_sha256, chunk_index,
         content_type, created_at
       ) VALUES ($1, $2, $3, 0, 'video/webm', now() - interval '91 days')`,
      [attemptId, objectKey, objectKeySha256],
    );
  });

  const failed = await runRetentionCleanup({
    retentionDays: 90,
    limit: 2,
    deleteFn: async () => { throw new Error("synthetic object-store interruption"); },
    auditFn,
  });
  ok(
    "object-store interruption creates one bounded retention failure",
    failed.failedChunksCount === 1 && failed.deletedChunksCount === 0,
  );
  const failedState = await query(
    `SELECT status, delete_attempts, next_attempt_at, last_error_code, object_key
       FROM proctor_media_objects
      WHERE attempt_id = $1 AND object_key_sha256 = $2`,
    [attemptId, objectKeySha256],
  );
  ok(
    "failed retention work keeps the object reference and schedules retry",
    failedState.rows[0]?.status === "Failed"
      && Number(failedState.rows[0]?.delete_attempts) === 1
      && failedState.rows[0]?.next_attempt_at
      && failedState.rows[0]?.last_error_code === "OBJECT_DELETE_FAILED"
      && failedState.rows[0]?.object_key === objectKey
      && await objectExists(objectKey),
  );

  await query(
    `UPDATE proctor_media_objects SET next_attempt_at = now() - interval '1 second'
      WHERE attempt_id = $1 AND object_key_sha256 = $2`,
    [attemptId, objectKeySha256],
  );
  const recovered = await runRetentionCleanup({
    retentionDays: 90,
    limit: 2,
    deleteFn: deleteObjectCompletely,
    auditFn,
  });
  const currentObjectExists = await objectExists(objectKey);
  const remainingObjectVersions = await objectVersionCount(objectKey);
  objectCreated = remainingObjectVersions > 0;
  ok(
    "retention retry deletes the real object and completes once",
    recovered.deletedChunksCount === 1 && recovered.failedChunksCount === 0 && !currentObjectExists,
  );
  ok("retention retry removes every retained object version", remainingObjectVersions === 0);
  const completed = await query(
    `SELECT media.status, media.delete_attempts, media.object_key,
            media.deleted_at, media.last_error_code, attempt.video_chunks
       FROM proctor_media_objects media
       JOIN assessment_attempts attempt ON attempt.id = media.attempt_id
      WHERE media.attempt_id = $1 AND media.object_key_sha256 = $2`,
    [attemptId, objectKeySha256],
  );
  ok(
    "successful retry removes raw keys from durable retention state",
    completed.rows[0]?.status === "Deleted"
      && Number(completed.rows[0]?.delete_attempts) === 2
      && completed.rows[0]?.object_key === null
      && completed.rows[0]?.deleted_at
      && completed.rows[0]?.last_error_code === null
      && Array.isArray(completed.rows[0]?.video_chunks)
      && completed.rows[0].video_chunks.length === 0,
  );
  const evidence = await query(
    `SELECT action, metadata::text AS metadata
       FROM audit_logs
      WHERE (entity_type = 'ASSESSMENT_ATTEMPT' AND entity_id = $1)
         OR (action = 'RETENTION_CLEANUP' AND entity_id = 'BATCH'
             AND metadata->>'executedAt' >= $2)
      ORDER BY created_at`,
    [attemptId, failed.executedAt],
  );
  ok(
    "retention audit evidence records recovery without raw object keys",
    evidence.rows.some((row) => row.action === "RETENTION_MEDIA_DELETED")
      && evidence.rows.filter((row) => row.action === "RETENTION_CLEANUP").length >= 2
      && evidence.rows.every((row) => !String(row.metadata).includes(objectKey)),
  );

  checks.forEach((check) => console.log(`ok - ${check}`));
  console.log(`Proctor retention recovery verification passed (${checks.length} checks).`);
} finally {
  if (objectCreated) await deleteObjectCompletely(objectKey).catch(() => {});
  await query(
    `DELETE FROM audit_logs
      WHERE (entity_type = 'ASSESSMENT_ATTEMPT' AND entity_id = $1)
         OR actor_id = $2`,
    [attemptId, userId],
  ).catch(() => {});
  await query("DELETE FROM proctor_media_objects WHERE attempt_id = $1", [attemptId]).catch(() => {});
  await query("DELETE FROM assessment_attempts WHERE id = $1", [attemptId]).catch(() => {});
  await query("DELETE FROM assessments WHERE id = $1", [assessmentId]).catch(() => {});
  await query("DELETE FROM chapters WHERE id = $1", [chapterId]).catch(() => {});
  await query("DELETE FROM courses WHERE id = $1", [courseId]).catch(() => {});
  await query("DELETE FROM users WHERE id = $1", [userId]).catch(() => {});
  await closePool();
}
