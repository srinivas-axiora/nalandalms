// PostgreSQL repository for Enrollments.
import { query } from "../db/pool.js";

const iso = (v) => (v instanceof Date ? v.toISOString() : v);

const mapEnrollment = (r) => ({
  id: r.id,
  courseId: r.course_id,
  userId: r.user_id,
  assignedBy: r.assigned_by,
  cohortId: r.cohort_id || null,
  dueAt: r.due_at ? iso(r.due_at) : null,
  priority: r.priority || "Medium",
  mandatory: Boolean(r.mandatory),
  progress: Number(r.progress || 0),
  completedChapters: r.completed_chapters || [],
  timeSpentMinutes: Number(r.time_spent_minutes || 0),
  timeSpentSeconds: Number(r.time_spent_seconds || 0),
  chapterTimeSpentSeconds: r.chapter_time_spent_seconds || {},
  lastHeartbeatTimestamps: r.chapter_heartbeat_timestamps || {},
  videoProgress: r.video_progress || {},
  lastHeartbeatAt: r.last_heartbeat_at ? iso(r.last_heartbeat_at) : null,
  status: r.status || "Enrolled",
  version: Number(r.version || 0),
  certificateId: r.certificate_id || null,
  startedAt: iso(r.started_at),
  completedAt: r.completed_at ? iso(r.completed_at) : null,
});

export async function listEnrollments(filters = {}) {
  let sql = "SELECT * FROM enrollments WHERE 1=1";
  const params = [];
  if (filters.userId) {
    params.push(filters.userId);
    sql += ` AND user_id = $${params.length}`;
  }
  if (filters.courseId) {
    params.push(filters.courseId);
    sql += ` AND course_id = $${params.length}`;
  }
  sql += " ORDER BY started_at DESC";
  const { rows } = await query(sql, params);
  return rows.map(mapEnrollment);
}

export async function findEnrollment(courseId, userId) {
  const { rows } = await query(
    "SELECT * FROM enrollments WHERE course_id = $1 AND user_id = $2 LIMIT 1",
    [courseId, userId]
  );
  return rows[0] ? mapEnrollment(rows[0]) : null;
}

export async function insertEnrollment(enrollment) {
  const { rows } = await query(
    `INSERT INTO enrollments (
       id, course_id, user_id, assigned_by, cohort_id, due_at, priority,
       mandatory, progress, completed_chapters, time_spent_minutes,
       time_spent_seconds, chapter_time_spent_seconds, chapter_heartbeat_timestamps,
       video_progress, last_heartbeat_at, version, status, certificate_id, started_at
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7,
       $8, $9, $10, $11,
       $12, $13, $14, $15, $16, $17, $18, $19, COALESCE($20::timestamptz, now())
     ) RETURNING *`,
    [
      enrollment.id,
      enrollment.courseId,
      enrollment.userId,
      enrollment.assignedBy,
      enrollment.cohortId || null,
      enrollment.dueAt || null,
      enrollment.priority || "Medium",
      enrollment.mandatory ?? false,
      enrollment.progress || 0,
      enrollment.completedChapters || [],
      enrollment.timeSpentMinutes || 0,
      enrollment.timeSpentSeconds || 0,
      JSON.stringify(enrollment.chapterTimeSpentSeconds || {}),
      JSON.stringify(enrollment.lastHeartbeatTimestamps || {}),
      JSON.stringify(enrollment.videoProgress || {}),
      enrollment.lastHeartbeatAt || null,
      enrollment.version || 0,
      enrollment.status || "Enrolled",
      enrollment.certificateId || null,
      enrollment.startedAt || null,
    ]
  );
  return mapEnrollment(rows[0]);
}

export async function updateEnrollmentProgress(id, updates) {
  const fields = [];
  const params = [id];

  if (updates.progress !== undefined) {
    params.push(updates.progress);
    fields.push(`progress = $${params.length}`);
  }
  if (updates.completedChapters !== undefined) {
    params.push(updates.completedChapters);
    fields.push(`completed_chapters = $${params.length}`);
  }
  if (updates.timeSpentMinutes !== undefined) {
    params.push(updates.timeSpentMinutes);
    fields.push(`time_spent_minutes = $${params.length}`);
  }
  if (updates.timeSpentSeconds !== undefined) {
    params.push(updates.timeSpentSeconds);
    fields.push(`time_spent_seconds = $${params.length}`);
  }
  if (updates.chapterTimeSpentSeconds !== undefined) {
    params.push(JSON.stringify(updates.chapterTimeSpentSeconds));
    fields.push(`chapter_time_spent_seconds = $${params.length}`);
  }
  if (updates.completedAt !== undefined) {
    params.push(updates.completedAt);
    fields.push(`completed_at = $${params.length}::timestamptz`);
  }
  if (updates.status !== undefined) {
    params.push(updates.status);
    fields.push(`status = $${params.length}`);
  }
  if (updates.certificateId !== undefined) {
    params.push(updates.certificateId);
    fields.push(`certificate_id = $${params.length}`);
  }

  const sql = `UPDATE enrollments SET ${fields.join(", ")} WHERE id = $1 RETURNING *`;
  const { rows } = await query(sql, params);
  return rows[0] ? mapEnrollment(rows[0]) : null;
}

