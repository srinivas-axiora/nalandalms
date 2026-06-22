// PostgreSQL repository for Skills and Target Skills (Phase-2 pilot).
// Returns objects in the SAME shape the app/API already use (camelCase, ISO
// timestamps), so it can replace the in-memory array access in the skills module
// without changing any response contract.
//
// ⚠️ UNVERIFIED-BY-AUTHOR: SQL not executed against a live DB here. Validate with
// the steps in docs/POSTGRES-MIGRATION.md before wiring into the app.
import { query } from "../db/pool.js";

const iso = (v) => (v instanceof Date ? v.toISOString() : v);

const mapSkill = (r) => ({
  id: r.id,
  name: r.name,
  category: r.category,
  description: r.description,
  status: r.status,
  createdAt: iso(r.created_at),
});

const mapTarget = (r) => ({
  id: r.id,
  skillId: r.skill_id,
  scope: r.scope,
  department: r.department ?? undefined,
  designation: r.designation ?? undefined,
  userId: r.user_id ?? undefined,
  targetLevel: r.target_level,
  targetScore: r.target_score,
  priority: r.priority,
  createdAt: iso(r.created_at),
});

// ── Skills ──
export async function listSkills() {
  const { rows } = await query("SELECT * FROM skills ORDER BY created_at DESC, id");
  return rows.map(mapSkill);
}

export async function findSkillByName(name) {
  const { rows } = await query("SELECT * FROM skills WHERE lower(name) = lower($1) LIMIT 1", [name]);
  return rows[0] ? mapSkill(rows[0]) : null;
}

// Inserts a pre-built skill object ({ id, name, category, description, status, createdAt }).
// Throws Error with code "DUPLICATE_SKILL" if the (case-insensitive) name exists.
export async function insertSkill(skill) {
  try {
    const { rows } = await query(
      `INSERT INTO skills (id, name, category, description, status, created_at)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6::timestamptz, now()))
       RETURNING *`,
      [skill.id, skill.name, skill.category, skill.description ?? "", skill.status ?? "Active", skill.createdAt ?? null]
    );
    return mapSkill(rows[0]);
  } catch (err) {
    if (err?.code === "23505") {
      const e = new Error("Skill name already exists");
      e.code = "DUPLICATE_SKILL";
      throw e;
    }
    throw err;
  }
}

export async function setSkillStatus(id, status) {
  const { rows } = await query(
    "UPDATE skills SET status = $2 WHERE id = $1 RETURNING *",
    [id, status]
  );
  return rows[0] ? mapSkill(rows[0]) : null;
}

// ── Target Skills ──
export async function listTargetSkills() {
  const { rows } = await query("SELECT * FROM target_skills ORDER BY created_at DESC, id");
  return rows.map(mapTarget);
}

export async function insertTargetSkill(target) {
  const { rows } = await query(
    `INSERT INTO target_skills
       (id, skill_id, scope, department, designation, user_id, target_level, target_score, priority, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10::timestamptz, now()))
     RETURNING *`,
    [
      target.id, target.skillId, target.scope,
      target.department ?? null, target.designation ?? null, target.userId ?? null,
      target.targetLevel, target.targetScore, target.priority, target.createdAt ?? null,
    ]
  );
  return mapTarget(rows[0]);
}
