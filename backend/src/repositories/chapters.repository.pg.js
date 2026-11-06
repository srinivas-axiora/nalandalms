// PostgreSQL repository for Chapters.
import { query } from "../db/pool.js";

const iso = (v) => (v instanceof Date ? v.toISOString() : v);

const mapChapter = (r) => ({
  id: r.id,
  courseId: r.course_id,
  sequence: r.sequence,
  title: r.title,
  description: r.description || "",
  contentType: r.content_type,
  body: r.body || "",
  url: r.url || undefined,
  fileName: r.file_name || undefined,
  durationMinutes: r.duration_minutes,
  minimumTimeMinutes: r.minimum_time_minutes ?? 1,
  version: Number(r.version || 1),
  createdAt: iso(r.created_at),
  updatedAt: iso(r.updated_at),
});

const mapChapterMetadata = (r) => ({
  id: r.id,
  courseId: r.course_id,
  sequence: r.sequence,
  title: r.title,
  description: r.description || "",
  durationMinutes: r.duration_minutes,
  minimumTimeMinutes: r.minimum_time_minutes ?? 1,
  version: Number(r.version || 1),
});

export async function listChapters(courseId) {
  let sql = "SELECT * FROM chapters";
  const params = [];
  if (courseId) {
    sql += " WHERE course_id = $1";
    params.push(courseId);
  }
  sql += " ORDER BY sequence ASC, created_at ASC";
  const { rows } = await query(sql, params);
  return rows.map(mapChapter);
}

export async function listChapterMetadata(courseId) {
  if (!courseId) return [];
  const { rows } = await query(
    `SELECT id, course_id, sequence, title, description,
            duration_minutes, minimum_time_minutes, version
       FROM chapters
      WHERE course_id = $1
      ORDER BY sequence ASC, created_at ASC`,
    [courseId]
  );
  return rows.map(mapChapterMetadata);
}

export async function findChapterById(id) {
  const { rows } = await query("SELECT * FROM chapters WHERE id = $1 LIMIT 1", [id]);
  return rows[0] ? mapChapter(rows[0]) : null;
}

export async function insertChapter(chapter) {
  const { rows } = await query(
    `INSERT INTO chapters (
       id, course_id, sequence, title, description, content_type,
       body, url, file_name, duration_minutes, minimum_time_minutes, created_at, updated_at
     ) VALUES (
       $1, $2, $3, $4, $5, $6,
       $7, $8, $9, $10, $11, COALESCE($12::timestamptz, now()), now()
     ) RETURNING *`,
    [
      chapter.id,
      chapter.courseId,
      chapter.sequence || 1,
      chapter.title,
      chapter.description || "",
      chapter.contentType || "Rich Text",
      chapter.body || "",
      chapter.url || null,
      chapter.fileName || null,
      chapter.durationMinutes || 10,
      chapter.minimumTimeMinutes ?? 1,
      chapter.createdAt || null,
    ]
  );
  return mapChapter(rows[0]);
}

export async function updateChapter(id, updates) {
  const fields = [];
  const params = [id];

  const mapField = (key, dbCol) => {
    if (updates[key] !== undefined) {
      params.push(updates[key]);
      fields.push(`${dbCol} = $${params.length}`);
    }
  };

  mapField("title", "title");
  mapField("description", "description");
  mapField("sequence", "sequence");
  mapField("contentType", "content_type");
  mapField("body", "body");
  mapField("url", "url");
  mapField("fileName", "file_name");
  mapField("durationMinutes", "duration_minutes");
  mapField("minimumTimeMinutes", "minimum_time_minutes");

  fields.push("updated_at = now()");
  const sql = `UPDATE chapters SET ${fields.join(", ")} WHERE id = $1 RETURNING *`;
  const { rows } = await query(sql, params);
  return rows[0] ? mapChapter(rows[0]) : null;
}

