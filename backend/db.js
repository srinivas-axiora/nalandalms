// ── Durable storage adapter ──────────────────────────────────────────────────
// Provides a tiny, persistence-agnostic save/load API behind which the app's
// state is durably stored.
//
//   • When DATABASE_URL is set → PostgreSQL (pooled, transactional, JSONB per
//     collection). Survives restarts/redeploys and supports managed backups +
//     point-in-time recovery. This is the production path.
//   • Otherwise → atomic local JSON file (temp-write + rename) for dev / no-DB
//     installs.
//
// The relational schema in database/schema.sql remains the target for a future
// fully-normalized phase; this layer first removes the single-file corruption
// and durability risk while keeping the existing in-memory API surface intact.

import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const { Pool } = pg;

export function createStorage({ filePath, databaseUrl }) {
  if (databaseUrl) return createPostgresStorage({ databaseUrl });
  return createFileStorage({ filePath });
}

// ── File backend (fallback) ──
function createFileStorage({ filePath }) {
  return {
    mode: "file",
    describe: () => `file (${filePath})`,
    async init() {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    },
    async load() {
      if (!fs.existsSync(filePath)) return null;
      const raw = fs.readFileSync(filePath, "utf8");
      if (!raw.trim()) return null;
      return JSON.parse(raw);
    },
        async save(data) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      const tmp = `${filePath}.${process.pid}.${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
      for (let i = 0; i < 5; i++) {
        try {
          fs.renameSync(tmp, filePath);
          return;
        } catch (err) {
          if ((err.code === "EPERM" || err.code === "EBUSY") && i < 4) {
            await new Promise((r) => setTimeout(r, 20));
          } else {
            try {
              fs.copyFileSync(tmp, filePath);
              fs.unlinkSync(tmp);
              return;
            } catch {
              throw err;
            }
          }
        }
      }
    },
    async close() {},
  };
}

// ── PostgreSQL backend (production) ──
function resolveSsl() {
  // PGSSL=require   → TLS with certificate verification (recommended).
  // PGSSL=no-verify → TLS without verification (managed DBs with self-signed chains).
  // unset / other   → no TLS (local Postgres).
  const mode = process.env.PGSSL;
  if (mode === "require") return { rejectUnauthorized: true };
  if (mode === "no-verify") return { rejectUnauthorized: false };
  return false;
}

function createPostgresStorage({ databaseUrl }) {
  const pool = new Pool({
    connectionString: databaseUrl,
    max: Number(process.env.PGPOOL_MAX || 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ssl: resolveSsl(),
  });

  // Surface idle-client errors instead of crashing the process.
  pool.on("error", (err) => {
    console.error("[storage:postgres] idle client error:", err?.message || err);
  });

  return {
    mode: "postgres",
    pool,
    describe: () => "postgres (DATABASE_URL)",
    async init() {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS app_state (
          collection TEXT PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `);
    },
    async load() {
      const { rows } = await pool.query("SELECT collection, data FROM app_state");
      if (!rows.length) return null;
      const out = {};
      for (const row of rows) out[row.collection] = row.data;
      return out;
    },
    async save(data) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        for (const [collection, value] of Object.entries(data)) {
          await client.query(
            `INSERT INTO app_state (collection, data, updated_at)
             VALUES ($1, $2::jsonb, now())
             ON CONFLICT (collection)
             DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
            [collection, JSON.stringify(value)]
          );
        }
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        throw err;
      } finally {
        client.release();
      }
    },
    async close() {
      await pool.end();
    },
  };
}
