// Relational data layer — pooled PostgreSQL client.
// This is the foundation for the Phase-2 migration from the in-memory/JSON-blob
// store to normalized relational tables. It is ADDITIVE: the running app does not
// use it until each entity's repository is wired in and verified.
//
// ⚠️ UNVERIFIED-BY-AUTHOR: built without a live Postgres to test against. JS is
// syntax-checked; SQL/runtime behavior must be validated against a real database
// (see docs/POSTGRES-MIGRATION.md).
import pg from "pg";

const { Pool } = pg;

function resolveSsl() {
  // PGSSL=require → TLS w/ cert verification; no-verify → TLS w/o verification;
  // unset → no TLS (local). Mirrors backend/db.js.
  const mode = process.env.PGSSL;
  if (mode === "require") return { rejectUnauthorized: true };
  if (mode === "no-verify") return { rejectUnauthorized: false };
  return false;
}

let pool = null;

export function getPool() {
  if (!process.env.DATABASE_URL && !process.env.PGHOST) {
    throw new Error("DATABASE_URL or PGHOST is required for the relational data layer.");
  }
  if (!pool) {
    const connection = process.env.DATABASE_URL
      ? { connectionString: process.env.DATABASE_URL }
      : {
          host: process.env.PGHOST,
          port: Number(process.env.PGPORT || 5432),
          database: process.env.PGDATABASE,
          user: process.env.PGUSER,
          password: process.env.PGPASSWORD,
        };
    pool = new Pool({
      ...connection,
      max: Number(process.env.PGPOOL_MAX || 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      query_timeout: 10_000,
      ssl: resolveSsl(),
    });
    pool.on("error", (err) => console.error("[db] idle client error:", err?.message || err));
  }
  return pool;
}

// Single parameterized query. NEVER interpolate user input into `text` — always
// pass values via `params` ($1, $2, …) so the driver parameterizes them.
export const query = (text, params = []) => getPool().query(text, params);

// Run `fn(client)` inside a transaction; commits on success, rolls back on throw.
export async function withTransaction(fn) {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function closePool() {
  if (pool) { await pool.end(); pool = null; }
}
