import assert from "node:assert/strict";
import crypto from "node:crypto";
import { closePool, query } from "./pool.js";
import { reportsRepository as repository } from "../repositories/reports.repository.pg.js";
import { createReportArtifact } from "../reports/report-artifacts.js";
import { deleteObject, getPresignedDownloadUrl, uploadBuffer } from "../storage/object-store.js";

if (!process.env.DATABASE_URL && !process.env.PGHOST) {
  throw new Error("DATABASE_URL or PGHOST is required for report authority verification");
}

const suffix = crypto.randomBytes(6).toString("hex");
const managerId = `VERIFY-REPORT-MANAGER-${suffix}`;
const learnerId = `VERIFY-REPORT-LEARNER-${suffix}`;
const outsiderId = `VERIFY-REPORT-OUTSIDER-${suffix}`;
const courseId = `VERIFY-REPORT-COURSE-${suffix}`;
const chapterId = `VERIFY-REPORT-CHAPTER-${suffix}`;
const assessmentId = `VERIFY-REPORT-ASSESSMENT-${suffix}`;
const learnerEnrollmentId = `VERIFY-REPORT-ENROLLMENT-${suffix}`;
const outsiderEnrollmentId = `VERIFY-REPORT-OUT-ENROLLMENT-${suffix}`;
const attemptId = `VERIFY-REPORT-ATTEMPT-${suffix}`;
let reportId = null;
let storageKey = null;
const checks = [];
const ok = (name, condition) => { assert.ok(condition, name); checks.push(name); };

