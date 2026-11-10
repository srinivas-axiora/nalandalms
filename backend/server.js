// Nalanda API — application bootstrap.
// Foundation layers: src/config.js (env/secrets), src/lib.js (pure helpers),
// src/core.js (state + persistence), src/domain.js (business helpers),
// src/middleware.js (HTTP middleware). Feature routes live in src/modules/*.
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

import {
  PORT, corsOrigin, COOKIE_SECURE, COOKIE_SAMESITE, CSRF_COOKIE, TRUST_PROXY,
} from "./src/config.js";
import {
  now, isAdmin, users, courses, chapters, assessments, assignments, attempts, proctoringLogs,
  learningTimeEvents, reportExports, auditLogs, securityEvents, archives,
  skills, targetSkills, skillRatings, chapterFeedbacks, settings,
  issuedCertificates, acharyaFeedbackMemory, candidateAssessments, storage, saveDb, loadDb,
} from "./src/core.js";
import {
  publicUser, visibleUserIdsFor, coursesVisibleTo,
  assessmentsVisibleTo, assessmentForUser, targetSkillVisibleTo,
} from "./src/domain.js";
import {
  verifyCsrf, rateLimit, authenticate, persistResponseMiddleware, securityLoggingMiddleware, errorHandler,
} from "./src/middleware.js";

import { registerCertificates } from "./src/modules/certificates/certificates.routes.js";
import { registerUploads } from "./src/modules/uploads/uploads.routes.js";
import { registerPayments } from "./src/modules/payments/payments.routes.js";
import { registerCohorts } from "./src/modules/cohorts/cohorts.routes.js";
import { registerPrivacyCompliance } from "./src/modules/governance/privacy.routes.js";
import { requestCorrelationMiddleware, logger } from "./src/logging/logger.js";
import { objectStoreHealth } from "./src/storage/object-store.js";
import { ensureRedisReady, redisHealth, closeRedis } from "./src/cache/redis.js";
import { startRetentionDaemon } from "./src/workers/retention-cleanup.js";
import { startPrivacyErasureDaemon } from "./src/workers/privacy-erasure.js";
import { startReportExportDaemon } from "./src/workers/report-exports.js";
import { startPasswordResetDeliveryDaemon } from "./src/workers/password-reset-delivery.js";
import { passwordResetDeliveryHealth } from "./src/notifications/password-reset-delivery.js";
import { registerGovernance } from "./src/modules/governance/governance.routes.js";
import { registerSettings } from "./src/modules/settings/settings.routes.js";
import { registerSkills } from "./src/modules/skills/skills.routes.js";
import { registerAnalytics } from "./src/modules/analytics/analytics.routes.js";
import { registerReports } from "./src/modules/reports/reports.routes.js";
import { registerAuth } from "./src/modules/auth/auth.routes.js";
import { registerUsers } from "./src/modules/users/users.routes.js";
import { registerEnrollments } from "./src/modules/enrollments/enrollments.routes.js";
import { registerProctoring } from "./src/modules/proctoring/proctoring.routes.js";
import { registerCockpit } from "./src/modules/proctoring/cockpit.routes.js";
import { registerCourses } from "./src/modules/courses/courses.routes.js";
import { registerChapters } from "./src/modules/chapters/chapters.routes.js";
import { registerAssessments } from "./src/modules/assessments/assessments.routes.js";
import { registerCandidateAssessments } from "./src/modules/assessments/candidate-assessments.routes.js";
import { registerAI } from "./src/modules/ai/ai.routes.js";
import * as usersRepo from "./src/repositories/users.repository.pg.js";
import * as coursesRepo from "./src/repositories/courses.repository.pg.js";
import * as chaptersRepo from "./src/repositories/chapters.repository.pg.js";
import * as enrollmentsRepo from "./src/repositories/enrollments.repository.pg.js";
import * as skillsRepo from "./src/repositories/skills.repository.pg.js";
import { query as relationalQuery } from "./src/db/pool.js";
import { redactSensitive } from "./src/security/redaction.js";
import { identityRepository } from "./src/repositories/identity.repository.pg.js";
import { replaceIdentityProjection } from "./src/identity-projection.js";
import { attemptsRepository } from "./src/repositories/attempts.repository.pg.js";
import { replaceAttemptProjection } from "./src/attempt-projection.js";
import { certificatesPgRepository } from "./src/repositories/certificates.repository.pg.js";
import { candidateAssessmentsPgRepository } from "./src/repositories/candidate-assessments.repository.pg.js";
import { courseAuthorityRepository } from "./src/repositories/courses-authority.repository.pg.js";
import { assessmentAuthorityRepository } from "./src/repositories/assessment-authority.repository.pg.js";
import { reportsRepository } from "./src/repositories/reports.repository.pg.js";
import { aiFeedbackRepository } from "./src/repositories/ai-feedback.repository.pg.js";
import { analyticsRepository } from "./src/repositories/analytics.repository.pg.js";
import { settingsRepository } from "./src/repositories/settings.repository.pg.js";
import { securityEvidenceRepository } from "./src/repositories/security-evidence.repository.pg.js";
import { archiveAuthorityRepository } from "./src/repositories/archive-authority.repository.pg.js";
import { evidenceWriteContextMiddleware } from "./src/security/evidence-write-context.js";
import {
  relationalAttemptsEnabled,
  relationalCertificatesEnabled,
  relationalCandidateAssessmentsEnabled,
  relationalPaymentsEnabled,
  relationalSettingsEnabled,
  relationalSkillsEnabled,
  relationalIdentityEnabled,
  relationalPrivacyEnabled,
  relationalAuditEnabled,
  relationalWorkplaceEnabled,
  COURSE_AUTHORITY_COVERAGE_VERSION,
  courseAuthorityCoverageAcknowledged,
} from "./src/runtime-modes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USE_PG_COURSES = process.env.USE_PG_COURSES === "1";
const USE_RELATIONAL_ATTEMPTS = relationalAttemptsEnabled();
const USE_RELATIONAL_CERTIFICATES = relationalCertificatesEnabled();
const USE_RELATIONAL_CANDIDATE_ASSESSMENTS = relationalCandidateAssessmentsEnabled();
const USE_RELATIONAL_PAYMENTS = relationalPaymentsEnabled();
const USE_RELATIONAL_SETTINGS = relationalSettingsEnabled();
const USE_RELATIONAL_SKILLS = relationalSkillsEnabled();
const USE_RELATIONAL_IDENTITY = relationalIdentityEnabled();
const USE_RELATIONAL_PRIVACY = relationalPrivacyEnabled();
const USE_RELATIONAL_AUDIT = relationalAuditEnabled();
const USE_RELATIONAL_WORKPLACE = relationalWorkplaceEnabled();
const WORKPLACE_TRANSACTIONAL_DEPENDENCIES = USE_RELATIONAL_IDENTITY && USE_RELATIONAL_AUDIT;
const AUDIT_TRANSACTIONAL_DEPENDENCIES = USE_RELATIONAL_PAYMENTS && USE_RELATIONAL_SKILLS
  && USE_RELATIONAL_IDENTITY && USE_RELATIONAL_ATTEMPTS && USE_RELATIONAL_CERTIFICATES
  && USE_RELATIONAL_CANDIDATE_ASSESSMENTS && USE_PG_COURSES && USE_RELATIONAL_PRIVACY
  && USE_RELATIONAL_SETTINGS && USE_RELATIONAL_WORKPLACE;
