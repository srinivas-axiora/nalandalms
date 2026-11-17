// Minimal forward-only migration runner.
// Applies database/migrations/*.sql in filename order, each in its own
// transaction, recording applied versions in a schema_migrations table so reruns
// are idempotent. Run with: node backend/src/db/migrate.js
//
// ⚠️ UNVERIFIED-BY-AUTHOR — validate against a real Postgres (see docs/POSTGRES-MIGRATION.md).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPool, withTransaction, closePool } from "./pool.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.resolve(__dirname, "..", "..", "..", "database", "migrations");

async function ensureMigrationsTable() {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function appliedVersions() {
  const { rows } = await getPool().query("SELECT version FROM schema_migrations");
  return new Set(rows.map((r) => r.version));
}

export async function migrate() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error(`No migrations directory at ${MIGRATIONS_DIR}`);
    return;
  }
  await ensureMigrationsTable();
  const done = await appliedVersions();
  const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort();
  let applied = 0;
  for (const file of files) {
    if (done.has(file)) { console.log(`• skip   ${file} (already applied)`); continue; }
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    // ALTER TYPE ... ADD VALUE cannot run inside a transaction block in PostgreSQL.
    const hasAlterTypeAddValue = /ALTER\s+TYPE\s+.*\s+ADD\s+VALUE/i.test(sql);
    if (hasAlterTypeAddValue) {
      const client = await getPool().connect();
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [file]);
      } finally {
        client.release();
      }
    } else {
      await withTransaction(async (client) => {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [file]);
      });
    }
    applied += 1;
    console.log(`✓ apply  ${file}`);
  }
  console.log(applied ? `Applied ${applied} migration(s).` : "Database is up to date.");
}

// Run directly (node backend/src/db/migrate.js)
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("migrate.js")) {
  migrate()
    .then(() => closePool())
    .then(() => process.exit(0))
    .catch((err) => { console.error("[migrate] failed:", err?.message || err); process.exit(1); });
}
