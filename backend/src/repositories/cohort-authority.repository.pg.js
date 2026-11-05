import crypto from "node:crypto";
import { query, withTransaction } from "../db/pool.js";

const iso = (value) => (value instanceof Date ? value.toISOString() : value);
const isAdmin = (role) => role === "Admin" || role === "Super Admin";

export const hashCohortInviteCode = (code) => {
  const normalized = String(code || "").trim().toUpperCase();
  return crypto.createHash("sha256").update(normalized).digest("hex");
};

export class CohortAuthorityError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "CohortAuthorityError";
    this.code = code;
    this.details = details;
  }
}

const fail = (code, message, details) => {
  throw new CohortAuthorityError(code, message, details);
};

export const mapCohortRow = (row) => row && ({
  id: row.id,
  name: row.name,
  courseId: row.course_id,
  instructorId: row.instructor_id,
  startDate: iso(row.start_date),
  endDate: row.end_date ? iso(row.end_date) : null,
  capacity: Number(row.capacity),
  description: row.description || "",
  active: Boolean(row.active),
  version: Number(row.version || 1),
  createdAt: iso(row.created_at),
  updatedAt: iso(row.updated_at),
  ...(row.course_title !== undefined ? { courseTitle: row.course_title || "Unknown Course" } : {}),
  ...(row.member_count !== undefined ? { memberCount: Number(row.member_count || 0) } : {}),
});

const mapEnrollmentRow = (row) => row && ({
  id: row.id,
  courseId: row.course_id,
  userId: row.user_id,
  assignedBy: row.assigned_by,
  cohortId: row.cohort_id || null,
  dueAt: row.due_at ? iso(row.due_at) : null,
  priority: row.priority,
  mandatory: Boolean(row.mandatory),
  progress: Number(row.progress || 0),
  completedChapters: row.completed_chapters || [],
  timeSpentMinutes: Number(row.time_spent_minutes || 0),
  timeSpentSeconds: Number(row.time_spent_seconds || 0),
  chapterTimeSpentSeconds: row.chapter_time_spent_seconds || {},
  status: row.status,
  version: Number(row.version || 0),
  startedAt: iso(row.started_at),
  completedAt: row.completed_at ? iso(row.completed_at) : null,
});

const audit = (client, actorId, action, cohortId, metadata = {}) => client.query(
  `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
   VALUES ($1, $2, 'COHORT', $3, $4::jsonb)`,
  [actorId, action, cohortId, JSON.stringify(metadata)],
);