const ENABLE_PRIVACY_ERASURE_WORKER = process.env.ENABLE_PRIVACY_ERASURE_WORKER === "1";
const ENABLE_REPORT_EXPORT_WORKER = process.env.ENABLE_REPORT_EXPORT_WORKER === "1";
const ENABLE_PASSWORD_RESET_WORKER = process.env.ENABLE_PASSWORD_RESET_WORKER === "1";
const PRIVACY_COVERAGE_ACK = process.env.PRIVACY_COVERAGE_ACK === "normalized-v2";
const COURSE_AUTHORITY_COVERAGE_ACK = courseAuthorityCoverageAcknowledged();

const app = express();
let passwordResetDelivery = {
  ok: process.env.NODE_ENV !== "production",
  mode: process.env.NODE_ENV === "production" ? "sqs-ses" : "disabled",
};
app.set("trust proxy", TRUST_PROXY);

// ── Global middleware ──
app.use(helmet());
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({
  limit: "2mb",
  verify: (req, _res, buffer) => {
    if (req.originalUrl?.split("?", 1)[0] === "/api/payments/webhook") {
      req.rawBody = Buffer.from(buffer);
    }
  },
}));
app.use(cookieParser());
app.use(evidenceWriteContextMiddleware);
app.use(persistResponseMiddleware);
app.use(requestCorrelationMiddleware);
app.use(securityLoggingMiddleware);
app.use(verifyCsrf);
app.use("/api", rateLimit({ windowMs: 60_000, max: 600, scope: "ip", name: "global" }));

// ── Feature module registration ──
// Each module imports its own foundation dependencies directly (no shared ctx).
registerGovernance(app);
registerSettings(app);
registerSkills(app);
registerAnalytics(app);
registerReports(app);
registerAuth(app);
registerUsers(app);
registerEnrollments(app);
registerProctoring(app);
registerCockpit(app);
registerCourses(app);
registerChapters(app);
registerAssessments(app);
registerCandidateAssessments(app);
registerAI(app);
registerCertificates(app);
registerUploads(app);
registerPayments(app);
registerCohorts(app);
registerPrivacyCompliance(app);

// ── System routes ──
let startupReady = process.env.NODE_ENV === "test";

app.get("/api/health", (_req, res) => {
  const mem = process.memoryUsage();
  res.json({
    ok: true,
    service: "Nalanda API",
    version: "2.0.0-gtm",
    uptimeSeconds: Math.round(process.uptime()),
    time: now(),
    ready: startupReady,
    system: {
      memoryRssMb: Math.round(mem.rss / (1024 * 1024)),
      memoryHeapUsedMb: Math.round(mem.heapUsed / (1024 * 1024)),
      memoryHeapTotalMb: Math.round(mem.heapTotal / (1024 * 1024))
    }
  });
});

