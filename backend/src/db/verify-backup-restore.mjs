import assert from "node:assert/strict";
import { closePool, query } from "./pool.js";

if (!process.env.DATABASE_URL && !process.env.PGHOST) {
  throw new Error("DATABASE_URL or PGHOST is required for backup/restore verification");
}

const [mode, runId, sourceRevision] = process.argv.slice(2);
const allowedModes = new Set(["prepare", "assert", "cleanup"]);
if (!allowedModes.has(mode)) {
  throw new Error("Usage: verify-backup-restore.mjs <prepare|assert|cleanup> <run-id> [source-revision]");
}
if (!/^BR-[A-F0-9]{32}$/.test(runId || "")) {
  throw new Error("Backup/restore run ID must match BR- followed by 32 uppercase hexadecimal characters");
}
if (mode !== "cleanup" && !/^[0-9a-f]{40}$/.test(sourceRevision || "")) {
  throw new Error("A full 40-character source revision is required");
}

const ingestKey = `backup-restore:${runId}`;

async function prepare() {
  const result = await query(
    `INSERT INTO audit_logs (
       actor_id, action, entity_type, entity_id, metadata, ingest_key
     ) VALUES (NULL, 'BACKUP_RESTORE_MARKER', 'SYSTEM', $1, $2::jsonb, $3)
     ON CONFLICT (ingest_key) WHERE ingest_key IS NOT NULL DO NOTHING
     RETURNING id, created_at`,
    [runId, JSON.stringify({ synthetic: true, runId, sourceRevision }), ingestKey],
  );
  assert.equal(result.rowCount, 1, "a fresh backup/restore marker must be inserted exactly once");
  console.log(JSON.stringify({ mode, runId, markerId: result.rows[0].id, createdAt: result.rows[0].created_at }));
}

async function verifyRestoredDatabase() {
  const result = await query(
    `SELECT
       current_database() AS database_name,
       pg_is_in_recovery() AS is_in_recovery,
       (SELECT count(*)::integer FROM audit_logs
          WHERE action = 'BACKUP_RESTORE_MARKER'
            AND entity_type = 'SYSTEM'
            AND entity_id = $1
            AND ingest_key = $2
            AND metadata->>'runId' = $1
            AND metadata->>'sourceRevision' = $3) AS marker_count,
       (SELECT count(*)::integer FROM schema_migrations) AS migration_count,
       to_regclass('public.users') IS NOT NULL AS users_present,
       to_regclass('public.courses') IS NOT NULL AS courses_present,
       to_regclass('public.assessment_attempts') IS NOT NULL AS attempts_present,
       to_regclass('public.payment_orders') IS NOT NULL AS payments_present,
       to_regclass('public.audit_logs') IS NOT NULL AS audit_present`,
    [runId, ingestKey, sourceRevision],
  );
  const restored = result.rows[0] || {};
  assert.equal(Number(restored.marker_count), 1, "the restored database must contain exactly one source marker");
  assert.ok(Number(restored.migration_count) > 0, "the restored database must retain migration history");
  assert.equal(restored.is_in_recovery, false, "the restored database must accept normal application connections");
  assert.ok(
    restored.users_present
      && restored.courses_present
      && restored.attempts_present
      && restored.payments_present
      && restored.audit_present,
    "the restored database must retain critical relational tables",
  );
  console.log(JSON.stringify({
    mode,
    runId,
    databaseName: restored.database_name,
    markerCount: Number(restored.marker_count),
    migrationCount: Number(restored.migration_count),
    criticalTablesPresent: true,
  }));
}

async function cleanup() {
  const result = await query(
    "DELETE FROM audit_logs WHERE ingest_key = $1 AND entity_id = $2 RETURNING id",
    [ingestKey, runId],
  );
  console.log(JSON.stringify({ mode, runId, deletedMarkers: result.rowCount }));
}

try {
  if (mode === "prepare") await prepare();
  if (mode === "assert") await verifyRestoredDatabase();
  if (mode === "cleanup") await cleanup();
} finally {
  await closePool();
}
