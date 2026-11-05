import { query } from "../db/pool.js";

const iso = (value) => (value instanceof Date ? value.toISOString() : value);

const mapUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  department: row.department || "",
  team: row.team || "",
  designation: row.designation || "",
  managerId: row.manager_id || null,
  status: row.status,
  joinedAt: row.joined_at ? iso(row.joined_at) : null,
});

export function createAnalyticsRepository(db = { query }) {
  const globalOverview = async () => {
    const [overview, performers] = await Promise.all([
      db.query(
        `SELECT
           (SELECT count(*) FROM users)::integer AS users,
           (SELECT count(*) FROM users WHERE status = 'Active')::integer AS active_users,
           (SELECT count(*) FROM courses)::integer AS courses,
           (SELECT count(*) FROM courses WHERE approval = 'Approved')::integer AS approved_courses,
           COALESCE((SELECT round(avg(progress)) FROM enrollments), 0)::integer AS completion_rate,
           COALESCE((SELECT round(avg(score)) FROM assessment_attempts WHERE score IS NOT NULL), 0)::integer AS average_score`,
      ),
      db.query(
        `SELECT app_user.name,
                COALESCE(avg(enrollment.progress), 0) AS average_progress,
                COALESCE(avg(attempt.score) FILTER (WHERE attempt.score IS NOT NULL), 0) AS average_score
         FROM users app_user
         LEFT JOIN enrollments enrollment ON enrollment.user_id = app_user.id
         LEFT JOIN assessment_attempts attempt ON attempt.user_id = app_user.id
         WHERE app_user.status = 'Active'
         GROUP BY app_user.id, app_user.name
         HAVING count(enrollment.id) > 0 OR count(attempt.id) > 0
         ORDER BY (COALESCE(avg(enrollment.progress), 0) * 0.6
                  + COALESCE(avg(attempt.score) FILTER (WHERE attempt.score IS NOT NULL), 0) * 0.4) DESC,
                  app_user.id`,
      ),
    ]);
    const values = overview.rows[0] || {};
    const names = performers.rows.map((row) => row.name);
    return {
      users: Number(values.users || 0),
      activeUsers: Number(values.active_users || 0),
      courses: Number(values.courses || 0),
      approvedCourses: Number(values.approved_courses || 0),
      completionRate: Number(values.completion_rate || 0),
      averageScore: Number(values.average_score || 0),
      topPerformers: names.slice(0, 3),
      lowPerformers: names.length > 3 ? names.slice(-3).reverse() : [],
    };
  };

  const teamOverview = async (managerId) => {
    const [membersResult, skillsResult] = await Promise.all([
      db.query(
        `SELECT app_user.id, app_user.name, app_user.email, app_user.role,
                app_user.team, app_user.designation, app_user.manager_id,
                app_user.status, app_user.joined_at,
                department.name AS department,
                COALESCE(avg(enrollment.progress), 0) AS average_progress,
                COALESCE(sum(enrollment.time_spent_seconds), 0) AS time_spent_seconds
         FROM users app_user
         LEFT JOIN departments department ON department.id = app_user.department_id
         LEFT JOIN enrollments enrollment ON enrollment.user_id = app_user.id
         WHERE app_user.manager_id = $1
         GROUP BY app_user.id, department.name
         ORDER BY app_user.name, app_user.id`,
        [managerId],
      ),
      db.query(
        `SELECT rating.skill, avg(rating.score) AS score
         FROM skill_ratings rating
         JOIN users app_user ON app_user.id = rating.user_id
         WHERE app_user.manager_id = $1
         GROUP BY rating.skill
         ORDER BY avg(rating.score), rating.skill
         LIMIT 5`,
        [managerId],
      ),
    ]);
    const members = membersResult.rows.map(mapUser);
    const completionRate = membersResult.rows.length
      ? Math.round(membersResult.rows.reduce((sum, row) => sum + Number(row.average_progress || 0), 0) / membersResult.rows.length)
      : 0;
    const totalTime = membersResult.rows.reduce((sum, row) => sum + Number(row.time_spent_seconds || 0), 0);
    const averageTime = membersResult.rows.length ? totalTime / membersResult.rows.length : 0;
    const engagement = averageTime >= 7200 ? "High" : averageTime >= 1800 ? "Medium" : "Low";
    return {
      managerId,
      members,
      completionRate,
      skillGaps: skillsResult.rows.filter((row) => Number(row.score) < 70).map((row) => row.skill),
      engagement,
    };
  };

  const personalOverview = async (userId) => {
    const [learningResult, skillsResult, suggestionsResult] = await Promise.all([
      db.query(
        `SELECT COALESCE(round(avg(progress)), 0)::integer AS progress,
                count(*) FILTER (WHERE status IN ('Passed', 'Certified'))::integer AS completed_courses,
                count(*) FILTER (WHERE status NOT IN ('Passed', 'Certified'))::integer AS pending_courses
         FROM enrollments WHERE user_id = $1`,
        [userId],
      ),
      db.query(
        `SELECT skill, score FROM skill_ratings
         WHERE user_id = $1 ORDER BY score DESC, skill`,
        [userId],
      ),
      db.query(
        `SELECT course.title
         FROM courses course
         WHERE course.status = 'Active' AND course.approval = 'Approved'
           AND NOT EXISTS (
             SELECT 1 FROM enrollments enrollment
             WHERE enrollment.course_id = course.id AND enrollment.user_id = $1
           )
         ORDER BY course.created_at DESC, course.id
         LIMIT 3`,
        [userId],
      ),
    ]);
    const learning = learningResult.rows[0] || {};
    const ratings = skillsResult.rows;
    return {
      userId,
      progress: Number(learning.progress || 0),
      completedCourses: Number(learning.completed_courses || 0),
      pendingCourses: Number(learning.pending_courses || 0),
      strengths: ratings.filter((row) => Number(row.score) >= 70).slice(0, 5).map((row) => row.skill),
      weaknesses: ratings.filter((row) => Number(row.score) < 70).slice(-5).map((row) => row.skill),
      suggestions: suggestionsResult.rows.map((row) => `Complete ${row.title}`),
    };
  };

  const timeRows = async (actor) => {
    const { rows } = await db.query(
      `WITH scoped_enrollments AS (
         SELECT enrollment.*
         FROM enrollments enrollment
         JOIN users app_user ON app_user.id = enrollment.user_id
         WHERE $1::boolean OR app_user.manager_id = $2 OR app_user.id = $2
       )
       SELECT enrollment.user_id, enrollment.course_id, chapter_key.chapter_id,
              chapter.title AS chapter_title,
              COALESCE(chapter.minimum_time_minutes, 0) * 60 AS minimum_time_seconds,
              COALESCE(chapter_total.time_spent_seconds, 0) AS chapter_time_seconds,
              COALESCE((
                SELECT sum(attempt.time_spent_seconds)
                FROM assessment_attempts attempt
                WHERE attempt.user_id = enrollment.user_id
                  AND attempt.course_id = enrollment.course_id
                  AND attempt.chapter_id IS NOT DISTINCT FROM chapter_key.chapter_id
              ), 0) AS assessment_time_seconds,
              enrollment.time_spent_seconds AS course_time_seconds
       FROM scoped_enrollments enrollment
       LEFT JOIN LATERAL (
         SELECT total.chapter_id
         FROM chapter_time_totals total
         WHERE total.user_id = enrollment.user_id AND total.course_id = enrollment.course_id
         UNION
         SELECT attempt.chapter_id
         FROM assessment_attempts attempt
         WHERE attempt.user_id = enrollment.user_id AND attempt.course_id = enrollment.course_id
       ) chapter_key ON true
       LEFT JOIN chapter_time_totals chapter_total
         ON chapter_total.user_id = enrollment.user_id
        AND chapter_total.course_id = enrollment.course_id
        AND chapter_total.chapter_id = chapter_key.chapter_id
       LEFT JOIN chapters chapter ON chapter.id = chapter_key.chapter_id
       ORDER BY enrollment.user_id, enrollment.course_id, chapter_key.chapter_id NULLS FIRST`,
      [actor.role === "Admin" || actor.role === "Super Admin", actor.id],
    );
    return rows.map((row) => {
      const minimumTimeSeconds = Number(row.minimum_time_seconds || 0);
      const chapterTimeSeconds = Number(row.chapter_time_seconds || 0);
      return {
        userId: row.user_id,
        courseId: row.course_id,
        chapterId: row.chapter_id || null,
        chapterTitle: row.chapter_title || null,
        minimumTimeSeconds,
        minimumTimeMet: chapterTimeSeconds >= minimumTimeSeconds,
        chapterTimeSeconds,
        assessmentTimeSeconds: Number(row.assessment_time_seconds || 0),
        courseTimeSeconds: Number(row.course_time_seconds || 0),
      };
    });
  };

  const countTimeEvents = async (actor) => {
    const { rows } = await db.query(
      `SELECT count(*)::integer AS count
       FROM learning_time_events event
       JOIN users app_user ON app_user.id = event.user_id
       WHERE $1::boolean OR app_user.manager_id = $2 OR app_user.id = $2`,
      [actor.role === "Admin" || actor.role === "Super Admin", actor.id],
    );
    return Number(rows[0]?.count || 0);
  };

  const listTimeEvents = async ({ actor, limit }) => {
    const { rows } = await db.query(
      `SELECT event.id, event.user_id, event.course_id, event.chapter_id,
              event.assessment_id, event.event_type, event.seconds_spent,
              event.recorded_at
       FROM learning_time_events event
       JOIN users app_user ON app_user.id = event.user_id
       WHERE $1::boolean OR app_user.manager_id = $2 OR app_user.id = $2
       ORDER BY event.recorded_at DESC, event.id DESC
       LIMIT $3`,
      [actor.role === "Admin" || actor.role === "Super Admin", actor.id, limit],
    );
    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      courseId: row.course_id,
      chapterId: row.chapter_id || null,
      assessmentId: row.assessment_id || null,
      eventType: row.event_type,
      secondsSpent: Number(row.seconds_spent),
      recordedAt: iso(row.recorded_at),
    }));
  };

  return { globalOverview, teamOverview, personalOverview, timeRows, countTimeEvents, listTimeEvents };
}

export const analyticsRepository = createAnalyticsRepository();
