import { query, withTransaction } from "../db/pool.js";

const iso = (value) => value instanceof Date ? value.toISOString() : value;
const isAdmin = (role) => role === "Admin" || role === "Super Admin";

export const MAX_REPORT_ROWS = 5_000;

export class ReportRepositoryError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "ReportRepositoryError";
    this.code = code;
    this.details = details;
  }
}

const mapRow = (row) => ({
  userId: row.user_id,
  employeeName: row.employee_name,
  team: row.team || "",
  department: row.department || "",
  courseId: row.course_id,
  courseTitle: row.course_title,
  progress: Number(row.progress || 0),
  chapterTimeSeconds: Number(row.chapter_time_seconds || 0),
  assessmentTimeSeconds: Number(row.assessment_time_seconds || 0),
  courseTimeSeconds: Number(row.course_time_seconds || 0),
  chapterTimeSpentSeconds: row.chapter_time_spent_seconds || {},
});

const summarize = (rows) => rows.reduce((summary, row) => ({
  chapterTimeSeconds: summary.chapterTimeSeconds + row.chapterTimeSeconds,
  assessmentTimeSeconds: summary.assessmentTimeSeconds + row.assessmentTimeSeconds,
  courseTimeSeconds: summary.courseTimeSeconds + row.courseTimeSeconds,
}), { chapterTimeSeconds: 0, assessmentTimeSeconds: 0, courseTimeSeconds: 0 });

export function createReportsRepository(db = { query, withTransaction }) {
  const prepareExport = async ({ actor, reportType, format, filters }) => db.withTransaction(async (client) => {
    const result = await client.query(
      `SELECT enrollment.user_id, app_user.name AS employee_name,
              app_user.team, department.name AS department,
              enrollment.course_id, course.title AS course_title,
              enrollment.progress,
              COALESCE(chapter_totals.seconds, 0) AS chapter_time_seconds,
              COALESCE(chapter_totals.breakdown, '{}'::jsonb) AS chapter_time_spent_seconds,
              COALESCE(attempt_totals.seconds, 0) AS assessment_time_seconds,
              enrollment.time_spent_seconds AS course_time_seconds
       FROM enrollments enrollment
       JOIN users app_user ON app_user.id = enrollment.user_id
       LEFT JOIN departments department ON department.id = app_user.department_id
       JOIN courses course ON course.id = enrollment.course_id
       LEFT JOIN LATERAL (
         SELECT sum(total.time_spent_seconds) AS seconds,
                jsonb_object_agg(total.chapter_id, total.time_spent_seconds) AS breakdown
         FROM chapter_time_totals total
         WHERE total.user_id = enrollment.user_id
           AND total.course_id = enrollment.course_id
       ) chapter_totals ON true
       LEFT JOIN LATERAL (
         SELECT sum(attempt.time_spent_seconds) AS seconds
         FROM assessment_attempts attempt
         WHERE attempt.user_id = enrollment.user_id
           AND attempt.course_id = enrollment.course_id
       ) attempt_totals ON true
       WHERE ($1::boolean OR app_user.manager_id = $2 OR app_user.id = $2)
         AND ($3::text IS NULL OR enrollment.user_id = $3)
         AND ($4::text IS NULL OR enrollment.course_id = $4)
         AND ($5::text IS NULL OR app_user.team = $5)
         AND ($6::text IS NULL OR department.name = $6)
       ORDER BY app_user.name, enrollment.user_id, course.title, enrollment.course_id
       LIMIT $7`,
      [
        isAdmin(actor.role), actor.id,
        filters.userId || null, filters.courseId || null,
        filters.team || null, filters.department || null,
        MAX_REPORT_ROWS + 1,
      ],
    );

    if (result.rows.length > MAX_REPORT_ROWS) {
      throw new ReportRepositoryError(
        "REPORT_TOO_LARGE",
        `Report exceeds the ${MAX_REPORT_ROWS} row synchronous preparation limit`,
        { maxRows: MAX_REPORT_ROWS },
      );
    }

    const rows = result.rows.map(mapRow);
    const summary = summarize(rows);
    const inserted = await client.query(
      `INSERT INTO report_exports (
         requested_by, report_type, format, filters, status, storage_key,
         created_at, completed_at
       ) VALUES ($1, $2, $3, $4::jsonb, 'Prepared', NULL, now(), now())
       RETURNING id, requested_by, report_type, format, filters, status,
                 storage_key, created_at, completed_at`,
      [actor.id, reportType, format, JSON.stringify(filters)],
    );
    const report = inserted.rows[0];
    await client.query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'EXPORT_REPORT', 'REPORT', $2, $3::jsonb)`,
      [actor.id, String(report.id), JSON.stringify({ reportType, format, filters, rowCount: rows.length })],
    );

    return {
      id: String(report.id),
      requestedBy: report.requested_by,
      reportType: report.report_type,
      format: report.format,
      filters: report.filters || filters,
      status: report.status,
      artifactAvailable: Boolean(report.storage_key),
      downloadUrl: null,
      rowCount: rows.length,
      rows,
      summary,
      createdAt: iso(report.created_at),
      completedAt: iso(report.completed_at),
    };
  });

  return { prepareExport };
}

export const reportsRepository = createReportsRepository();