export function createCohortAuthorityRepository(db = { query, withTransaction }) {
  const createCohort = async ({ actor, cohort, inviteCodeHash }) => {
    try {
      return await db.withTransaction(async (client) => {
        const courseResult = await client.query(
          "SELECT id, owner_id, status, approval FROM courses WHERE id = $1 FOR SHARE",
          [cohort.courseId],
        );
        const course = courseResult.rows[0];
        if (!course || course.status !== "Active" || course.approval !== "Approved") {
          fail("COURSE_NOT_FOUND", "Approved active course not found");
        }
        if (!isAdmin(actor.role) && course.owner_id !== actor.id) {
          fail("FORBIDDEN", "You cannot create a cohort for this course");
        }
        if (cohort.endDate && new Date(cohort.endDate) <= new Date(cohort.startDate)) {
          fail("INVALID_DATE_RANGE", "Cohort end date must be after its start date");
        }

        const inserted = await client.query(
          `INSERT INTO cohorts (
             id, course_id, instructor_id, name, description, start_date,
             end_date, capacity, invite_code_hash, active, version
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, 1)
           RETURNING *`,
          [
            cohort.id, cohort.courseId, actor.id, cohort.name, cohort.description,
            cohort.startDate, cohort.endDate, cohort.capacity, inviteCodeHash,
          ],
        );
        await audit(client, actor.id, "CREATE_COHORT", cohort.id, {
          courseId: cohort.courseId,
          capacity: cohort.capacity,
        });
        return mapCohortRow(inserted.rows[0]);
      });
    } catch (error) {
      if (error?.code === "23505" && error?.constraint === "cohorts_invite_code_hash_key") {
        fail("INVITE_CONFLICT", "Unable to allocate a unique cohort invite code");
      }
      throw error;
    }
  };

  const listCohorts = async (actor) => {
    const params = [];
    let visibility = "true";
    if (!isAdmin(actor.role) && ["Manager", "Instructor"].includes(actor.role)) {
      params.push(actor.id);
      visibility = `(cohort.instructor_id = $${params.length} OR course.owner_id = $${params.length})`;
    } else if (!isAdmin(actor.role)) {
      params.push(actor.id);
      visibility = `EXISTS (
        SELECT 1 FROM enrollments member
        WHERE member.cohort_id = cohort.id AND member.user_id = $${params.length}
      )`;
    }
    const { rows } = await db.query(
      `SELECT cohort.*, course.title AS course_title,
              count(enrollment.id)::integer AS member_count
       FROM cohorts cohort
       JOIN courses course ON course.id = cohort.course_id
       LEFT JOIN enrollments enrollment ON enrollment.cohort_id = cohort.id
       WHERE ${visibility}
       GROUP BY cohort.id, course.title
       ORDER BY cohort.created_at DESC`,
      params,
    );
    return rows.map(mapCohortRow);
  };

  const findVisibleCohort = async ({ cohortId, actor }) => {
    const { rows } = await db.query(
      `SELECT cohort.*, course.title AS course_title,
              count(enrollment.id)::integer AS member_count
       FROM cohorts cohort
       JOIN courses course ON course.id = cohort.course_id
       LEFT JOIN enrollments enrollment ON enrollment.cohort_id = cohort.id
       WHERE cohort.id = $1
         AND (
           $2::boolean
           OR cohort.instructor_id = $3
           OR course.owner_id = $3
           OR EXISTS (
             SELECT 1 FROM enrollments member
             WHERE member.cohort_id = cohort.id AND member.user_id = $3
           )
         )
       GROUP BY cohort.id, course.title`,
      [cohortId, isAdmin(actor.role), actor.id],
    );
    if (!rows[0]) fail("COHORT_NOT_FOUND", "Cohort not found");
    return mapCohortRow(rows[0]);
  };

  const joinCohort = async ({ actor, inviteCodeHash, enrollmentId }) => {
    try {
      return await db.withTransaction(async (client) => {
        const cohortResult = await client.query(
          `SELECT cohort.*, course.title AS course_title,
                  course.status AS course_status, course.approval AS course_approval
           FROM cohorts cohort
           JOIN courses course ON course.id = cohort.course_id
           WHERE cohort.invite_code_hash = $1
           FOR UPDATE OF cohort, course`,
          [inviteCodeHash],
        );
        const cohortRow = cohortResult.rows[0];
        if (!cohortRow || !cohortRow.active
          || (cohortRow.end_date && new Date(cohortRow.end_date) <= new Date())) {
          fail("INVITE_INVALID", "Invalid or expired cohort invite code");
        }
        if (cohortRow.course_status !== "Active" || cohortRow.course_approval !== "Approved") {
          fail("COURSE_INACTIVE", "The course associated with this cohort is no longer active");
        }

        const userResult = await client.query(
          "SELECT id, status FROM users WHERE id = $1 FOR SHARE",
          [actor.id],
        );
        if (userResult.rows[0]?.status !== "Active") fail("USER_INACTIVE", "Active account required");

        const existingResult = await client.query(
          "SELECT * FROM enrollments WHERE course_id = $1 AND user_id = $2 FOR UPDATE",
          [cohortRow.course_id, actor.id],
        );
        const existing = existingResult.rows[0];
        if (existing?.cohort_id === cohortRow.id) {
          return {
            cohort: mapCohortRow(cohortRow),
            enrollment: mapEnrollmentRow(existing),
            created: false,
            alreadyMember: true,
          };
        }

        const countResult = await client.query(
          "SELECT count(*)::integer AS count FROM enrollments WHERE cohort_id = $1",
          [cohortRow.id],
        );
        if (Number(countResult.rows[0]?.count || 0) >= Number(cohortRow.capacity)) {
          fail("COHORT_FULL", "This cohort has reached its maximum capacity");
        }

        let enrollment;
        let created = false;
        if (existing) {
          const updated = await client.query(
            `UPDATE enrollments
             SET cohort_id = $3,
                 due_at = COALESCE(due_at, $4::timestamptz::date),
                 version = version + 1
             WHERE course_id = $1 AND user_id = $2
             RETURNING *`,
            [cohortRow.course_id, actor.id, cohortRow.id, cohortRow.end_date || null],
          );
          enrollment = mapEnrollmentRow(updated.rows[0]);
        } else {
          const inserted = await client.query(
            `INSERT INTO enrollments (
               id, course_id, user_id, assigned_by, cohort_id, due_at,
               priority, mandatory, status, version
             ) VALUES ($1, $2, $3, $4, $5, $6::timestamptz::date,
               'Medium', false, 'Enrolled', 0)
             RETURNING *`,
            [
              enrollmentId, cohortRow.course_id, actor.id, cohortRow.instructor_id,
              cohortRow.id, cohortRow.end_date || null,
            ],
          );
          enrollment = mapEnrollmentRow(inserted.rows[0]);
          created = true;
        }
        await audit(client, actor.id, "JOIN_COHORT", cohortRow.id, {
          enrollmentId: enrollment.id,
          created,
        });
        return {
          cohort: mapCohortRow(cohortRow),
          enrollment,
          created,
          alreadyMember: false,
        };
      });
    } catch (error) {
      if (error?.code === "23505" && error?.constraint === "enrollments_course_id_user_id_key") {
        fail("ENROLLMENT_CONFLICT", "Concurrent enrollment conflict; retry the request");
      }
      throw error;
    }
  };

  const getAnalytics = async ({ cohortId, actor }) => {
    const cohortResult = await db.query(
      `SELECT cohort.*, course.title AS course_title, course.owner_id
       FROM cohorts cohort JOIN courses course ON course.id = cohort.course_id
       WHERE cohort.id = $1`,
      [cohortId],
    );
    const cohortRow = cohortResult.rows[0];
    if (!cohortRow) fail("COHORT_NOT_FOUND", "Cohort not found");
    if (!isAdmin(actor.role) && cohortRow.instructor_id !== actor.id && cohortRow.owner_id !== actor.id) {
      fail("FORBIDDEN", "Only the cohort instructor, course owner or an administrator can view analytics");
    }

    const { rows } = await db.query(
      `SELECT enrollment.*, app_user.name AS user_name, app_user.email,
              latest.score AS assessment_score,
              latest.status AS assessment_status,
              latest.feedback AS assessment_feedback
       FROM enrollments enrollment
       JOIN users app_user ON app_user.id = enrollment.user_id
       LEFT JOIN LATERAL (
         SELECT attempt.score, attempt.status, attempt.feedback
         FROM assessment_attempts attempt
         WHERE attempt.course_id = enrollment.course_id
           AND attempt.user_id = enrollment.user_id
         ORDER BY attempt.started_at DESC
         LIMIT 1
       ) latest ON true
       WHERE enrollment.cohort_id = $1
       ORDER BY app_user.name, app_user.id`,
      [cohortId],
    );

    const statusCounts = {
      Enrolled: 0,
      InProgress: 0,
      ChaptersComplete: 0,
      AssessmentEligible: 0,
      Passed: 0,
      Failed: 0,
      Certified: 0,
    };
    const roster = rows.map((row) => {
      const effectiveStatus = row.status || (Number(row.progress) === 100
        ? "ChaptersComplete" : Number(row.progress) > 0 ? "InProgress" : "Enrolled");
      statusCounts[effectiveStatus] = (statusCounts[effectiveStatus] || 0) + 1;
      return {
        userId: row.user_id,
        userName: row.user_name,
        email: row.email,
        progress: Number(row.progress || 0),
        status: effectiveStatus,
        timeSpentMinutes: Number(row.time_spent_minutes || 0),
        completedChaptersCount: (row.completed_chapters || []).length,
        assessmentScore: row.assessment_score == null ? null : Number(row.assessment_score),
        assessmentPassed: row.assessment_status === "Passed" || row.assessment_feedback === "Passed",
        lastActiveAt: iso(row.last_heartbeat_at || row.started_at),
      };
    });
    const totalMembers = roster.length;
    const averageProgress = totalMembers
      ? Math.round(roster.reduce((sum, member) => sum + member.progress, 0) / totalMembers)
      : 0;
    const passedCount = (statusCounts.Passed || 0) + (statusCounts.Certified || 0);
    return {
      cohortId: cohortRow.id,
      name: cohortRow.name,
      courseTitle: cohortRow.course_title,
      capacity: Number(cohortRow.capacity),
      totalMembers,
      averageProgress,
      passRate: totalMembers ? Math.round((passedCount / totalMembers) * 100) : 0,
      statusCounts,
      roster,
    };
  };

  return { createCohort, listCohorts, findVisibleCohort, joinCohort, getAnalytics };
}

export const cohortAuthorityRepository = createCohortAuthorityRepository();
