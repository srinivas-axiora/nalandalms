import { query, withTransaction } from "../db/pool.js";

const iso = (value) => value instanceof Date ? value.toISOString() : value;
const isAdmin = (role) => role === "Admin" || role === "Super Admin";

const mapRow = (row) => ({
  id: String(row.id),
  skillName: row.skill_name,
  courseLevel: row.course_level,
  feedbackType: row.feedback_type,
  rating: Number(row.rating),
  comment: row.comment,
  createdBy: row.created_by,
  createdAt: iso(row.created_at),
  expiresAt: iso(row.expires_at),
});

export function createAiFeedbackRepository(db = { query, withTransaction }) {
  const list = async (actor, limit = 25) => {
    const { rows } = await db.query(
      `SELECT id, skill_name, course_level, feedback_type, rating, comment,
              created_by, created_at, expires_at
       FROM ai_generation_feedback
       WHERE status = 'Active' AND expires_at > now()
         AND ($1::boolean OR created_by = $2)
       ORDER BY created_at DESC, id DESC
       LIMIT $3`,
      [isAdmin(actor.role), actor.id, limit],
    );
    return rows.map(mapRow);
  };

  const create = async ({ actor, feedback }) => db.withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO ai_generation_feedback (
         skill_name, course_level, feedback_type, rating, comment, created_by
       ) VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, skill_name, course_level, feedback_type, rating, comment,
                 created_by, created_at, expires_at`,
      [feedback.skillName, feedback.courseLevel, feedback.feedbackType, feedback.rating, feedback.comment, actor.id],
    );
    const item = mapRow(rows[0]);
    await client.query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'ACHARYA_FEEDBACK', 'ACHARYA', $2, $3::jsonb)`,
      [actor.id, item.id, JSON.stringify({ feedbackType: item.feedbackType, rating: item.rating })],
    );
    return item;
  });

  const findRelevant = async ({ actor, skillName, courseLevel }) => {
    const { rows } = await db.query(
      `SELECT id, skill_name, course_level, feedback_type, rating, comment,
              created_by, created_at, expires_at
       FROM ai_generation_feedback
       WHERE status = 'Active' AND expires_at > now()
         AND ($1::boolean OR created_by = $2)
         AND (lower(skill_name) = lower($3) OR course_level = $4 OR rating <= 3)
       ORDER BY
         (CASE WHEN lower(skill_name) = lower($3) THEN 4 ELSE 0 END
          + CASE WHEN course_level = $4 THEN 2 ELSE 0 END
          + CASE WHEN rating <= 3 THEN 1 ELSE 0 END) DESC,
         created_at DESC, id DESC
       LIMIT 5`,
      [isAdmin(actor.role), actor.id, skillName, courseLevel],
    );
    return rows.map(mapRow);
  };

  return { list, create, findRelevant };
}

export const aiFeedbackRepository = createAiFeedbackRepository();
