// One-off backfill: copy existing Skills + Target Skills into the relational
// tables created by migration 0001. Idempotent (upsert on id). Run AFTER migrate:
//   node backend/src/db/migrate.js && node backend/src/db/backfill.js
//
// Source of truth: database/db.json (the file store) if present; otherwise the
// in-memory seed. If your current store is PostgreSQL-JSONB (Phase-1 adapter),
// export that collection to db.json first, or adapt the source below.
//
// ⚠️ UNVERIFIED-BY-AUTHOR — validate against a real Postgres (docs/POSTGRES-MIGRATION.md).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { query, closePool } from "./pool.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_JSON = path.resolve(__dirname, "..", "..", "..", "database", "db.json");

async function loadSource() {
  if (fs.existsSync(DB_JSON)) {
    const data = JSON.parse(fs.readFileSync(DB_JSON, "utf8"));
    return { skills: data.skills || [], targetSkills: data.targetSkills || [], source: "db.json" };
  }
  const core = await import("../core.js");
  return { skills: core.skills || [], targetSkills: core.targetSkills || [], source: "in-memory seed" };
}

export async function backfill() {
  const { skills, targetSkills, source } = await loadSource();
  console.log(`Backfilling from ${source}: ${skills.length} skills, ${targetSkills.length} target skills`);

  for (const s of skills) {
    await query(
      `INSERT INTO skills (id, name, category, description, status, created_at)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6::timestamptz, now()))
       ON CONFLICT (id) DO UPDATE
         SET name = EXCLUDED.name, category = EXCLUDED.category,
             description = EXCLUDED.description, status = EXCLUDED.status`,
      [s.id, s.name, s.category || "Technical", s.description || "", s.status || "Active", s.createdAt || null]
    );
  }

  for (const t of targetSkills) {
    await query(
      `INSERT INTO target_skills
         (id, skill_id, scope, department, designation, user_id, target_level, target_score, priority, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10::timestamptz, now()))
       ON CONFLICT (id) DO UPDATE
         SET skill_id = EXCLUDED.skill_id, scope = EXCLUDED.scope, department = EXCLUDED.department,
             designation = EXCLUDED.designation, user_id = EXCLUDED.user_id,
             target_level = EXCLUDED.target_level, target_score = EXCLUDED.target_score, priority = EXCLUDED.priority`,
      [
        t.id, t.skillId, t.scope, t.department ?? null, t.designation ?? null, t.userId ?? null,
        t.targetLevel || "Intermediate", t.targetScore ?? 80, t.priority || "Medium", t.createdAt || null,
      ]
    );
  }
  console.log("Backfill complete.");
}

if (process.argv[1]?.endsWith("backfill.js")) {
  backfill()
    .then(() => closePool())
    .then(() => process.exit(0))
    .catch((err) => { console.error("[backfill] failed:", err?.message || err); process.exit(1); });
}
