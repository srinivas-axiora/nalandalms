import { query, withTransaction } from "../db/pool.js";

const iso = (value) => value instanceof Date ? value.toISOString() : value;
const isAdmin = (role) => role === "Admin" || role === "Super Admin";

export const MAX_REPORT_ROWS = 5_000;
export const MAX_REPORT_ATTEMPTS = 3;

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

export const summarizeReportRows = (rows) => rows.reduce((summary, row) => ({
  chapterTimeSeconds: summary.chapterTimeSeconds + row.chapterTimeSeconds,
  assessmentTimeSeconds: summary.assessmentTimeSeconds + row.assessmentTimeSeconds,
  courseTimeSeconds: summary.courseTimeSeconds + row.courseTimeSeconds,
}), { chapterTimeSeconds: 0, assessmentTimeSeconds: 0, courseTimeSeconds: 0 });

const mapReport = (row) => ({
  id: String(row.id),
  requestedBy: row.requested_by,
  reportType: row.report_type,
  format: row.format,
  filters: row.filters || {},
  status: row.status,
  artifactAvailable: row.status === "Ready" && Boolean(row.storage_key),
  downloadUrl: null,
  rowCount: Number(row.row_count || 0),
  summary: row.summary || {},
  attempts: Number(row.attempts || 0),
  lastErrorCode: row.last_error_code || null,
  createdAt: iso(row.created_at),
  completedAt: iso(row.completed_at),
  updatedAt: iso(row.updated_at),
});

