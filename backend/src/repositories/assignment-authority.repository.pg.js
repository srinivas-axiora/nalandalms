import { query, withTransaction } from "../db/pool.js";

const iso = (value) => value instanceof Date ? value.toISOString() : value;
const isAdmin = (role) => role === "Admin" || role === "Super Admin";

export class AssignmentAuthorityError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "AssignmentAuthorityError";
    this.code = code;
    this.details = details;
  }
}

const fail = (code, message, details) => {
  throw new AssignmentAuthorityError(code, message, details);
};

export const mapAssignedEnrollmentRow = (row) => row && ({
  id: row.id,
  courseId: row.course_id,
  userId: row.user_id,
  assignedBy: row.assigned_by,
  dueAt: row.due_at ? iso(row.due_at) : null,
  priority: row.priority || "Medium",
  mandatory: Boolean(row.mandatory),
  progress: Number(row.progress || 0),
  completedChapters: row.completed_chapters || [],
  timeSpentMinutes: Number(row.time_spent_minutes || 0),
  timeSpentSeconds: Number(row.time_spent_seconds || 0),
  chapterTimeSpentSeconds: row.chapter_time_spent_seconds || {},
  status: row.status || "Enrolled",
  version: Number(row.version || 0),
  startedAt: iso(row.started_at),
  completedAt: row.completed_at ? iso(row.completed_at) : null,
});

export function createAssignmentAuthorityRepository(db = { query, withTransaction }) {
  const assignCourse = async ({ courseId, actor, assignees, dueAt, priority, mandatory }) => {
    try {
      return await db.withTransaction(async (client) => {
        const courseResult = await client.query("SELECT * FROM courses WHERE id = $1 FOR SHARE", [courseId]);
        const course = courseResult.rows[0];
        if (!course || course.status !== "Active" || course.approval !== "Approved") {
          fail("COURSE_NOT_FOUND", "Approved active course not found");
        }
        if (!isAdmin(actor.role) && course.owner_id !== actor.id) {
          fail("FORBIDDEN", "You cannot assign learners to this course");
        }

        const userIds = assignees.map((item) => item.userId);
        const usersResult = await client.query(
          "SELECT id, status, manager_id FROM users WHERE id = ANY($1::text[]) FOR SHARE",
          [userIds],
        );
        const usersById = new Map(usersResult.rows.map((row) => [row.id, row]));
        const invalidUserIds = userIds.filter((userId) => {
          const user = usersById.get(userId);
          if (!user || user.status !== "Active") return true;
          return !isAdmin(actor.role) && (user.manager_id !== actor.id || userId === actor.id);
        });
        if (invalidUserIds.length) {
          fail("ASSIGNEE_FORBIDDEN", "One or more assignees are outside your permitted scope", { userIds: invalidUserIds });
        }

        const existing = await client.query(
          "SELECT user_id FROM enrollments WHERE course_id = $1 AND user_id = ANY($2::text[]) FOR SHARE",
          [courseId, userIds],
        );
        if (existing.rows.length) {
          fail("ALREADY_ASSIGNED", "One or more users are already assigned to this course", {
            userIds: existing.rows.map((row) => row.user_id),
          });
        }

        const created = [];
        for (const assignee of assignees) {
          const inserted = await client.query(
            `INSERT INTO enrollments (
               id, course_id, user_id, assigned_by, due_at, priority, mandatory,
               progress, completed_chapters, time_spent_minutes, time_spent_seconds,
               chapter_time_spent_seconds, status, version, started_at
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, 0, '{}', 0, 0, '{}'::jsonb, 'Enrolled', 0, now())
             RETURNING *`,
            [assignee.enrollmentId, courseId, assignee.userId, actor.id, dueAt, priority, mandatory],
          );
          created.push(mapAssignedEnrollmentRow(inserted.rows[0]));
        }
        await client.query(
          `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
           VALUES ($1, 'ASSIGN_COURSE', 'COURSE', $2, $3::jsonb)`,
          [actor.id, courseId, JSON.stringify({ userIds, count: created.length })],
        );
        return created;
      });
    } catch (error) {
      if (error?.code === "23505" && error?.constraint === "enrollments_course_id_user_id_key") {
        fail("ALREADY_ASSIGNED", "One or more users are already assigned to this course");
      }
      throw error;
    }
  };

  return { assignCourse };
}

export const assignmentAuthorityRepository = createAssignmentAuthorityRepository();
