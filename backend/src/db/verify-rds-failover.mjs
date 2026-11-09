import assert from "node:assert/strict";
import { closePool, query } from "./pool.js";

const [mode, runId, sourceRevision = "", rawTimeoutSeconds = "900"] = process.argv.slice(2);
if (!new Set(["observe", "cleanup"]).has(mode)) {
  throw new Error("Usage: verify-rds-failover.mjs <observe|cleanup> DF-<run-id> [source-revision] [timeout-seconds]");
}
if (!/^DF-[A-F0-9]{16,64}$/.test(runId || "")) {
  throw new Error("RDS failover run ID must match DF- followed by 16-64 uppercase hexadecimal characters");
}
if (mode === "observe" && !/^[0-9a-f]{40}$/.test(sourceRevision)) {
  throw new Error("A full 40-character source revision is required");
}

const timeoutSeconds = Number(rawTimeoutSeconds);
if (mode === "observe" && (!Number.isInteger(timeoutSeconds) || timeoutSeconds < 120 || timeoutSeconds > 1800)) {
  throw new Error("RDS recovery timeout must be an integer from 120 through 1800 seconds");
}

const ingestKey = `rds-failover:${runId}`;
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const marker = (stage, details = {}) => {
  console.log(`RDS_FAILOVER_${stage}:${runId} ${JSON.stringify(details)}`);
};

const probe = async () => {
  const result = await query(
    `SELECT current_database() AS database_name,
            inet_server_addr()::text AS server_address,
            pg_is_in_recovery() AS is_in_recovery,
            (SELECT count(*)::integer FROM audit_logs
              WHERE action = 'RDS_FAILOVER_MARKER'
                AND entity_type = 'SYSTEM'
                AND entity_id = $1
                AND ingest_key = $2
                AND metadata->>'sourceRevision' = $3) AS marker_count`,
    [runId, ingestKey, sourceRevision],
  );
  return result.rows[0] || {};
};

const cleanup = async () => {
  const result = await query(
    "DELETE FROM audit_logs WHERE ingest_key = $1 AND entity_id = $2 RETURNING id",
    [ingestKey, runId],
  );
  console.log(JSON.stringify({ mode, runId, deletedMarkers: result.rowCount }));
};

const observe = async () => {
  assert.equal(process.env.NODE_ENV, "production", "RDS failover verification must use production mode");
  assert.ok(process.env.DATABASE_URL || process.env.PGHOST, "PostgreSQL configuration is required");

  const inserted = await query(
    `INSERT INTO audit_logs (
       actor_id, action, entity_type, entity_id, metadata, ingest_key
     ) VALUES (NULL, 'RDS_FAILOVER_MARKER', 'SYSTEM', $1, $2::jsonb, $3)
     ON CONFLICT (ingest_key) WHERE ingest_key IS NOT NULL DO NOTHING
     RETURNING id`,
    [runId, JSON.stringify({ synthetic: true, runId, sourceRevision }), ingestKey],
  );
  assert.equal(inserted.rowCount, 1, "a fresh RDS failover marker must be inserted exactly once");

  const before = await probe();
  assert.equal(before.is_in_recovery, false, "the initial connection must target the writable primary");
  assert.equal(Number(before.marker_count), 1, "the pre-failover marker is unavailable");
  marker("ARMED", { databaseName: before.database_name });

  const armedAt = Date.now();
  const deadline = armedAt + timeoutSeconds * 1000;
  let outageStartedAt = null;

  while (Date.now() < deadline) {
    try {
      const current = await probe();
      if (outageStartedAt !== null) {
        assert.equal(current.is_in_recovery, false, "the recovered endpoint must be writable");
        assert.equal(Number(current.marker_count), 1, "the durable failover marker was lost");
        assert.notEqual(
          current.server_address,
          before.server_address,
          "the database server address did not change after forced failover",
        );
        marker("MARKER_VERIFIED", { durableMarkerCount: Number(current.marker_count) });
        await cleanup();
        const recoveredAt = Date.now();
        marker("RECOVERED", {
          recoveryMilliseconds: recoveredAt - outageStartedAt,
          observationMilliseconds: recoveredAt - armedAt,
          serverChanged: true,
        });
        return;
      }
    } catch (error) {
      if (outageStartedAt === null) {
        outageStartedAt = Date.now();
        marker("OUTAGE", { errorCode: String(error?.code || "DATABASE_UNAVAILABLE") });
      }
    }
    await delay(250);
  }

  if (outageStartedAt === null) throw new Error("No PostgreSQL interruption was observed before the deadline");
  throw new Error("PostgreSQL did not recover before the recovery-time objective");
};

try {
  if (mode === "observe") await observe();
  if (mode === "cleanup") await cleanup();
} finally {
  await closePool();
}
