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
import * as assessmentsRepo from "./src/repositories/assessments.repository.pg.js";
import * as enrollmentsRepo from "./src/repositories/enrollments.repository.pg.js";
import * as skillsRepo from "./src/repositories/skills.repository.pg.js";
import { query as relationalQuery } from "./src/db/pool.js";
import { redactSensitive } from "./src/security/redaction.js";
import { identityRepository } from "./src/repositories/identity.repository.pg.js";
import { replaceIdentityProjection } from "./src/identity-projection.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USE_PG = process.env.USE_PG === "1";
const USE_PG_SKILLS = USE_PG || process.env.USE_PG_SKILLS === "1";
const USE_PG_PAYMENTS = process.env.USE_PG_PAYMENTS === "1";
const USE_PG_IDENTITY = process.env.USE_PG_IDENTITY === "1";

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
  const [database, redis, objects, payments, identity] = await Promise.all([
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
  ]);
  const ok = startupReady && database.ok && redis.ok && objects.ok && payments.ok && identity.ok;
  if (!ok) logger.error("READINESS_CHECK_FAILED", { database, redis, objects, payments, identity, startupReady });
  res.status(ok ? 200 : 503).json({
    ok,
    service: "Nalanda API",
    checks: {
      database: { ok: database.ok, mode: database.mode },
      redis: { ok: redis.ok, mode: redis.mode },
      objects: { ok: objects.ok, mode: objects.mode },
      payments: { ok: payments.ok, mode: payments.mode },
      identity: { ok: identity.ok, mode: identity.mode },
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
  const visibleCourses = coursesVisibleTo(req.user);
  const visibleCourseIds = new Set(visibleCourses.map((course) => course.id));
  const scopedAssignments = assignments.filter((assignment) => assignmentVisibleTo(assignment, req.user) && (admin || visibleCourseIds.has(assignment.courseId)));
  const scopedAttempts = attempts.filter((attempt) => admin || visibleUserIds.has(attempt.userId));
  const scopedProctoring = proctoringLogs.filter((event) => admin || visibleUserIds.has(event.userId));
  const scopedReports = admin ? reportExports : reportExports.filter((report) => report.requestedBy === req.user.id);
  const scopedCertificates = issuedCertificates.filter((cert) => admin || visibleUserIds.has(cert.employeeId));
  const scopedChapters = chapters.filter((chapter) => visibleCourseIds.has(chapter.courseId));
  const scopedAssessments = assessmentsVisibleTo(req.user).map((assessment) => assessmentForUser(assessment, req.user));
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
    candidateAssessments: admin ? candidateAssessments : candidateAssessments.filter((c) => c.createdBy === req.user.id)
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

const start = async () => {
  try {
    await storage.init();
    await loadDb();
    if (USE_PG_IDENTITY) {
      replaceIdentityProjection(await identityRepository.listUsers({ status: "All" }));
    }
    await ensureRedisReady();
    const objects = await objectStoreHealth();
    if (!objects.ok) throw new Error(`Object storage is unavailable: ${objects.error || objects.mode}`);
    retentionTimer = startRetentionDaemon();
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