app.get("/api/ready", async (_req, res) => {
  const readinessQuery = (...args) => Promise.resolve().then(() => relationalQuery(...args));
  const [
    database, redis, objects, skillsAuthority, payments, identity, attemptRuntime,
    certificateAuthority, candidateRuntime, privacyAuthority, reportAuthority, settingsAuthority, auditAuthority,
    archiveAuthority, workplaceAuthority, courseAuthority,
  ] = await Promise.all([
    storage.health(),
    redisHealth(),
    objectStoreHealth(),
    USE_RELATIONAL_SKILLS
      ? readinessQuery(
          `SELECT
             to_regclass('public.skills') IS NOT NULL AS skills,
             to_regclass('public.target_skills') IS NOT NULL AS targets,
             to_regclass('public.skill_ratings') IS NOT NULL AS ratings,
             to_regclass('public.chapter_feedbacks') IS NOT NULL AS feedback`
        ).then(({ rows }) => ({
          ok: Object.values(rows[0] || {}).every(Boolean),
          mode: "normalized",
        })).catch(() => ({ ok: false, mode: "normalized" }))
      : Promise.resolve({ ok: true, mode: "disabled" }),
    USE_RELATIONAL_PAYMENTS
      ? readinessQuery(
          `SELECT
             to_regclass('public.payment_orders') IS NOT NULL AS orders,
             to_regclass('public.payment_transactions') IS NOT NULL AS transactions,
             to_regclass('public.payment_webhook_events') IS NOT NULL AS webhooks,
             to_regclass('public.enrollments') IS NOT NULL AS enrollments`
        ).then(({ rows }) => ({
          ok: Object.values(rows[0] || {}).every(Boolean),
          mode: "normalized",
        })).catch(() => ({ ok: false, mode: "normalized" }))
      : Promise.resolve({ ok: true, mode: "disabled" }),
    USE_RELATIONAL_IDENTITY
      ? readinessQuery(
          `SELECT
             to_regclass('public.users') IS NOT NULL AS users,
             to_regclass('public.audit_logs') IS NOT NULL AS audits,
             to_regclass('public.deleted_archives') IS NOT NULL AS archives,
             EXISTS (
               SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'preferences'
             ) AS preferences,
             EXISTS (
               SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'joined_at'
             ) AS joined_at,
             EXISTS (
               SELECT 1 FROM pg_trigger
               WHERE tgname = 'trg_revoke_user_sessions_on_trust_change' AND NOT tgisinternal
             ) AS session_trigger`
        ).then(({ rows }) => ({
          ok: Object.values(rows[0] || {}).every(Boolean),
          mode: "normalized",
        })).catch(() => ({ ok: false, mode: "normalized" }))
      : Promise.resolve({ ok: true, mode: "disabled" }),
    USE_RELATIONAL_ATTEMPTS
      ? readinessQuery(
          `SELECT
             to_regclass('public.assessment_attempts') IS NOT NULL AS attempts,
             to_regclass('public.proctoring_logs') IS NOT NULL AS proctoring,
             to_regclass('public.proctor_media_objects') IS NOT NULL AS media_retention,
             to_regclass('public.idx_proctor_media_retention_due') IS NOT NULL AS media_retention_due,
             to_regclass('public.enrollments') IS NOT NULL AS enrollments,
             EXISTS (
               SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'public' AND table_name = 'assessment_attempts'
                 AND column_name = 'id' AND data_type = 'text'
             ) AS text_ids,
             EXISTS (
               SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'public' AND table_name = 'assessment_attempts'
                 AND column_name = 'version'
             ) AS optimistic_version,
             EXISTS (
               SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'public' AND table_name = 'assessment_attempts'
                 AND column_name = 'question_map'
             ) AS question_map,
             EXISTS (
               SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'public' AND table_name = 'enrollments'
                 AND column_name = 'status'
             ) AS enrollment_status`
        ).then(({ rows }) => ({
          ok: Object.values(rows[0] || {}).every(Boolean),
          mode: "normalized",
        })).catch(() => ({ ok: false, mode: "normalized" }))
      : Promise.resolve({ ok: true, mode: "disabled" }),
    USE_RELATIONAL_CERTIFICATES
      ? readinessQuery(
          `SELECT
             to_regclass('public.issued_certificates') IS NOT NULL AS certificates,
             EXISTS (
               SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'public' AND table_name = 'issued_certificates'
                 AND column_name = 'signature'
             ) AS signatures,
             EXISTS (
               SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'public' AND table_name = 'issued_certificates'
                 AND column_name = 'signature_version'
             ) AS signature_versions,
             EXISTS (
               SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'public' AND table_name = 'issued_certificates'
                 AND column_name = 'status'
             ) AS revocation,
             EXISTS (
               SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'public' AND table_name = 'issued_certificates'
                 AND column_name = 'attempt_id'
             ) AS attempt_evidence,
             to_regclass('public.idx_certificates_one_active_per_course') IS NOT NULL
               AS active_uniqueness,
             NOT EXISTS (
               SELECT 1 FROM issued_certificates WHERE signature IS NULL
             ) AS signatures_backfilled,
             NOT EXISTS (
               SELECT 1 FROM enrollments e
               LEFT JOIN issued_certificates c ON c.id = e.certificate_id
               WHERE e.status = 'Certified'
                 AND (e.certificate_id IS NULL OR c.id IS NULL OR c.status <> 'Active')
             ) AS certified_enrollments_bound,
             NOT EXISTS (
               SELECT 1 FROM issued_certificates c
               LEFT JOIN enrollments e
                 ON e.user_id = c.employee_id AND e.course_id = c.course_id
               WHERE c.status = 'Active'
                 AND (e.certificate_id IS DISTINCT FROM c.id OR e.status <> 'Certified')
             ) AS active_certificates_bound`
        ).then(({ rows }) => ({
          ok: Object.values(rows[0] || {}).every(Boolean),
          mode: "normalized",
        })).catch(() => ({ ok: false, mode: "normalized" }))
      : Promise.resolve({ ok: true, mode: "disabled" }),
    USE_RELATIONAL_CANDIDATE_ASSESSMENTS
      ? readinessQuery(
          `SELECT
             to_regclass('public.candidate_assessment_links') IS NOT NULL AS links,
             to_regclass('public.candidate_assessment_submissions') IS NOT NULL AS submissions,
             to_regclass('public.candidate_proctor_events') IS NOT NULL AS events,
             to_regclass('public.candidate_assessment_links_token_hash_key') IS NOT NULL AS unique_link_tokens,
             to_regclass('public.candidate_assessment_submissions_link_id_candidate_email_key') IS NOT NULL AS unique_candidate_email,
             to_regclass('public.candidate_proctor_events_submission_id_client_event_id_key') IS NOT NULL AS idempotent_events,
             NOT EXISTS (
               SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'public'
                 AND table_name IN ('candidate_assessment_links', 'candidate_assessment_submissions')
                 AND column_name IN ('token', 'attempt_token')
             ) AS no_plaintext_tokens,
             NOT EXISTS (
               SELECT 1 FROM candidate_assessment_links
               WHERE jsonb_array_length(question_snapshot) = 0
             ) AS question_snapshots`
        ).then(({ rows }) => ({
          ok: Object.values(rows[0] || {}).every(Boolean),
          mode: "normalized",
        })).catch(() => ({ ok: false, mode: "normalized" }))
      : Promise.resolve({ ok: true, mode: "disabled" }),
    USE_RELATIONAL_PRIVACY
      ? readinessQuery(
          `SELECT
             to_regclass('public.privacy_requests') IS NOT NULL AS requests,
             to_regclass('public.privacy_erasure_objects') IS NOT NULL AS objects,
             to_regclass('public.idx_privacy_one_active_request') IS NOT NULL AS active_uniqueness,
             to_regclass('public.uq_privacy_object_key') IS NOT NULL AS object_uniqueness,
             NOT EXISTS (
               SELECT 1 FROM privacy_requests
               WHERE status = 'Completed'
                 AND (completed_at IS NULL OR completion_evidence = '{}'::jsonb)
             ) AS completion_evidence,
             NOT EXISTS (
               SELECT 1 FROM privacy_requests
               WHERE status IN ('PendingReview', 'Approved', 'Processing', 'Blocked', 'Failed')
                 AND coverage_version <> 'normalized-v2'
             ) AS active_coverage_current,
             NOT EXISTS (
               SELECT 1 FROM privacy_erasure_objects
               WHERE status = 'Deleted' AND object_key IS NOT NULL
             ) AS deleted_keys_redacted`
        ).then(({ rows }) => ({
          ok: Object.values(rows[0] || {}).every(Boolean)
            && ENABLE_PRIVACY_ERASURE_WORKER
            && PRIVACY_COVERAGE_ACK
            && USE_RELATIONAL_PAYMENTS
            && USE_RELATIONAL_SKILLS
            && USE_RELATIONAL_IDENTITY
            && USE_RELATIONAL_ATTEMPTS
            && USE_RELATIONAL_CERTIFICATES
            && USE_RELATIONAL_CANDIDATE_ASSESSMENTS
            && USE_RELATIONAL_WORKPLACE,
          mode: "normalized",
          worker: ENABLE_PRIVACY_ERASURE_WORKER ? "enabled" : "disabled",
        })).catch(() => ({ ok: false, mode: "normalized", worker: "unknown" }))
      : Promise.resolve({ ok: true, mode: "disabled", worker: "disabled" }),
    USE_PG_COURSES
      ? Promise.resolve().then(() => relationalQuery(
          `SELECT
             to_regclass('public.report_exports') IS NOT NULL AS reports,
             to_regclass('public.idx_report_exports_due') IS NOT NULL AS due_index,
             EXISTS (
               SELECT 1 FROM information_schema.columns
               WHERE table_schema = 'public' AND table_name = 'report_exports'
                 AND column_name = 'attempts'
             ) AS retry_state`
        )).then(({ rows }) => ({
          ok: Object.values(rows[0] || {}).every(Boolean) && ENABLE_REPORT_EXPORT_WORKER,
          mode: "normalized",
          worker: ENABLE_REPORT_EXPORT_WORKER ? "enabled" : "disabled",
        })).catch(() => ({ ok: false, mode: "normalized", worker: "unknown" }))
      : Promise.resolve({ ok: true, mode: "disabled", worker: "disabled" }),
    USE_RELATIONAL_SETTINGS
      ? Promise.resolve().then(() => relationalQuery(
          `SELECT
             to_regclass('public.system_settings') IS NOT NULL AS settings_table,
             EXISTS (
               SELECT 1 FROM system_settings
               WHERE key = 'proctoring' AND jsonb_typeof(value) = 'object'
             ) AS proctoring_settings`
        )).then(({ rows }) => ({
          ok: Object.values(rows[0] || {}).every(Boolean), mode: "normalized",
        })).catch(() => ({ ok: false, mode: "normalized" }))
      : Promise.resolve({ ok: true, mode: "disabled" }),
    USE_RELATIONAL_AUDIT
      ? Promise.resolve().then(() => relationalQuery(
          `SELECT
             to_regclass('public.audit_logs') IS NOT NULL AS audit_logs,
             to_regclass('public.security_events') IS NOT NULL AS security_events,
             to_regclass('public.uq_audit_logs_ingest_key') IS NOT NULL AS audit_idempotency,
             to_regclass('public.uq_security_events_ingest_key') IS NOT NULL AS security_idempotency,
             to_regclass('public.idx_security_events_created') IS NOT NULL AS security_ordering,
             EXISTS (
               SELECT 1 FROM pg_trigger
               WHERE tgname = 'trg_scrub_audit_metadata' AND NOT tgisinternal
             ) AS audit_metadata_scrub,
             EXISTS (
               SELECT 1 FROM pg_trigger
               WHERE tgname = 'trg_scrub_security_metadata' AND NOT tgisinternal
             ) AS security_metadata_scrub`
        )).then(({ rows }) => ({
          ok: Object.values(rows[0] || {}).every(Boolean) && AUDIT_TRANSACTIONAL_DEPENDENCIES,
          mode: "normalized",
          dependencies: AUDIT_TRANSACTIONAL_DEPENDENCIES ? "complete" : "incomplete",
        })).catch(() => ({
          ok: false,
          mode: "normalized",
          dependencies: AUDIT_TRANSACTIONAL_DEPENDENCIES ? "complete" : "incomplete",
        }))
      : Promise.resolve({ ok: true, mode: "disabled", dependencies: "disabled" }),
    (USE_RELATIONAL_IDENTITY || USE_PG_COURSES)
      ? Promise.resolve().then(() => relationalQuery(
          `SELECT
             to_regclass('public.deleted_archives') IS NOT NULL AS archives,
             to_regclass('public.uq_deleted_archives_source_key') IS NOT NULL AS backfill_idempotency,
             to_regclass('public.idx_deleted_archives_order') IS NOT NULL AS deterministic_ordering,
             EXISTS (
               SELECT 1 FROM pg_constraint
               WHERE conname = 'deleted_archives_json_shape'
             ) AS json_shape`
        )).then(({ rows }) => ({
          ok: Object.values(rows[0] || {}).every(Boolean), mode: "normalized",
        })).catch(() => ({ ok: false, mode: "normalized" }))
      : Promise.resolve({ ok: true, mode: "disabled" }),
    USE_RELATIONAL_WORKPLACE
      ? Promise.resolve().then(() => relationalQuery(
          `SELECT
             to_regclass('public.attendance_records') IS NOT NULL AS attendance,
             to_regclass('public.performance_reviews') IS NOT NULL AS reviews,
             to_regclass('public.workplace_communications') IS NOT NULL AS communications,
             to_regclass('public.idx_attendance_user_date') IS NOT NULL AS attendance_index,
             to_regclass('public.idx_performance_reviews_user_date') IS NOT NULL AS review_index,
             to_regclass('public.idx_workplace_communications_recipient') IS NOT NULL AS recipient_index,
             to_regclass('public.idx_workplace_communications_sender') IS NOT NULL AS sender_index,
             EXISTS (
               SELECT 1 FROM pg_constraint WHERE conname = 'uq_attendance_user_date'
             ) AS attendance_uniqueness`
        )).then(({ rows }) => ({
          ok: Object.values(rows[0] || {}).every(Boolean) && WORKPLACE_TRANSACTIONAL_DEPENDENCIES,
          mode: "normalized",
          dependencies: WORKPLACE_TRANSACTIONAL_DEPENDENCIES ? "complete" : "incomplete",
        })).catch(() => ({
          ok: false,
          mode: "normalized",
          dependencies: WORKPLACE_TRANSACTIONAL_DEPENDENCIES ? "complete" : "incomplete",
        }))
      : Promise.resolve({ ok: true, mode: "disabled", dependencies: "disabled" }),
    USE_PG_COURSES
      ? Promise.resolve().then(() => relationalQuery(
          `SELECT
             to_regclass('public.courses') IS NOT NULL AS courses,
             to_regclass('public.chapters') IS NOT NULL AS chapters,
             to_regclass('public.enrollments') IS NOT NULL AS enrollments,
             to_regclass('public.assessments') IS NOT NULL AS assessments,
             to_regclass('public.questions') IS NOT NULL AS questions,
             to_regclass('public.assessment_versions') IS NOT NULL AS assessment_versions,
             to_regclass('public.learning_time_events') IS NOT NULL AS learning_time_events,
             to_regclass('public.cohorts') IS NOT NULL AS cohorts,
             to_regclass('public.idx_courses_owner') IS NOT NULL AS course_owner_index,
             to_regclass('public.uq_learning_time_event_idempotency') IS NOT NULL AS time_idempotency,
             to_regclass('public.uq_active_assessment_attempt') IS NOT NULL AS active_attempt_uniqueness,
             to_regclass('public.idx_cohorts_course') IS NOT NULL AS cohort_course_index,
             to_regclass('public.idx_enrollments_cohort') IS NOT NULL AS cohort_enrollment_index,
             NOT EXISTS (
               SELECT 1 FROM enrollments e
               LEFT JOIN courses c ON c.id = e.course_id
               LEFT JOIN users u ON u.id = e.user_id
               WHERE c.id IS NULL OR u.id IS NULL
             ) AS enrollment_references,
             NOT EXISTS (
               SELECT 1 FROM assessments a
               LEFT JOIN courses c ON c.id = a.course_id
               WHERE c.id IS NULL
             ) AS assessment_references`
        )).then(({ rows }) => ({
          ok: Object.values(rows[0] || {}).every(Boolean) && COURSE_AUTHORITY_COVERAGE_ACK,
          mode: "normalized",
          coverage: COURSE_AUTHORITY_COVERAGE_ACK
            ? COURSE_AUTHORITY_COVERAGE_VERSION
            : "unacknowledged",
        })).catch(() => ({
          ok: false,
          mode: "normalized",
          coverage: COURSE_AUTHORITY_COVERAGE_ACK
            ? COURSE_AUTHORITY_COVERAGE_VERSION
            : "unacknowledged",
        }))
      : Promise.resolve({ ok: true, mode: "disabled", coverage: "disabled" }),
  ]);
  const ok = startupReady && database.ok && redis.ok && objects.ok && skillsAuthority.ok
    && payments.ok && identity.ok
    && attemptRuntime.ok && certificateAuthority.ok && candidateRuntime.ok && privacyAuthority.ok
    && reportAuthority.ok && settingsAuthority.ok && auditAuthority.ok && archiveAuthority.ok
    && workplaceAuthority.ok
    && courseAuthority.ok && passwordResetDelivery.ok;
  if (!ok) logger.error("READINESS_CHECK_FAILED", {
    database, redis, objects, skills: skillsAuthority, payments, identity, attempts: attemptRuntime,
    certificates: certificateAuthority, candidateAssessments: candidateRuntime,
    privacy: privacyAuthority, reports: reportAuthority, settings: settingsAuthority,
    audit: auditAuthority,
    archives: archiveAuthority,
    workplace: workplaceAuthority,
    courses: courseAuthority, passwordResetDelivery, startupReady,
  });
  res.status(ok ? 200 : 503).json({
    ok,
    service: "Nalanda API",
    checks: {
      database: { ok: database.ok, mode: database.mode },
      redis: { ok: redis.ok, mode: redis.mode },
      objects: { ok: objects.ok, mode: objects.mode },
      skills: { ok: skillsAuthority.ok, mode: skillsAuthority.mode },
      payments: { ok: payments.ok, mode: payments.mode },
      identity: { ok: identity.ok, mode: identity.mode },
      attempts: { ok: attemptRuntime.ok, mode: attemptRuntime.mode },
      certificates: { ok: certificateAuthority.ok, mode: certificateAuthority.mode },
      candidateAssessments: { ok: candidateRuntime.ok, mode: candidateRuntime.mode },
      privacy: {
        ok: privacyAuthority.ok,
        mode: privacyAuthority.mode,
        worker: privacyAuthority.worker,
      },
      reports: {
        ok: reportAuthority.ok,
        mode: reportAuthority.mode,
        worker: reportAuthority.worker,
      },
      settings: { ok: settingsAuthority.ok, mode: settingsAuthority.mode },
      audit: {
        ok: auditAuthority.ok,
        mode: auditAuthority.mode,
        dependencies: auditAuthority.dependencies,
      },
      archives: { ok: archiveAuthority.ok, mode: archiveAuthority.mode },
      workplace: {
        ok: workplaceAuthority.ok,
        mode: workplaceAuthority.mode,
        dependencies: workplaceAuthority.dependencies,
      },
      courses: courseAuthority,
      passwordResetDelivery,
    },
  });
});

