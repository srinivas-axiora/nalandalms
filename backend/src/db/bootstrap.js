// Creates the normalized baseline on an empty database, then applies all
// forward-only migrations. This command is intentionally separate from server
// startup: operators must take a backup and run/verify migrations before a
// release switches any repository feature flag on.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPool, withTransaction, closePool } from "./pool.js";
import { migrate } from "./migrate.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_FILE = path.resolve(__dirname, "..", "..", "..", "database", "schema.sql");
const RELATIONAL_SENTINELS = ["users", "skills", "courses", "payment_orders"];

export async function bootstrapSchema() {
  const pool = getPool();
  const { rows } = await pool.query(
    `SELECT name, to_regclass('public.' || name) IS NOT NULL AS present
     FROM unnest($1::text[]) AS sentinel(name)`,
    [RELATIONAL_SENTINELS]
  );
  const present = rows.filter((row) => row.present).map((row) => row.name);
  if (present.includes("users")) return { created: false };
  if (present.length) {
    throw new Error(
      `Refusing baseline bootstrap because a partial relational schema exists: ${present.join(", ")}`
    );
  }
  const sql = fs.readFileSync(SCHEMA_FILE, "utf8");
  await withTransaction((client) => client.query(sql));
  return { created: true };
}

export async function bootstrapAndMigrate() {
  const baseline = await bootstrapSchema();
  await migrate();
  return baseline;
}

if (process.argv[1]?.endsWith("bootstrap.js")) {
  bootstrapAndMigrate()
    .then(({ created }) => {
      console.log(created ? "Created normalized database baseline." : "Normalized database baseline already exists.");
      return closePool();
    })
    .then(() => process.exit(0))
    .catch(async (error) => {
      console.error("[bootstrap] failed:", error?.message || error);
      await closePool().catch(() => {});
      process.exit(1);
    });
}