const selectRows = async (client, { actor, filters = {} }) => {
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
       WHERE total.user_id = enrollment.user_id AND total.course_id = enrollment.course_id
     ) chapter_totals ON true
     LEFT JOIN LATERAL (
       SELECT sum(attempt.time_spent_seconds) AS seconds
       FROM assessment_attempts attempt
       WHERE attempt.user_id = enrollment.user_id AND attempt.course_id = enrollment.course_id
     ) attempt_totals ON true
     WHERE ($1::boolean OR app_user.manager_id = $2 OR app_user.id = $2)
       AND ($3::text IS NULL OR enrollment.user_id = $3)
       AND ($4::text IS NULL OR enrollment.course_id = $4)
       AND ($5::text IS NULL OR app_user.team = $5)
       AND ($6::text IS NULL OR department.name = $6)
     ORDER BY app_user.name, enrollment.user_id, course.title, enrollment.course_id
     LIMIT $7`,
    [isAdmin(actor.role), actor.id, filters.userId || null, filters.courseId || null,
      filters.team || null, filters.department || null, MAX_REPORT_ROWS + 1],
  );
  if (result.rows.length > MAX_REPORT_ROWS) {
    throw new ReportRepositoryError("REPORT_TOO_LARGE", `Report exceeds the ${MAX_REPORT_ROWS} row artifact limit`, { maxRows: MAX_REPORT_ROWS });
  }
  return result.rows.map(mapRow);
};

export function createReportsRepository(db = { query, withTransaction }) {
  const prepareExport = async ({ actor, reportType, format, filters }) => db.withTransaction(async (client) => {
    const rows = await selectRows(client, { actor, filters });
    const summary = summarizeReportRows(rows);
    const inserted = await client.query(
      `INSERT INTO report_exports (
         requested_by, report_type, format, filters, status, storage_key,
         row_count, summary, created_at, completed_at, updated_at
       ) VALUES ($1, $2, $3, $4::jsonb, 'Prepared', NULL, $5, $6::jsonb, now(), NULL, now())
       RETURNING *`,
      [actor.id, reportType, format, JSON.stringify(filters), rows.length, JSON.stringify(summary)],
    );
    const report = inserted.rows[0];
    await client.query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'EXPORT_REPORT', 'REPORT', $2, $3::jsonb)`,
      [actor.id, String(report.id), JSON.stringify({ reportType, format, filters, rowCount: rows.length })],
    );
    return { ...mapReport(report), rows, summary, rowCount: rows.length };
  });

  const claimDue = async () => db.withTransaction(async (client) => {
    const claimed = await client.query(
      `WITH candidate AS (
         SELECT report.id FROM report_exports report
         WHERE (
           (report.attempts < $1 AND (
             report.status IN ('Queued', 'Prepared')
             OR (report.status = 'Failed' AND report.next_attempt_at <= now())
           ))
           OR (report.status = 'Processing' AND report.attempts <= $1
             AND report.claimed_at < now() - interval '15 minutes')
         )
         ORDER BY report.created_at, report.id
         FOR UPDATE SKIP LOCKED LIMIT 1
       )
       UPDATE report_exports report
       SET status = 'Processing',
           attempts = CASE WHEN report.status = 'Processing' THEN report.attempts ELSE report.attempts + 1 END,
           claimed_at = now(), next_attempt_at = NULL, last_error_code = NULL, updated_at = now()
       FROM candidate WHERE report.id = candidate.id RETURNING report.*`,
      [MAX_REPORT_ATTEMPTS],
    );
    if (!claimed.rows[0]) return null;
    const actorResult = await client.query("SELECT id, role, status FROM users WHERE id = $1", [claimed.rows[0].requested_by]);
    return {
      ...mapReport(claimed.rows[0]),
      actor: actorResult.rows[0] || null,
      pendingStorageKey: claimed.rows[0].storage_key || null,
    };
  });

  const loadRowsForClaim = async (report) => {
    if (!report.actor || report.actor.status !== "Active" || !["Admin", "Super Admin", "Manager"].includes(report.actor.role)) {
      throw new ReportRepositoryError("REQUESTER_NOT_AUTHORIZED", "The report requester is no longer authorized");
    }
    return selectRows(db, { actor: report.actor, filters: report.filters });
  };

  const markReady = async ({ reportId, storageKey, rowCount, summary }) => {
    const result = await db.query(
      `UPDATE report_exports SET status = 'Ready', storage_key = $2, row_count = $3,
         summary = $4::jsonb, completed_at = now(), claimed_at = NULL,
         next_attempt_at = NULL, last_error_code = NULL, updated_at = now()
       WHERE id = $1 AND status = 'Processing' RETURNING *`,
      [reportId, storageKey, rowCount, JSON.stringify(summary)],
    );
    if (!result.rows[0]) throw new ReportRepositoryError("REPORT_STATE_CONFLICT", "Report is no longer processing");
    return mapReport(result.rows[0]);
  };

  const reserveStorageKey = async ({ reportId, storageKey }) => {
    const result = await db.query(
      `UPDATE report_exports SET storage_key = $2, updated_at = now()
       WHERE id = $1 AND status = 'Processing' RETURNING id`,
      [reportId, storageKey],
    );
    if (!result.rows[0]) throw new ReportRepositoryError("REPORT_STATE_CONFLICT", "Report is no longer processing");
  };

  const markFailed = async ({ reportId, errorCode, retryDelaySeconds = 60, terminal = false, preserveStorageKey = false }) => {
    const result = await db.query(
      `UPDATE report_exports SET status = 'Failed',
         storage_key = CASE WHEN $6::boolean THEN storage_key ELSE NULL END, completed_at = NULL,
         last_error_code = $2, claimed_at = NULL,
         next_attempt_at = CASE WHEN NOT $5::boolean AND attempts < $3
           THEN now() + ($4::integer * interval '1 second') ELSE NULL END,
         updated_at = now()
       WHERE id = $1 AND status = 'Processing' RETURNING *`,
      [reportId, errorCode, MAX_REPORT_ATTEMPTS, retryDelaySeconds, terminal, preserveStorageKey],
    );
    return result.rows[0] ? mapReport(result.rows[0]) : null;
  };

  const getAccessibleById = async ({ reportId, actor }) => {
    const result = await db.query(
      "SELECT * FROM report_exports WHERE id = $1 AND ($2::boolean OR requested_by = $3)",
      [reportId, isAdmin(actor.role), actor.id],
    );
    return result.rows[0] ? { ...mapReport(result.rows[0]), storageKey: result.rows[0].storage_key } : null;
  };

  const recordDownload = ({ reportId, actorId }) => db.query(
    `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
     VALUES ($1, 'DOWNLOAD_REPORT', 'REPORT', $2, '{}'::jsonb)`,
    [actorId, reportId],
  );

  return {
    prepareExport, claimDue, loadRowsForClaim, reserveStorageKey, markReady,
    markFailed, getAccessibleById, recordDownload,
  };
}

export const reportsRepository = createReportsRepository();