app.get("/api/csrf-token", (req, res) => {
  const token = crypto.randomBytes(32).toString("hex");
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAMESITE,
    maxAge: 8 * 60 * 60 * 1000,
  });
  res.json({ csrfToken: token });
});

app.get("/api/app-data", authenticate, async (req, res) => {
  const admin = isAdmin(req.user.role);
  const superAdmin = req.user.role === "Super Admin";
  const authoritativeVisibleUsers = USE_RELATIONAL_IDENTITY
    ? (admin
        ? await identityRepository.listUsers({ status: "All" })
        : req.user.role === "Manager"
          ? await identityRepository.listUsers({ managerId: req.user.id, status: "Active" })
          : [await identityRepository.findUserById(req.user.id)].filter(Boolean))
    : users.filter((user) => visibleUserIdsFor(req.user).includes(user.id));
  const visibleUserIds = new Set(authoritativeVisibleUsers.map((user) => user.id));
  const allSkills = USE_RELATIONAL_SKILLS ? await skillsRepo.listSkills() : skills;
  const allTargetSkills = USE_RELATIONAL_SKILLS ? await skillsRepo.listTargetSkills() : targetSkills;
  const visibleCourses = USE_PG_COURSES
    ? await courseAuthorityRepository.listVisible({ actor: req.user, status: "Active" })
    : coursesVisibleTo(req.user);
  const visibleCourseIds = new Set(visibleCourses.map((course) => course.id));
  const authoritativeAssignments = USE_PG_COURSES
    ? await enrollmentsRepo.listEnrollments()
    : assignments;
  const scopedAssignments = authoritativeAssignments.filter((assignment) =>
    visibleUserIds.has(assignment.userId) && (admin || visibleCourseIds.has(assignment.courseId)));
  const authoritativeAttempts = USE_RELATIONAL_ATTEMPTS ? await attemptsRepository.list() : attempts;
  const authoritativeProctoring = USE_RELATIONAL_ATTEMPTS
    ? await attemptsRepository.listProctorEvents(admin ? {} : { userIds: [...visibleUserIds] })
    : proctoringLogs;
  const scopedAttempts = authoritativeAttempts.filter((attempt) => admin || visibleUserIds.has(attempt.userId));
  const scopedProctoring = authoritativeProctoring.filter((event) => admin || visibleUserIds.has(event.userId));
  const scopedReports = USE_PG_COURSES && (admin || req.user.role === "Manager")
    ? await reportsRepository.listAccessible({ actor: req.user })
    : (admin ? reportExports : reportExports.filter((report) => report.requestedBy === req.user.id));
  const scopedAiFeedback = USE_PG_COURSES && (admin || req.user.role === "Manager")
    ? await aiFeedbackRepository.list(req.user, 25)
    : (admin ? acharyaFeedbackMemory : []);
  const scopedLearningTimeEvents = USE_PG_COURSES
    ? await analyticsRepository.listTimeEvents({ actor: req.user, limit: 500 })
    : learningTimeEvents.filter((event) => admin || visibleUserIds.has(event.userId));
  const scopedSkillRatings = USE_RELATIONAL_SKILLS
    ? await skillsRepo.listSkillRatings(req.user)
    : skillRatings.filter((rating) => admin || visibleUserIds.has(rating.userId));
  const scopedChapterFeedbacks = USE_RELATIONAL_SKILLS
    ? await skillsRepo.listChapterFeedback(req.user)
    : chapterFeedbacks.filter((feedback) => admin || feedback.userId === req.user.id || (req.user.role === "Manager" && visibleUserIds.has(feedback.userId)));
  const authoritativeSettings = admin
    ? (USE_RELATIONAL_SETTINGS ? await settingsRepository.getProctoring() : settings)
    : {};
  const authoritativeAudit = admin && USE_RELATIONAL_AUDIT
    ? await securityEvidenceRepository.listAudit({ limit: 200 })
    : null;
  const authoritativeSecurityEvents = admin && USE_RELATIONAL_AUDIT
    ? await securityEvidenceRepository.listSecurityEvents({ limit: 500 })
    : null;
  const relationalArchiveTypes = [
    ...(USE_RELATIONAL_IDENTITY ? ["User"] : []),
    ...(USE_PG_COURSES ? ["Course", "Assessment"] : []),
  ];
  const authoritativeArchives = superAdmin && relationalArchiveTypes.length
    ? [
        ...await archiveAuthorityRepository.listArchives({ entityTypes: relationalArchiveTypes }),
        ...archives.filter((item) => !relationalArchiveTypes.includes(item.entityType)),
      ].sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime())
    : archives;
  const scopedCertificates = USE_RELATIONAL_CERTIFICATES
    ? await certificatesPgRepository.listForUser(req.user)
    : issuedCertificates.filter((cert) => admin || visibleUserIds.has(cert.employeeId));
  const scopedCandidateAssessments = USE_RELATIONAL_CANDIDATE_ASSESSMENTS
    ? await candidateAssessmentsPgRepository.listForUser(req.user)
    : (admin ? candidateAssessments : candidateAssessments.filter((item) => item.createdBy === req.user.id));
  const authoritativeChapters = USE_PG_COURSES
    ? await chaptersRepo.listChapters()
    : chapters;
  const scopedChapters = authoritativeChapters.filter((chapter) => visibleCourseIds.has(chapter.courseId));
  const scopedAssessments = USE_PG_COURSES
    ? await assessmentAuthorityRepository.listVisible({ actor: req.user, status: "Active" })
    : assessmentsVisibleTo(req.user).map((assessment) => assessmentForUser(assessment, req.user));
  const scopedUsers = authoritativeVisibleUsers.map(publicUser);
  res.json({
    users: scopedUsers,
    courses: visibleCourses,
    chapters: scopedChapters,
    assessments: scopedAssessments,
    assignments: scopedAssignments,
    attempts: scopedAttempts,
    proctoringLogs: scopedProctoring,
    auditLogs: admin ? redactSensitive(authoritativeAudit?.data || auditLogs) : [],
    securityEvents: admin ? redactSensitive(authoritativeSecurityEvents?.data || securityEvents.slice(0, 500)) : [],
    learningTimeEvents: scopedLearningTimeEvents,
    acharyaFeedbackMemory: scopedAiFeedback,
    reportExports: scopedReports,
    settings: authoritativeSettings,
    issuedCertificates: scopedCertificates,
    archives: superAdmin ? redactSensitive(authoritativeArchives) : [],
    skills: allSkills,
    targetSkills: allTargetSkills.filter((target) => targetSkillVisibleTo(target, req.user)),
    skillRatings: scopedSkillRatings,
    chapterFeedbacks: scopedChapterFeedbacks,
    candidateAssessments: scopedCandidateAssessments
  });
});