try {
  await query(
    `INSERT INTO users (id, name, email, role, status, manager_id, team)
     VALUES
       ($1, 'Report manager', $2, 'Manager', 'Active', NULL, 'Verify Blue'),
       ($3, 'Report learner', $4, 'Learner', 'Active', $1, 'Verify Blue'),
       ($5, 'Report outsider', $6, 'Learner', 'Active', NULL, 'Verify Red')`,
    [managerId, `${managerId}@example.invalid`, learnerId, `${learnerId}@example.invalid`, outsiderId, `${outsiderId}@example.invalid`],
  );
  await query(
    `INSERT INTO courses (id, title, description, skill, status, approval, owner_id)
     VALUES ($1, 'Report verification', 'Synthetic relational report course',
       'Security', 'Active', 'Approved', $2)`,
    [courseId, managerId],
  );
  await query(
    `INSERT INTO chapters (id, course_id, sequence, title, minimum_time_minutes)
     VALUES ($1, $2, 1, 'Report chapter', 5)`,
    [chapterId, courseId],
  );
  await query(
    `INSERT INTO assessments (
       id, course_id, chapter_id, title, type, duration_minutes, pass_score,
       approval, status, owner_id
     ) VALUES ($1, $2, $3, 'Report assessment', 'MCQ', 15, 70,
       'Approved', 'Active', $4)`,
    [assessmentId, courseId, chapterId, managerId],
  );
  await query(
    `INSERT INTO enrollments (
       id, course_id, user_id, assigned_by, progress, time_spent_seconds, status
     ) VALUES
       ($1, $2, $3, $4, 80, 900, 'InProgress'),
       ($5, $2, $6, $4, 25, 300, 'InProgress')`,
    [learnerEnrollmentId, courseId, learnerId, managerId, outsiderEnrollmentId, outsiderId],
  );
  await query(
    `INSERT INTO chapter_time_totals (user_id, course_id, chapter_id, time_spent_seconds)
     VALUES ($1, $2, $3, 700)`,
    [learnerId, courseId, chapterId],
  );
  await query(
    `INSERT INTO assessment_attempts (
       id, assessment_id, chapter_id, course_id, user_id, status, score,
       max_score, time_spent_seconds
     ) VALUES ($1, $2, $3, $4, $5, 'Passed', 80, 100, 120)`,
    [attemptId, assessmentId, chapterId, courseId, learnerId],
  );

  const report = await repository.prepareExport({
    actor: { id: managerId, role: "Manager" },
    reportType: "Team",
    format: "Excel",
    filters: { team: "Verify Blue" },
  });
  reportId = report.id;
  ok(
    "manager report includes the direct report and excludes unrelated learners",
    report.rows.length === 1
      && report.rows[0].userId === learnerId
      && !report.rows.some((row) => row.userId === outsiderId),
  );
  ok(
    "report reconciles canonical chapter, assessment and course totals",
    report.summary.chapterTimeSeconds === 700
      && report.summary.assessmentTimeSeconds === 120
      && report.summary.courseTimeSeconds === 900,
  );
  ok(
    "report metadata is durable without a fabricated artifact URL",
    report.status === "Prepared" && report.artifactAvailable === false && report.downloadUrl === null,
  );

  await query(
    `UPDATE report_exports SET status = 'Processing', attempts = attempts + 1,
       claimed_at = now(), updated_at = now() WHERE id = $1`,
    [report.id],
  );
  const claimed = {
    ...report,
    actor: { id: managerId, role: "Manager", status: "Active" },
  };
  const artifactRows = await repository.loadRowsForClaim(claimed);
  const artifact = await createReportArtifact({ report: claimed, rows: artifactRows });
  storageKey = `reports/${report.id}/verify-${suffix}.${artifact.extension}`;
  await repository.reserveStorageKey({ reportId: report.id, storageKey });
  await uploadBuffer(storageKey, artifact.buffer, artifact.contentType);
  const ready = await repository.markReady({
    reportId: report.id,
    storageKey,
    rowCount: artifactRows.length,
    summary: report.summary,
  });
  const authorized = await repository.getAccessibleById({
    reportId: report.id,
    actor: { id: managerId, role: "Manager" },
  });
  const grant = await getPresignedDownloadUrl(storageKey, 60, managerId, {
    filename: `verify-report.${artifact.extension}`,
    contentType: artifact.contentType,
  });
  ok(
    "real private artifact reaches Ready and receives an authorized short-lived download grant",
    ready.status === "Ready"
      && ready.artifactAvailable === true
      && authorized?.storageKey === storageKey
      && typeof grant.downloadUrl === "string",
  );

  const evidence = await query(
    `SELECT
       (SELECT count(*) FROM report_exports WHERE id = $1)::integer AS reports,
       (SELECT count(*) FROM audit_logs
        WHERE entity_type = 'REPORT' AND entity_id = $1 AND action = 'EXPORT_REPORT')::integer AS audits`,
    [reportId],
  );
  ok(
    "durable report and audit evidence were committed together",
    evidence.rows[0]?.reports === 1 && evidence.rows[0]?.audits === 1,
  );

  for (const check of checks) console.log(`ok - ${check}`);
  console.log(`Report authority verification passed (${checks.length} checks).`);
} finally {
  if (process.env.DATABASE_URL || process.env.PGHOST) {
    if (storageKey) await deleteObject(storageKey).catch(() => {});
    if (reportId) {
      await query("DELETE FROM audit_logs WHERE entity_type = 'REPORT' AND entity_id = $1", [reportId]).catch(() => {});
      await query("DELETE FROM report_exports WHERE id = $1", [reportId]).catch(() => {});
    }
    await query("DELETE FROM assessment_attempts WHERE id = $1", [attemptId]).catch(() => {});
    await query("DELETE FROM chapter_time_totals WHERE course_id = $1", [courseId]).catch(() => {});
    await query("DELETE FROM enrollments WHERE id = ANY($1::text[])", [[learnerEnrollmentId, outsiderEnrollmentId]]).catch(() => {});
    await query("DELETE FROM assessments WHERE id = $1", [assessmentId]).catch(() => {});
    await query("DELETE FROM chapters WHERE id = $1", [chapterId]).catch(() => {});
    await query("DELETE FROM courses WHERE id = $1", [courseId]).catch(() => {});
    await query("DELETE FROM users WHERE id = ANY($1::text[])", [[learnerId, outsiderId, managerId]]).catch(() => {});
  }
  await closePool();
}
