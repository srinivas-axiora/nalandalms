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
  PORT, corsOrigin, COOKIE_SECURE, COOKIE_SAMESITE, CSRF_COOKIE, GEMINI_MODEL, getGeminiApiKey,
} from "./src/config.js";
import {
  now, isAdmin, users, courses, chapters, assessments, assignments, attempts, proctoringLogs,
  learningTimeEvents, reportExports, auditLogs, securityEvents, archives,
  skills, targetSkills, skillRatings, chapterFeedbacks, settings,
  issuedCertificates, acharyaFeedbackMemory, storage, saveDb, loadDb,
} from "./src/core.js";
import {
  publicUser, visibleUserIdsFor, coursesVisibleTo, assignmentVisibleTo,
  assessmentsVisibleTo, assessmentForUser, targetSkillVisibleTo,
} from "./src/domain.js";
import {
  verifyCsrf, rateLimit, authenticate, persistResponseMiddleware, securityLoggingMiddleware, errorHandler,
} from "./src/middleware.js";

import { registerCertificates } from "./src/modules/certificates/certificates.routes.js";
import { registerGovernance } from "./src/modules/governance/governance.routes.js";
import { registerSettings } from "./src/modules/settings/settings.routes.js";
import { registerSkills } from "./src/modules/skills/skills.routes.js";
import { registerAnalytics } from "./src/modules/analytics/analytics.routes.js";
import { registerReports } from "./src/modules/reports/reports.routes.js";
import { registerAuth } from "./src/modules/auth/auth.routes.js";
import { registerUsers } from "./src/modules/users/users.routes.js";
import { registerEnrollments } from "./src/modules/enrollments/enrollments.routes.js";
import { registerProctoring } from "./src/modules/proctoring/proctoring.routes.js";
import { registerCourses } from "./src/modules/courses/courses.routes.js";
import { registerChapters } from "./src/modules/chapters/chapters.routes.js";
import { registerAssessments } from "./src/modules/assessments/assessments.routes.js";
import { registerAI } from "./src/modules/ai/ai.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.set("trust proxy", 1);

// ── Global middleware ──
app.use(helmet());
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(verifyCsrf);
app.use("/api", rateLimit({ windowMs: 60_000, max: 600, scope: "ip", name: "global" }));
app.use(persistResponseMiddleware);
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
registerCourses(app);
registerChapters(app);
registerAssessments(app);
registerAI(app);
registerCertificates(app);

// ── System routes ──
app.get("/api/health", (_req, res) => {
  const apiKey = getGeminiApiKey();
  res.json({ ok: true, service: "Nalanda API", time: now(), geminiConfigured: Boolean(apiKey), geminiModel: GEMINI_MODEL });
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

app.get("/api/app-data", authenticate, (req, res) => {
  const admin = isAdmin(req.user.role);
  const superAdmin = req.user.role === "Super Admin";
  const visibleUserIds = new Set(visibleUserIdsFor(req.user));
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
    auditLogs: admin ? auditLogs : [],
    securityEvents: admin ? securityEvents.slice(0, 500) : [],
    learningTimeEvents: learningTimeEvents.filter((event) => admin || visibleUserIds.has(event.userId)),
    acharyaFeedbackMemory: admin ? acharyaFeedbackMemory : [],
    reportExports: scopedReports,
    settings: admin ? settings : {},
    issuedCertificates: scopedCertificates,
    archives: superAdmin ? archives : [],
    skills,
    targetSkills: targetSkills.filter((target) => targetSkillVisibleTo(target, req.user)),
    skillRatings: skillRatings.filter((rating) => admin || visibleUserIds.has(rating.userId)),
    chapterFeedbacks: chapterFeedbacks.filter((feedback) => admin || feedback.userId === req.user.id || visibleCourseIds.has(feedback.courseId))
  });
});

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

const start = async () => {
  try {
    await storage.init();
    await loadDb();
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
  console.log(`[shutdown] ${signal} received — flushing state and closing connections...`);
  if (httpServer) await new Promise((resolve) => httpServer.close(resolve)).catch(() => {});
  try { await saveDb(); } catch (err) { console.error("[shutdown] final save failed:", err?.message || err); }
  try { await storage.close(); } catch { /* ignore */ }
  process.exit(0);
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

start();