// Runtime objects are private. They are delivered only through scoped API or
// object-store grants; never publish the local storage directory same-origin.
app.use("/uploads", (_req, res) => res.status(404).json({ error: "Not found" }));

// ── Serve Frontend Production Build ──
const frontendDistPath = path.resolve(__dirname, "../frontend/dist");
app.use(express.static(frontendDistPath));

// Fallback wildcard route to serve the React app's index.html for client-side routing.
app.get("*splat", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

app.use(errorHandler);

// ── Startup & graceful shutdown ──
let httpServer = null;
let retentionTimer = null;
let privacyErasureTimer = null;
let reportExportTimer = null;
let passwordResetWorker = null;

const start = async () => {
  try {
    await storage.init();
    await loadDb();
    if (USE_RELATIONAL_IDENTITY) {
      replaceIdentityProjection(await identityRepository.listUsers({ status: "All" }));
    }
    if (USE_RELATIONAL_ATTEMPTS) {
      replaceAttemptProjection(await attemptsRepository.list());
    }
    await ensureRedisReady();
    const objects = await objectStoreHealth();
    if (!objects.ok) throw new Error(`Object storage is unavailable: ${objects.error || objects.mode}`);
    if (process.env.NODE_ENV === "production") {
      passwordResetDelivery = await passwordResetDeliveryHealth();
      if (!passwordResetDelivery.ok) throw new Error("Password reset queue or email delivery is unavailable");
    }
    retentionTimer = startRetentionDaemon();
    if (USE_RELATIONAL_PRIVACY && ENABLE_PRIVACY_ERASURE_WORKER) {
      privacyErasureTimer = startPrivacyErasureDaemon();
    }
    if (USE_PG_COURSES && ENABLE_REPORT_EXPORT_WORKER) {
      reportExportTimer = startReportExportDaemon();
    }
    if (ENABLE_PASSWORD_RESET_WORKER) {
      passwordResetWorker = startPasswordResetDeliveryDaemon();
    }
    startupReady = true;
  } catch (err) {
    console.error(`FATAL: storage initialization failed (${storage.describe?.() || "unknown"}):`, err?.message || err);
    process.exit(1);
  }
  httpServer = app.listen(PORT, () => {
    console.log(`Nalanda API listening on http://localhost:${PORT} — storage: ${storage.describe?.() || "unknown"}`);
  });
};

let shuttingDown = false;
const shutdown = async (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  startupReady = false;
  console.log(`[shutdown] ${signal} received — flushing state and closing connections...`);
  if (httpServer) await new Promise((resolve) => httpServer.close(resolve)).catch(() => {});
  if (retentionTimer) clearInterval(retentionTimer);
  if (privacyErasureTimer) clearInterval(privacyErasureTimer);
  if (reportExportTimer) clearInterval(reportExportTimer);
  if (passwordResetWorker) passwordResetWorker.stop();
  try { await saveDb(); } catch (err) { console.error("[shutdown] final save failed:", err?.message || err); }
  try { await storage.close(); } catch { /* ignore */ }
  try { await closeRedis(); } catch { /* ignore */ }
  process.exit(0);
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

if (process.env.NODE_ENV !== "test") {
  start();
}

export { app, start };
