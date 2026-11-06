import { query } from "../db/pool.js";
import { isAdminRole } from "../roles.js";

const iso = (value) => value instanceof Date ? value.toISOString() : value;

const mapActiveSession = (row) => ({
  attempt: {
    id: row.attempt_id,
    assessmentId: row.assessment_id,
    courseId: row.course_id,
    userId: row.user_id,
    status: row.status,
    startedAt: iso(row.started_at),
    expiresAt: row.expires_at ? iso(row.expires_at) : null,
    isPaused: Boolean(row.is_paused),
    pausedAt: row.paused_at ? iso(row.paused_at) : null,
    resumedAt: row.resumed_at ? iso(row.resumed_at) : null,
    durationMinutesSnapshot: Number(row.duration_minutes_snapshot || 0),
    flags: row.flags || [],
    warnings: row.warnings || [],
    videoChunks: row.video_chunks || [],
    companion: row.companion || null,
    trustScore: Number(row.trust_score ?? 100),
    assignedProctorId: row.assigned_proctor_id || null,
  },
  candidate: {
    name: row.candidate_name || "Unknown Candidate",
    email: row.candidate_email || "",
  },
  assessment: { title: row.assessment_title || "Exam" },
  course: { title: row.course_title || "Unknown Course" },
});

export function createProctorCockpitRepository(db = { query }) {
  const listActiveForActor = async (actor) => {
    const { rows } = await db.query(
      `SELECT aa.id AS attempt_id, aa.assessment_id, aa.course_id, aa.user_id,
              aa.status, aa.started_at, aa.expires_at, aa.is_paused,
              aa.paused_at, aa.resumed_at, aa.duration_minutes_snapshot,
              aa.flags, aa.warnings, aa.video_chunks, aa.companion,
              aa.trust_score, aa.assigned_proctor_id,
              candidate.name AS candidate_name,
              candidate.email AS candidate_email,
              assessment.title AS assessment_title,
              course.title AS course_title
         FROM assessment_attempts aa
         JOIN users candidate ON candidate.id = aa.user_id
         JOIN assessments assessment ON assessment.id = aa.assessment_id
         LEFT JOIN courses course ON course.id = aa.course_id
        WHERE aa.status = ANY($1::text[])
          AND ($2::boolean
            OR aa.assigned_proctor_id = $3
            OR assessment.owner_id = $3
            OR course.owner_id = $3)
        ORDER BY aa.started_at ASC, aa.id`,
      [["InProgress", "Paused"], isAdminRole(actor?.role), actor?.id || null]
    );
    return rows.map(mapActiveSession);
  };

  return { listActiveForActor };
}

export const proctorCockpitRepository = createProctorCockpitRepository();
