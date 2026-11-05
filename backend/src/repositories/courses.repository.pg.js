// PostgreSQL repository for Courses.
import { query } from "../db/pool.js";

const iso = (v) => (v instanceof Date ? v.toISOString() : v);

const mapCourse = (r) => ({
  id: r.id,
  title: r.title,
  description: r.description,
  skill: r.skill,
  skillIds: r.skill_ids || [],
  targetLevel: r.target_level,
  difficulty: r.difficulty || "Beginner",
  estimatedHours: Number(r.estimated_hours || 4),
  priceCents: Number(r.price_cents || 0),
  currency: r.currency || "INR",
  isFree: Number(r.price_cents || 0) === 0,
  category: r.category || "General",
  prerequisites: r.prerequisites || [],
  tags: r.tags || [],
  thumbnailColor: r.thumbnail_color || "#22d3ee",
  contentTypes: r.content_types || ["Rich Text"],
  status: r.status,
  approval: r.approval,
  ownerId: r.owner_id,
  version: r.current_version || 1,
  createdAt: iso(r.created_at),
  updatedAt: iso(r.updated_at),
  storage: typeof r.storage_metadata === "string"
    ? JSON.parse(r.storage_metadata)
    : (r.storage_metadata || { files: [] }),
});

export async function listCourses(filters = {}) {
  let sql = "SELECT * FROM courses WHERE 1=1";
  const params = [];

  if (filters.status && filters.status !== "All") {
    params.push(filters.status);
    sql += ` AND status = $${params.length}::lifecycle_status`;
  }
  if (filters.approval) {
    params.push(filters.approval);
    sql += ` AND approval = $${params.length}::approval_status`;
  }
  if (filters.skill) {
    params.push(filters.skill);
    sql += ` AND (skill = $${params.length} OR $${params.length} = ANY(skill_ids))`;
  }

  sql += " ORDER BY created_at DESC";
  const { rows } = await query(sql, params);
  return rows.map(mapCourse);
}

export async function findCourseById(id) {
  const { rows } = await query("SELECT * FROM courses WHERE id = $1 LIMIT 1", [id]);
  return rows[0] ? mapCourse(rows[0]) : null;
}

export async function insertCourse(course) {
  const { rows } = await query(
    `INSERT INTO courses (
       id, title, description, skill, skill_ids, target_level, difficulty,
       estimated_hours, price_cents, currency, category, prerequisites, tags, thumbnail_color,
       status, approval, owner_id, current_version, created_at, updated_at
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7,
       $8, $9, $10, $11, $12, $13, $14,
       $15::lifecycle_status, $16::approval_status, $17, $18,
       COALESCE($19::timestamptz, now()), now()
     ) RETURNING *`,
    [
      course.id,
      course.title,
      course.description,
      course.skill || "",
      course.skillIds || [],
      course.targetLevel || "Beginner",
      course.difficulty || "Beginner",
      course.estimatedHours || 4,
      course.priceCents || 0,
      course.currency || "INR",
      course.category || "General",
      course.prerequisites || [],
      course.tags || [],
      course.thumbnailColor || "#22d3ee",
      course.status || "Active",
      course.approval || "Pending",
      course.ownerId,
      course.version || 1,
      course.createdAt || null,
    ]
  );
  return mapCourse(rows[0]);
}

export async function updateCourse(id, updates) {
  const fields = [];
  const params = [id];

  const mapField = (key, dbCol, cast = "") => {
    if (updates[key] !== undefined) {
      params.push(updates[key]);
      fields.push(`${dbCol} = $${params.length}${cast}`);
    }
  };

  mapField("title", "title");
  mapField("description", "description");
  mapField("skill", "skill");
  mapField("skillIds", "skill_ids");
  mapField("targetLevel", "target_level");
  mapField("difficulty", "difficulty");
  mapField("estimatedHours", "estimated_hours");
  mapField("priceCents", "price_cents");
  mapField("currency", "currency");
  mapField("category", "category");
  mapField("prerequisites", "prerequisites");
  mapField("tags", "tags");
  mapField("thumbnailColor", "thumbnail_color");
  mapField("status", "status", "::lifecycle_status");
  mapField("approval", "approval", "::approval_status");
  mapField("version", "current_version");

  fields.push("updated_at = now()");
  const sql = `UPDATE courses SET ${fields.join(", ")} WHERE id = $1 RETURNING *`;
  const { rows } = await query(sql, params);
  return rows[0] ? mapCourse(rows[0]) : null;
}

