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
  publicUser, visibleUserIdsFor, coursesVisibleTo, assignmentVisibleTo,
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USE_PG = process.env.USE_PG === "1";
const USE_PG_SKILLS = USE_PG || process.env.USE_PG_SKILLS === "1";
const USE_PG_PAYMENTS = process.env.USE_PG_PAYMENTS === "1";
const USE_PG_IDENTITY = process.env.USE_PG_IDENTITY === "1";
const USE_PG_ATTEMPTS = process.env.USE_PG_ATTEMPTS === "1";
const USE_PG_CERTIFICATES = process.env.USE_PG_CERTIFICATES === "1";
const USE_PG_CANDIDATE_ASSESSMENTS = process.env.USE_PG_CANDIDATE_ASSESSMENTS === "1";
const USE_PG_PRIVACY = process.env.USE_PG_PRIVACY === "1";
const USE_PG_COURSES = process.env.USE_PG_COURSES === "1";
const ENABLE_PRIVACY_ERASURE_WORKER = process.env.ENABLE_PRIVACY_ERASURE_WORKER === "1";
const PRIVACY_COVERAGE_ACK = process.env.PRIVACY_COVERAGE_ACK === "normalized-v1";

const app = express();
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
app.use(verifyCsrf);
app.use("/api", rateLimit({ windowMs: 60_000, max: 600, scope: "ip", name: "global" }));
app.use(persistResponseMiddleware);
app.use(requestCorrelationMiddleware);
app.use(securityLoggingMiddleware);

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
  const [
    database, redis, objects, payments, identity, attemptRuntime,
    certificateAuthority, candidateRuntime, privacyAuthority,
  ] = await Promise.all([
    storage.health(),
    redisHealth(),
    objectStoreHealth(),
    USE_PG_PAYMENTS
      ? relationalQuery(
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
    USE_PG_IDENTITY
      ? relationalQuery(
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
    USE_PG_ATTEMPTS
      ? relationalQuery(
          `SELECT
             to_regclass('public.assessment_attempts') IS NOT NULL AS attempts,
             to_regclass('public.proctoring_logs') IS NOT NULL AS proctoring,
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
    USE_PG_CERTIFICATES
      ? relationalQuery(
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
    USE_PG_CANDIDATE_ASSESSMENTS
      ? relationalQuery(
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
    USE_PG_PRIVACY
      ? relationalQuery(
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
               SELECT 1 FROM privacy_erasure_objects
               WHERE status = 'Deleted' AND object_key IS NOT NULL
             ) AS deleted_keys_redacted`
        ).then(({ rows }) => ({
          ok: Object.values(rows[0] || {}).every(Boolean)
            && ENABLE_PRIVACY_ERASURE_WORKER
            && PRIVACY_COVERAGE_ACK
            && USE_PG_PAYMENTS
            && USE_PG_IDENTITY
            && USE_PG_ATTEMPTS
            && USE_PG_CERTIFICATES
            && USE_PG_CANDIDATE_ASSESSMENTS,
          mode: "normalized",
          worker: ENABLE_PRIVACY_ERASURE_WORKER ? "enabled" : "disabled",
        })).catch(() => ({ ok: false, mode: "normalized", worker: "unknown" }))
      : Promise.resolve({ ok: true, mode: "disabled", worker: "disabled" }),
  ]);
  // The relational learning workflow is still a partial cutover. Course,
  // chapter, progress and assessment authority exist, but secondary consumers
  // are not fully migrated; enabled tasks must drain from the load balancer.
  const courseAuthority = {
    ok: !USE_PG_COURSES,
    mode: USE_PG_COURSES ? "experimental-learning-secondary-consumers" : "disabled",
  };
  const ok = startupReady && database.ok && redis.ok && objects.ok && payments.ok && identity.ok
    && attemptRuntime.ok && certificateAuthority.ok && candidateRuntime.ok && privacyAuthority.ok
    && courseAuthority.ok;
  if (!ok) logger.error("READINESS_CHECK_FAILED", {
    database, redis, objects, payments, identity, attempts: attemptRuntime,
    certificates: certificateAuthority, candidateAssessments: candidateRuntime,
    privacy: privacyAuthority, courses: courseAuthority, startupReady,
  });
  res.status(ok ? 200 : 503).json({
    ok,
    service: "Nalanda API",
    checks: {
      database: { ok: database.ok, mode: database.mode },
      redis: { ok: redis.ok, mode: redis.mode },
      objects: { ok: objects.ok, mode: objects.mode },
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
      courses: courseAuthority,
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
  const visibleUserIds = new Set(visibleUserIdsFor(req.user));
  const allSkills = USE_PG_SKILLS ? await skillsRepo.listSkills() : skills;
  const allTargetSkills = USE_PG_SKILLS ? await skillsRepo.listTargetSkills() : targetSkills;
  const visibleCourses = USE_PG_COURSES
    ? await courseAuthorityRepository.listVisible({ actor: req.user, status: "Active" })
    : coursesVisibleTo(req.user);
  const visibleCourseIds = new Set(visibleCourses.map((course) => course.id));
  const authoritativeAssignments = USE_PG_COURSES
    ? await enrollmentsRepo.listEnrollments()
    : assignments;
  const scopedAssignments = authoritativeAssignments.filter((assignment) => assignmentVisibleTo(assignment, req.user) && (admin || visibleCourseIds.has(assignment.courseId)));
  const authoritativeAttempts = (USE_PG_ATTEMPTS || USE_PG_COURSES) ? await attemptsRepository.list() : attempts;
  const authoritativeProctoring = (USE_PG_ATTEMPTS || USE_PG_COURSES)
    ? await attemptsRepository.listProctorEvents(admin ? {} : { userIds: [...visibleUserIds] })
    : proctoringLogs;
  const scopedAttempts = authoritativeAttempts.filter((attempt) => admin || visibleUserIds.has(attempt.userId));
  const scopedProctoring = authoritativeProctoring.filter((event) => admin || visibleUserIds.has(event.userId));
  const scopedReports = admin ? reportExports : reportExports.filter((report) => report.requestedBy === req.user.id);
  const scopedCertificates = USE_PG_CERTIFICATES
    ? await certificatesPgRepository.listForUser(req.user)
    : issuedCertificates.filter((cert) => admin || visibleUserIds.has(cert.employeeId));
  const scopedCandidateAssessments = USE_PG_CANDIDATE_ASSESSMENTS
    ? await candidateAssessmentsPgRepository.listForUser(req.user)
    : (admin ? candidateAssessments : candidateAssessments.filter((item) => item.createdBy === req.user.id));
  const authoritativeChapters = USE_PG_COURSES
    ? await chaptersRepo.listChapters()
    : chapters;
  const scopedChapters = authoritativeChapters.filter((chapter) => visibleCourseIds.has(chapter.courseId));
  const scopedAssessments = USE_PG_COURSES
    ? await assessmentAuthorityRepository.listVisible({ actor: req.user, status: "Active" })
    : assessmentsVisibleTo(req.user).map((assessment) => assessmentForUser(assessment, req.user));
  const scopedUsers = users.filter((user) => visibleUserIds.has(user.id)).map(publicUser);
  res.json({
    users: scopedUsers,
    courses: visibleCourses,
    chapters: scopedChapters,
    assessments: scopedAssessments,
    assignments: scopedAssignments,
    attempts: scopedAttempts,
    proctoringLogs: scopedProctoring,
    auditLogs: admin ? redactSensitive(auditLogs) : [],
    securityEvents: admin ? redactSensitive(securityEvents.slice(0, 500)) : [],
    learningTimeEvents: learningTimeEvents.filter((event) => admin || visibleUserIds.has(event.userId)),
    acharyaFeedbackMemory: admin ? acharyaFeedbackMemory : [],
    reportExports: scopedReports,
    settings: admin ? settings : {},
    issuedCertificates: scopedCertificates,
    archives: superAdmin ? redactSensitive(archives) : [],
    skills: allSkills,
    targetSkills: allTargetSkills.filter((target) => targetSkillVisibleTo(target, req.user)),
    skillRatings: skillRatings.filter((rating) => admin || visibleUserIds.has(rating.userId)),
    chapterFeedbacks: chapterFeedbacks.filter((feedback) => admin || feedback.userId === req.user.id || (req.user.role === "Manager" && visibleUserIds.has(feedback.userId))),
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

const start = async () => {
  try {
    await storage.init();
    await loadDb();
    if (USE_PG_IDENTITY) {
      replaceIdentityProjection(await identityRepository.listUsers({ status: "All" }));
    }
    if (USE_PG_ATTEMPTS) {
      replaceAttemptProjection(await attemptsRepository.list());
    }
    await ensureRedisReady();
    const objects = await objectStoreHealth();
    if (!objects.ok) throw new Error(`Object storage is unavailable: ${objects.error || objects.mode}`);
    retentionTimer = startRetentionDaemon();
    if (USE_PG_PRIVACY && ENABLE_PRIVACY_ERASURE_WORKER) {
      privacyErasureTimer = startPrivacyErasureDaemon();
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
