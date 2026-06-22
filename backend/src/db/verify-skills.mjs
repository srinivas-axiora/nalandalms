// Manual verification for the Skills PG pilot. Requires DATABASE_URL.
// Runs migrate -> backfill -> exercises the repository -> cleans up test rows.
//   DATABASE_URL=postgres://... node backend/src/db/verify-skills.mjs
//
// Expected: skill insert returns a mapped row, a duplicate name is rejected with
// code DUPLICATE_SKILL, status update flips to Inactive, target insert returns a
// mapped row. Any assertion failure prints "FAIL".
import { migrate } from "./migrate.js";
import { backfill } from "./backfill.js";
import { query, closePool } from "./pool.js";
import * as repo from "../repositories/skills.repository.pg.js";

const assert = (cond, label) => console.log(`${cond ? "ok  " : "FAIL"}  ${label}`);
const nowIso = new Date().toISOString();

async function main() {
  await migrate();
  await backfill();

  const seeded = await repo.listSkills();
  assert(Array.isArray(seeded) && seeded.length > 0, `listSkills returns seeded rows (${seeded.length})`);

  const created = await repo.insertSkill({ id: "SKILL-PGTEST", name: "PG Pilot Skill", category: "Technical", description: "verify", status: "Active", createdAt: nowIso });
  assert(created.id === "SKILL-PGTEST" && created.status === "Active" && typeof created.createdAt === "string", "insertSkill maps row to API shape");

  let dupRejected = false;
  try { await repo.insertSkill({ id: "SKILL-PGTEST2", name: "PG Pilot Skill", category: "Technical" }); }
  catch (e) { dupRejected = e.code === "DUPLICATE_SKILL"; }
  assert(dupRejected, "duplicate (case-insensitive) name rejected with DUPLICATE_SKILL");

  const found = await repo.findSkillByName("pg pilot skill");
  assert(found && found.id === "SKILL-PGTEST", "findSkillByName is case-insensitive");

  const updated = await repo.setSkillStatus("SKILL-PGTEST", "Inactive");
  assert(updated && updated.status === "Inactive", "setSkillStatus updates + returns mapped row");

  const target = await repo.insertTargetSkill({ id: "TS-PGTEST", skillId: "SKILL-PGTEST", scope: "Organization", targetLevel: "Advanced", targetScore: 80, priority: "High", createdAt: nowIso });
  assert(target.id === "TS-PGTEST" && target.skillId === "SKILL-PGTEST" && target.department === undefined, "insertTargetSkill maps row (NULL->undefined)");

  const targets = await repo.listTargetSkills();
  assert(targets.some((t) => t.id === "TS-PGTEST"), "listTargetSkills includes inserted row");

  // cleanup test rows
  await query("DELETE FROM target_skills WHERE id = $1", ["TS-PGTEST"]);
  await query("DELETE FROM skills WHERE id = $1", ["SKILL-PGTEST"]);
  console.log("cleanup done.");
}

main()
  .then(() => closePool())
  .then(() => process.exit(0))
  .catch((err) => { console.error("[verify-skills] failed:", err?.message || err); process.exit(1); });
