// PostgreSQL repository for Skills and Target Skills (Phase-2 pilot).
// Returns objects in the SAME shape the app/API already use (camelCase, ISO
// timestamps), so it can replace the in-memory array access in the skills module
// without changing any response contract.
//
// ⚠️ UNVERIFIED-BY-AUTHOR: SQL not executed against a live DB here. Validate with
// the steps in docs/POSTGRES-MIGRATION.md before wiring into the app.
import { query, withTransaction } from "../db/pool.js";

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

export async function findSkillById(id) {
  const { rows } = await query("SELECT * FROM skills WHERE id = $1 LIMIT 1", [id]);
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

export async function createSkill({ actor, skill }) {
  try {
    return await withTransaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO skills (id, name, category, description, status, created_at)
         VALUES ($1, $2, $3, $4, $5, COALESCE($6::timestamptz, now()))
         RETURNING *`,
        [skill.id, skill.name, skill.category, skill.description ?? "", skill.status ?? "Active", skill.createdAt ?? null],
      );
      await client.query(
        `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
         VALUES ($1, 'CREATE_SKILL', 'SKILL', $2, $3::jsonb)`,
        [actor.id, rows[0].id, JSON.stringify({ category: rows[0].category })],
      );
      return mapSkill(rows[0]);
    });
  } catch (error) {
    if (error?.code === "23505") {
      const duplicate = new Error("Skill name already exists");
      duplicate.code = "DUPLICATE_SKILL";
      throw duplicate;
    }
    throw error;
  }
}

export async function updateSkillStatus({ actor, id, status }) {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      "UPDATE skills SET status = $2 WHERE id = $1 RETURNING *",
      [id, status],
    );
    if (!rows[0]) return null;
    await client.query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'SKILL_STATUS', 'SKILL', $2, $3::jsonb)`,
      [actor.id, rows[0].id, JSON.stringify({ status })],
    );
    return mapSkill(rows[0]);
  });
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

export class SkillTargetRepositoryError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "SkillTargetRepositoryError";
    this.code = code;
  }
}

const assertTargetAuthority = async (client, target) => {
  const skill = await client.query(
    "SELECT status FROM skills WHERE id = $1 FOR SHARE",
    [target.skillId],
  );
  if (!skill.rows[0]) {
    throw new SkillTargetRepositoryError("SKILL_NOT_FOUND", "Skill not found");
  }
  if (skill.rows[0].status !== "Active") {
    throw new SkillTargetRepositoryError("SKILL_INACTIVE", "Target rules require an active skill");
  }

  if (target.scope === "Organization") return;

  const referenceQueries = {
    Department: {
      sql: `SELECT 1 FROM users app_user
            JOIN departments department ON department.id = app_user.department_id
            WHERE department.name = $1 AND app_user.status = 'Active' LIMIT 1`,
      value: target.department,
    },
    Role: {
      sql: "SELECT 1 FROM users WHERE designation = $1 AND status = 'Active' LIMIT 1",
      value: target.designation,
    },
    Employee: {
      sql: "SELECT 1 FROM users WHERE id = $1 AND status = 'Active' LIMIT 1",
      value: target.userId,
    },
  };
  const reference = referenceQueries[target.scope];
  const result = await client.query(reference.sql, [reference.value]);
  if (!result.rows[0]) {
    throw new SkillTargetRepositoryError(
      "TARGET_SCOPE_NOT_FOUND",
      `Active ${target.scope.toLowerCase()} target not found`,
    );
  }
};

export async function createTargetSkill({ actor, target }) {
  return withTransaction(async (client) => {
    await assertTargetAuthority(client, target);
    const { rows } = await client.query(
      `INSERT INTO target_skills
         (id, skill_id, scope, department, designation, user_id, target_level, target_score, priority, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10::timestamptz, now()))
       RETURNING *`,
      [
        target.id, target.skillId, target.scope,
        target.department ?? null, target.designation ?? null, target.userId ?? null,
        target.targetLevel, target.targetScore, target.priority, target.createdAt ?? null,
      ],
    );
    await client.query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'CREATE_TARGET_SKILL', 'TARGET_SKILL', $2, $3::jsonb)`,
      [actor.id, rows[0].id, JSON.stringify({ skillId: target.skillId, scope: target.scope })],
    );
    return mapTarget(rows[0]);
  });
}

const adminRole = (role) => role === "Admin" || role === "Super Admin";

export class SkillFeedbackRepositoryError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "SkillFeedbackRepositoryError";
    this.code = code;
  }
}

const mapRating = (row) => ({
  id: row.id, userId: row.user_id, skill: row.skill,
  score: Number(row.score), assessmentsBased: Number(row.assessments_based || 0),
  trend: row.trend, lastUpdated: iso(row.last_updated),
});

const mapFeedback = (row) => ({
  id: row.id, chapterId: row.chapter_id, courseId: row.course_id,
  userId: row.user_id, rating: Number(row.rating), clarity: Number(row.clarity),
  relevance: Number(row.relevance), comments: row.comments,
  submittedAt: iso(row.submitted_at),
});

export async function listSkillRatings(actor) {
  const { rows } = await query(
    `SELECT rating.* FROM skill_ratings rating
     JOIN users app_user ON app_user.id = rating.user_id
     WHERE $1::boolean OR ($2::boolean AND app_user.manager_id = $3) OR app_user.id = $3
     ORDER BY rating.last_updated DESC, rating.id`,
    [adminRole(actor.role), actor.role === "Manager", actor.id],
  );
  return rows.map(mapRating);
}

export async function listChapterFeedback(actor) {
  const { rows } = await query(
    `SELECT feedback.* FROM chapter_feedbacks feedback
     JOIN users app_user ON app_user.id = feedback.user_id
     WHERE $1::boolean OR ($2::boolean AND app_user.manager_id = $3) OR app_user.id = $3
     ORDER BY feedback.submitted_at DESC, feedback.id`,
    [adminRole(actor.role), actor.role === "Manager", actor.id],
  );
  return rows.map(mapFeedback);
}

export async function upsertChapterFeedback({ actor, feedback }) {
  return withTransaction(async (client) => {
    const authority = await client.query(
      `SELECT chapter.id FROM chapters chapter
       JOIN courses course ON course.id = chapter.course_id
       JOIN enrollments enrollment
         ON enrollment.course_id = course.id AND enrollment.user_id = $3
       WHERE chapter.id = $1 AND course.id = $2
         AND course.status = 'Active' AND course.approval = 'Approved'
       LIMIT 1`,
      [feedback.chapterId, feedback.courseId, actor.id],
    );
    if (!authority.rows[0]) {
      throw new SkillFeedbackRepositoryError("FEEDBACK_SCOPE_DENIED", "Active enrollment and matching chapter are required");
    }
    const { rows } = await client.query(
      `INSERT INTO chapter_feedbacks (
         id, chapter_id, course_id, user_id, rating, clarity, relevance, comments
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (chapter_id, user_id) DO UPDATE SET
         rating = EXCLUDED.rating, clarity = EXCLUDED.clarity,
         relevance = EXCLUDED.relevance, comments = EXCLUDED.comments,
         submitted_at = now()
       RETURNING *`,
      [feedback.id, feedback.chapterId, feedback.courseId, actor.id,
        feedback.rating, feedback.clarity, feedback.relevance, feedback.comments],
    );
    await client.query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'CHAPTER_FEEDBACK', 'FEEDBACK', $2, $3::jsonb)`,
      [actor.id, rows[0].id, JSON.stringify({ chapterId: feedback.chapterId, courseId: feedback.courseId })],
    );
    return mapFeedback(rows[0]);
  });
}
