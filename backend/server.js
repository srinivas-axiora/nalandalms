import express from "express";
import cors from "cors";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import cookieParser from "cookie-parser";
import sanitizeHtml from "sanitize-html";
import { GoogleGenAI } from "@google/genai";
import { loadEnvFile } from "node:process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import { createStorage } from "./db.js";
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

try {
  loadEnvFile();
} catch {
  // Local .env is optional in deployed environments where variables are injected.
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadLocalEnv = () => {
  const envPaths = [path.resolve(process.cwd(), ".env"), path.resolve(__dirname, "..", ".env")];
  for (const envPath of envPaths) {
    if (!fs.existsSync(envPath)) continue;
    const envText = fs.readFileSync(envPath, "utf8");
    for (const line of envText.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const [key, ...valueParts] = trimmed.split("=");
      if (!process.env[key]) process.env[key] = valueParts.join("=").replace(/^["']|["']$/g, "");
    }
  }
};

loadLocalEnv();

const app = express();
app.set("trust proxy", 1);
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 8080;

if (IS_PRODUCTION && !process.env.DATABASE_URL) {
  console.error("FATAL: DATABASE_URL is required in production. Refusing to use local JSON-file persistence.");
  process.exit(1);
}

// File uploads are buffered in memory, so cap size aggressively and validate type.
const ALLOWED_UPLOAD_MIME = new Set([
  "application/pdf", "video/mp4", "video/webm",
  "image/png", "image/jpeg", "image/webp", "image/gif",
]);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_UPLOAD_MIME.has(file.mimetype)) return cb(null, true);
    return cb(new Error("Unsupported file type"));
  },
});

// ── Secrets & cookie policy ──
const DEFAULT_DEV_SECRET = "dev-only-change-me";
const resolveJwtSecret = () => {
  const fromEnv = process.env.JWT_SECRET;
  if (IS_PRODUCTION) {
    if (!fromEnv || fromEnv === DEFAULT_DEV_SECRET || fromEnv.length < 32) {
      console.error("FATAL: JWT_SECRET must be set to a strong (>= 32 chars), non-default value in production.");
      process.exit(1);
    }
    return fromEnv;
  }
  if (!fromEnv || fromEnv === DEFAULT_DEV_SECRET) {
    console.warn("[security] JWT_SECRET is missing or default — using an ephemeral development secret. Set a strong JWT_SECRET for stable sessions.");
    return crypto.randomBytes(48).toString("hex");
  }
  return fromEnv;
};
const JWT_SECRET = resolveJwtSecret();
const COOKIE_SECURE = IS_PRODUCTION;
const COOKIE_SAMESITE = "lax";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const getGeminiApiKey = () => {
  if (!process.env.GEMINI_API_KEY) loadLocalEnv();
  return (process.env.GEMINI_API_KEY || "").trim();
};

const geminiErrorMessage = (err) => {
  const message = err?.message || "";
  if (err?.status === 429 || message.includes("RESOURCE_EXHAUSTED") || message.toLowerCase().includes("quota")) {
    return "Gemini API quota exceeded for the selected model. Check Google AI Studio billing/quota or set GEMINI_MODEL to a model with available quota.";
  }
  if (err?.status === 400) return "Gemini rejected the request. Please shorten or revise the prompt and try again.";
  if (err?.status === 403) return "Gemini API key is not authorized for this model or project.";
  return "Gemini failed to generate a response. Please try again.";
};

// Bound any provider call so a slow/hung upstream cannot pin a request open.
const withTimeout = (promise, ms, label = "operation") => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s`)), ms)),
]);

app.use(helmet());

// ── CORS allow-list ──
// In production the SPA is served from the same origin, so cross-origin
// requests are denied unless explicitly allow-listed via ALLOWED_ORIGINS.
const ALLOWED_ORIGINS = String(process.env.ALLOWED_ORIGINS || "")
  .split(",").map((o) => o.trim()).filter(Boolean);
const DEV_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8080"];
const corsOrigin = (origin, cb) => {
  if (!origin) return cb(null, true); // same-origin / non-browser clients
  const allow = ALLOWED_ORIGINS.length ? ALLOWED_ORIGINS : (IS_PRODUCTION ? [] : DEV_ORIGINS);
  if (allow.includes(origin)) return cb(null, true);
  return cb(new Error("Origin not allowed by CORS"));
};
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// ── CSRF protection (double-submit cookie) ──
// A random token is delivered in an HttpOnly cookie AND echoed to the client in
// the JSON body; the client returns it via the X-CSRF-Token header. An attacker
// on another origin can read neither the cookie nor the (CORS-protected) JSON
// response, so they cannot forge a matching header. The token is bound to the
// browser session rather than shared in a global set.
const CSRF_COOKIE = "csrfToken";
const STEP_UP_COOKIE = "stepUpToken";
const timingSafeEqual = (a, b) => {
  const bufA = Buffer.from(String(a || ""));
  const bufB = Buffer.from(String(b || ""));
  if (bufA.length === 0 || bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};
const verifyCsrf = (req, res, next) => {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") return next();
  const headerToken = req.headers["x-csrf-token"];
  const cookieToken = req.cookies?.[CSRF_COOKIE];
  if (!headerToken || !cookieToken || !timingSafeEqual(headerToken, cookieToken)) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }
  next();
};
app.use(verifyCsrf);

// ── In-memory sliding-window rate limiter ──
const rateBuckets = new Map();
const RATE_BUCKET_LIMIT = 50000;
const rateLimit = ({ windowMs = 60_000, max = 600, scope = "ip", name = "" } = {}) => (req, res, next) => {
  const who = scope === "user" ? (req.user?.id || req.ip || "anon") : (req.ip || "anon");
  const key = `${name}|${scope}|${who}`;
  const cutoff = Date.now() - windowMs;
  const hits = (rateBuckets.get(key) || []).filter((t) => t > cutoff);
  if (hits.length >= max) {
    res.setHeader("Retry-After", String(Math.ceil(windowMs / 1000)));
    return res.status(429).json({ error: "Too many requests. Please slow down and try again shortly." });
  }
  hits.push(Date.now());
  rateBuckets.set(key, hits);
  if (rateBuckets.size > RATE_BUCKET_LIMIT) rateBuckets.clear();
  next();
};
// Stricter per-user budget for cost-bearing AI endpoints; applied after authenticate.
const aiRateLimit = rateLimit({ windowMs: 60_000, max: 15, scope: "user", name: "ai" });
app.use("/api", rateLimit({ windowMs: 60_000, max: 600, scope: "ip", name: "global" }));

app.use((req, res, next) => {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") return next();

  const originalJson = res.json.bind(res);
  res.json = async (body) => {
    if (res.statusCode >= 200 && res.statusCode < 400 && !res.headersSent) {
      try {
        await saveDb();
      } catch (err) {
        console.error("[persist] blocking response after save failure:", err?.message || err);
        res.status(503);
        return originalJson({ error: "Data could not be saved. Please retry shortly." });
      }
    }
    return originalJson(body);
  };

  next();
});

import {
  roles,
  adminRoles,
  now,
  nextCourseId,
  loginSecurity,
  sessionVersions,
  rateLimitLog,
  issuedCertificates,
  archives,
  MAX_LOGIN_ATTEMPTS,
  LOCKOUT_MS,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX,
  MAX_CHAPTER_TIME_INCREMENT_SECONDS,
  ASSESSMENT_TIME_GRACE_SECONDS,
  isAdmin,
  rateLimitCheck,
  rateLimitRecord,
  rolePassword,
  demoUser,
  users,
  skills,
  targetSkills,
  skillRatings,
  chapterFeedbacks,
  courses,
  chapters,
  questionTemplates,
  makeQuestions,
  generatedAssessments,
  assessments,
  assignments,
  attempts,
  proctoringLogs,
  auditLogs,
  securityEvents,
  learningTimeEvents,
  acharyaFeedbackMemory,
  reportExports,
  settings,
  videoProgress,
  dbPath,
  storage,
  snapshot,
  saveDb,
  persist,
  loadDb,
} from "./src/core.js";

const publicUser = (user) => {
  const { passwordHash, ...safe } = user;
  const sessionVersion = sessionVersions[user.id] || 0;
  return { ...safe, sessionVersion, sv: sessionVersion };
};

const AUDIT_LOG_CAP = 5000;
const audit = (actorId, action, entityType, entityId, metadata = {}) => {
  auditLogs.unshift({ id: uuid(), actorId, action, entityType, entityId, metadata, createdAt: now() });
  if (auditLogs.length > AUDIT_LOG_CAP) auditLogs.length = AUDIT_LOG_CAP;
};

const SECURITY_EVENT_CAP = 10000;
const securityEvent = (req, type, metadata = {}) => {
  securityEvents.unshift({
    id: uuid(),
    type,
    actorId: req?.user?.id || null,
    ip: req?.ip || null,
    method: req?.method || null,
    path: req?.originalUrl || req?.url || null,
    userAgent: req?.headers?.["user-agent"] || null,
    metadata,
    createdAt: now(),
  });
  if (securityEvents.length > SECURITY_EVENT_CAP) securityEvents.length = SECURITY_EVENT_CAP;
};

app.use((req, res, next) => {
  res.on("finish", () => {
    if (res.statusCode === 401) securityEvent(req, "AUTHENTICATION_FAILED", { statusCode: res.statusCode });
    if (res.statusCode === 403) securityEvent(req, "AUTHORIZATION_DENIED", { statusCode: res.statusCode });
    if (res.statusCode === 429) securityEvent(req, "RATE_LIMITED", { statusCode: res.statusCode });
  });
  next();
});

// ── Server-side HTML sanitizer (no external deps) ──
// Defense-in-depth for stored rich-text / AI chapter bodies that the client
// renders with dangerouslySetInnerHTML. Removes dangerous elements, inline
// event handlers, unsafe URL schemes, and style attributes.
const sanitizeHtmlServer = (html = "") => sanitizeHtml(String(html), {
  allowedTags: [
    "p", "br", "strong", "b", "em", "i", "u", "s", "blockquote", "code", "pre",
    "h2", "h3", "h4", "ul", "ol", "li", "a", "table", "thead", "tbody", "tr",
    "th", "td", "hr", "span", "div"
  ],
  allowedAttributes: {
    a: ["href", "name", "target", "rel"],
    "*": ["class"]
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }, true),
  },
  disallowedTagsMode: "discard",
  enforceHtmlBoundary: true,
});

const signToken = (user) => {
  const sv = sessionVersions[user.id] || 0;
  return jwt.sign({ sub: user.id, role: user.role, department: user.department, sv }, JWT_SECRET, { expiresIn: "30m" });
};

const signStepUpToken = (user) => {
  const sv = sessionVersions[user.id] || 0;
  return jwt.sign({ sub: user.id, sv, purpose: "step-up" }, JWT_SECRET, { expiresIn: "10m" });
};

const authenticate = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = users.find((item) => item.id === payload.sub);
    if (!user) return res.status(401).json({ error: "Unknown user" });
    if (user.status !== "Active") return res.status(401).json({ error: "Account deactivated — session revoked" });
    // Check session version — reject stale tokens after deactivation/deletion
    const currentSv = sessionVersions[user.id] || 0;
    if (payload.sv !== currentSv) {
      return res.status(401).json({ error: "Session revoked — please sign in again" });
    }
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

const requireRole = (...allowed) => (req, res, next) => {
  // Super Admin has access to everything Admin can do
  const effective = req.user.role === "Super Admin" && allowed.includes("Admin") ? true : allowed.includes(req.user.role);
  if (!effective) return res.status(403).json({ error: "Forbidden" });
  return next();
};

const requireStepUp = (req, res, next) => {
  const token = req.cookies?.[STEP_UP_COOKIE];
  if (!token) {
    securityEvent(req, "STEP_UP_REQUIRED");
    return res.status(412).json({ error: "Recent re-authentication required", code: "STEP_UP_REQUIRED" });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const currentSv = sessionVersions[req.user.id] || 0;
    if (payload.sub !== req.user.id || payload.purpose !== "step-up" || payload.sv !== currentSv) {
      securityEvent(req, "STEP_UP_INVALID");
      return res.status(412).json({ error: "Recent re-authentication required", code: "STEP_UP_REQUIRED" });
    }
    return next();
  } catch {
    securityEvent(req, "STEP_UP_EXPIRED");
    return res.status(412).json({ error: "Recent re-authentication required", code: "STEP_UP_REQUIRED" });
  }
};

const canManageCourse = (user, course) => isAdmin(user.role) || course.ownerId === user.id;

const visibleUserIdsFor = (user) => {
  if (isAdmin(user.role)) return users.map((item) => item.id);
  if (user.role === "Manager") return users.filter((item) => item.managerId === user.id || item.id === user.id).map((item) => item.id);
  return [user.id];
};

const questionPointsTotal = (assessment) => {
  const questions = assessment?.questions || [];
  return questions.length ? questions.reduce((sum, question) => sum + Number(question.points || 0), 0) || 100 : 100;
};

// Strip answer keys before returning an assessment to a non-owner learner.
// Scoring is done server-side, so the client never needs the correct answers.
const stripAnswerKeys = (assessment) => {
  if (!assessment || !Array.isArray(assessment.questions)) return assessment;
  const questions = assessment.questions.map((q) => {
    const { answer, correctAnswer, expectedAnswer, rubric, ...safe } = q;
    return safe;
  });
  return { ...assessment, questions };
};
const assessmentForUser = (assessment, user) =>
  (isAdmin(user.role) || assessment.ownerId === user.id) ? assessment : stripAnswerKeys(assessment);

const assignmentVisibleTo = (assignment, user) => {
  if (isAdmin(user.role)) return true;
  if (user.role === "Manager") return visibleUserIdsFor(user).includes(assignment.userId);
  return assignment.userId === user.id;
};

const coursesVisibleTo = (user) => {
  if (isAdmin(user.role)) return courses;
  if (user.role === "Manager") {
    return courses.filter((course) => course.ownerId === user.id || (course.approval === "Approved" && course.status === "Active"));
  }
  const assignedCourseIds = new Set(assignments.filter((assignment) => assignment.userId === user.id).map((assignment) => assignment.courseId));
  return courses.filter((course) => assignedCourseIds.has(course.id) && course.approval === "Approved" && course.status === "Active");
};

const assessmentsVisibleTo = (user) => {
  const visibleCourseIds = new Set(coursesVisibleTo(user).map((course) => course.id));
  if (isAdmin(user.role)) return assessments;
  if (user.role === "Manager") {
    return assessments.filter((assessment) => assessment.ownerId === user.id || (visibleCourseIds.has(assessment.courseId) && assessment.approval === "Approved" && assessment.status === "Active"));
  }
  return assessments.filter((assessment) => visibleCourseIds.has(assessment.courseId) && assessment.approval === "Approved" && assessment.status === "Active");
};

const targetSkillVisibleTo = (target, user) => {
  if (isAdmin(user.role)) return true;
  if (target.scope === "Organization") return true;
  if (target.scope === "Employee") return target.userId === user.id;
  if (target.scope === "Role") return target.designation === user.designation;
  if (target.scope === "Department") return target.department === user.department || target.department === `Team:${user.team}`;
  return false;
};

const tokenize = (text = "") => new Set(String(text).toLowerCase().match(/[a-z0-9]+/g) || []);

const getRelevantAcharyaFeedback = ({ text = "", skillName = "", courseLevel = "" }) => {
  const queryTokens = tokenize(`${text} ${skillName} ${courseLevel}`);
  return acharyaFeedbackMemory
    .map((item) => {
      const itemTokens = tokenize(`${item.skillName} ${item.courseLevel} ${item.feedbackType} ${item.comment}`);
      let score = 0;
      queryTokens.forEach((token) => {
        if (itemTokens.has(token)) score += 1;
      });
      if (item.skillName === skillName) score += 4;
      if (item.courseLevel === courseLevel) score += 2;
      return { ...item, score };
    })
    .filter((item) => item.score > 0 || item.rating <= 3)
    .sort((a, b) => b.score - a.score || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
};

const buildFeedbackGuidance = (feedbackItems) => {
  if (!feedbackItems.length) return "No prior generation feedback is available yet.";
  return feedbackItems
    .map((item, index) => `${index + 1}. ${item.feedbackType} feedback, rating ${item.rating}/5: ${item.comment}`)
    .join("\n");
};

const parseGeminiJson = (text) => {
  const raw = String(text || "").trim();
  if (!raw) throw new Error("Gemini returned an empty response.");
  const withoutFence = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    return JSON.parse(withoutFence);
  } catch {
    const start = withoutFence.indexOf("{");
    const end = withoutFence.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(withoutFence.slice(start, end + 1));
    throw new Error("Gemini returned invalid JSON.");
  }
};

const acharyaFeedbackPath = path.resolve(__dirname, "..", "database", "acharya-feedback.json");
const loadAcharyaFeedbackMemory = () => {
  try {
    if (!fs.existsSync(acharyaFeedbackPath)) return [];
    const parsed = JSON.parse(fs.readFileSync(acharyaFeedbackPath, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
const saveAcharyaFeedbackMemory = () => {
  fs.mkdirSync(path.dirname(acharyaFeedbackPath), { recursive: true });
  fs.writeFileSync(acharyaFeedbackPath, JSON.stringify(acharyaFeedbackMemory.slice(0, 100), null, 2));
};
acharyaFeedbackMemory.push(...loadAcharyaFeedbackMemory());

const ensureAssignment = ({ courseId, userId, assignedBy = userId }) => {
  let assignment = assignments.find((item) => item.courseId === courseId && item.userId === userId);
  if (!assignment) {
    assignment = {
      id: uuid(),
      courseId,
      userId,
      assignedBy,
      progress: 0,
      completedChapters: [],
      timeSpentMinutes: 0,
      timeSpentSeconds: 0,
      chapterTimeSpentSeconds: {},
      completedAt: null,
      createdAt: now()
    };
    assignments.unshift(assignment);
  }
  assignment.chapterTimeSpentSeconds = assignment.chapterTimeSpentSeconds || {};
  assignment.completedChapters = assignment.completedChapters || [];
  assignment.timeSpentSeconds = assignment.timeSpentSeconds || Math.round((assignment.timeSpentMinutes || 0) * 60);
  assignment.timeSpentMinutes = Math.ceil((assignment.timeSpentSeconds || 0) / 60);
  return assignment;
};

const addLearningTimeEvent = ({ userId, courseId, chapterId = null, assessmentId = null, eventType, seconds }) => {
  if (!seconds || seconds <= 0) return null;
  const event = { id: uuid(), userId, courseId, chapterId, assessmentId, eventType, secondsSpent: seconds, recordedAt: now() };
  learningTimeEvents.unshift(event);
  if (learningTimeEvents.length > 20000) learningTimeEvents.length = 20000;
  return event;
};

const addChapterTime = ({ courseId, chapterId, userId, seconds }) => {
  const assignment = ensureAssignment({ courseId, userId });
  assignment.timeSpentSeconds = (assignment.timeSpentSeconds || 0) + seconds;
  assignment.timeSpentMinutes = Math.ceil(assignment.timeSpentSeconds / 60);
  assignment.chapterTimeSpentSeconds = {
    ...(assignment.chapterTimeSpentSeconds || {}),
    [chapterId]: ((assignment.chapterTimeSpentSeconds || {})[chapterId] || 0) + seconds
  };
  addLearningTimeEvent({ userId, courseId, chapterId, eventType: "CHAPTER_TIME", seconds });
  return assignment;
};

const addAssessmentTime = ({ attempt, assessment, seconds }) => {
  if (!seconds || seconds <= 0) return null;
  const assignment = ensureAssignment({ courseId: attempt.courseId, userId: attempt.userId });
  assignment.timeSpentSeconds = (assignment.timeSpentSeconds || 0) + seconds;
  assignment.timeSpentMinutes = Math.ceil(assignment.timeSpentSeconds / 60);
  addLearningTimeEvent({ userId: attempt.userId, courseId: attempt.courseId, chapterId: attempt.chapterId || null, assessmentId: assessment?.id || attempt.assessmentId, eventType: "ASSESSMENT_TIME", seconds });
  return assignment;
};

const assessmentTimeFor = ({ userId, courseId, chapterId }) => attempts
  .filter((attempt) => attempt.userId === userId && attempt.courseId === courseId && (!chapterId || attempt.chapterId === chapterId))
  .reduce((sum, attempt) => sum + (attempt.timeSpentSeconds || 0), 0);

const chapterTimeFor = (assignment, chapterId) => Number((assignment.chapterTimeSpentSeconds || {})[chapterId] || 0);

const buildTimeRows = (requester) => {
  const visibleUserIds = visibleUserIdsFor(requester);
  return assignments
    .filter((assignment) => visibleUserIds.includes(assignment.userId))
    .flatMap((assignment) => {
      const chapterIds = new Set([
        ...Object.keys(assignment.chapterTimeSpentSeconds || {}),
        ...attempts
          .filter((attempt) => attempt.userId === assignment.userId && attempt.courseId === assignment.courseId && attempt.chapterId)
          .map((attempt) => attempt.chapterId)
      ]);

      if (chapterIds.size === 0) {
        return [{
          userId: assignment.userId,
          courseId: assignment.courseId,
          chapterId: null,
          chapterTitle: null,
          minimumTimeSeconds: 0,
          minimumTimeMet: true,
          chapterTimeSeconds: 0,
          assessmentTimeSeconds: assessmentTimeFor({ userId: assignment.userId, courseId: assignment.courseId }),
          courseTimeSeconds: assignment.timeSpentSeconds || 0
        }];
      }

      return Array.from(chapterIds).map((chapterId) => {
        const chapter = chapters.find((item) => item.id === chapterId);
        const chapterSeconds = chapterTimeFor(assignment, chapterId);
        const minimumTimeSeconds = Math.max(0, Math.round((chapter?.minimumTimeMinutes || 0) * 60));
        return {
          userId: assignment.userId,
          courseId: assignment.courseId,
          chapterId,
          chapterTitle: chapter?.title || null,
          minimumTimeSeconds,
          minimumTimeMet: chapterSeconds >= minimumTimeSeconds,
          chapterTimeSeconds: chapterSeconds,
          assessmentTimeSeconds: assessmentTimeFor({ userId: assignment.userId, courseId: assignment.courseId, chapterId }),
          courseTimeSeconds: assignment.timeSpentSeconds || 0
        };
      });
    });
};

const buildReportRows = ({ reportType, filters = {}, requester }) => {
  const visibleUserIds = new Set(visibleUserIdsFor(requester));
  const filteredAssignments = assignments.filter((assignment) => {
    if (!visibleUserIds.has(assignment.userId)) return false;
    if (filters.userId && assignment.userId !== filters.userId) return false;
    if (filters.courseId && assignment.courseId !== filters.courseId) return false;
    const user = users.find((item) => item.id === assignment.userId);
    if (filters.team && user?.team !== filters.team) return false;
    if (filters.department && user?.department !== filters.department) return false;
    return true;
  });

  if (reportType === "User" || reportType === "Team" || reportType === "Course") {
    return filteredAssignments.map((assignment) => {
      const user = users.find((item) => item.id === assignment.userId);
      const course = courses.find((item) => item.id === assignment.courseId);
      const chapterSeconds = Object.values(assignment.chapterTimeSpentSeconds || {}).reduce((sum, seconds) => sum + Number(seconds || 0), 0);
      const assessmentSeconds = assessmentTimeFor({ userId: assignment.userId, courseId: assignment.courseId });
      return {
        userId: assignment.userId,
        employeeName: user?.name || assignment.userId,
        team: user?.team || "",
        department: user?.department || "",
        courseId: assignment.courseId,
        courseTitle: course?.title || assignment.courseId,
        progress: assignment.progress || 0,
        chapterTimeSeconds: chapterSeconds,
        assessmentTimeSeconds: assessmentSeconds,
        courseTimeSeconds: assignment.timeSpentSeconds || 0,
        chapterTimeSpentSeconds: assignment.chapterTimeSpentSeconds || {}
      };
    });
  }

  return [];
};

// ── Shared module context (strangler bridge) ──
// Supplies extracted feature modules with the shared state + helpers + middleware
// they need. As foundation layers (config/persistence/middleware/lib) are fully
// extracted, entries here are replaced by direct imports and this object shrinks.
const moduleCtx = {
  authenticate, requireRole, requireStepUp,
  audit, now, publicUser, visibleUserIdsFor, buildReportRows, buildTimeRows,
  users, courses, chapters, assessments, assignments, attempts, proctoringLogs,
  learningTimeEvents, reportExports, auditLogs, securityEvents, archives,
  skills, targetSkills, chapterFeedbacks, settings,
  // auth/users/enrollments/proctoring deps
  isAdmin, roles, sessionVersions, signToken, signStepUpToken, securityEvent,
  rateLimitCheck, rateLimitRecord, loginSecurity, MAX_LOGIN_ATTEMPTS, LOCKOUT_MS,
  COOKIE_SECURE, COOKIE_SAMESITE, CSRF_COOKIE, STEP_UP_COOKIE,
  coursesVisibleTo, addAssessmentTime,
  // courses/chapters/assessments deps
  nextCourseId, canManageCourse, upload, sanitizeHtmlServer, videoProgress,
  addChapterTime, chapterTimeFor, assessmentTimeFor, assessmentsVisibleTo,
  assessmentForUser, questionPointsTotal,
  MAX_CHAPTER_TIME_INCREMENT_SECONDS, ASSESSMENT_TIME_GRACE_SECONDS,
  // ai deps
  aiRateLimit, GEMINI_MODEL, getGeminiApiKey, geminiErrorMessage, withTimeout,
  acharyaFeedbackMemory, saveAcharyaFeedbackMemory, getRelevantAcharyaFeedback,
  buildFeedbackGuidance, parseGeminiJson,
};

registerGovernance(app, moduleCtx);
registerSettings(app, moduleCtx);
registerSkills(app, moduleCtx);
registerAnalytics(app, moduleCtx);
registerReports(app, moduleCtx);
registerAuth(app, moduleCtx);
registerUsers(app, moduleCtx);
registerEnrollments(app, moduleCtx);
registerProctoring(app, moduleCtx);
registerCourses(app, moduleCtx);
registerChapters(app, moduleCtx);
registerAssessments(app, moduleCtx);
registerAI(app, moduleCtx);

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






































// ── Certificates (extracted to a layered module; see src/modules/certificates) ──
// Strangler bridge: shared deps are injected via ctx until the persistence and
// middleware layers are fully extracted in the full rollout.
registerCertificates(app, { store: { issuedCertificates, users, courses }, audit, now, authenticate, requireRole });







// ── Video Progress Endpoints ──






// ── App Data Endpoint ──
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

// ── Skills Endpoints ──




// ── Serve Frontend Production Build ──
const frontendDistPath = path.resolve(__dirname, "../frontend/dist");
app.use(express.static(frontendDistPath));

// Fallback wildcard route to serve React app's index.html for client-side routing
app.get("*splat", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

// ── Centralized error handler (registered last) ──
app.use((err, _req, res, _next) => {
  if (err?.message === "Origin not allowed by CORS") {
    if (!res.headersSent) res.status(403).json({ error: "Origin not allowed" });
    return;
  }
  if (err?.code === "LIMIT_FILE_SIZE") {
    if (!res.headersSent) res.status(413).json({ error: "Uploaded file is too large (max 15MB)." });
    return;
  }
  if (err?.message === "Unsupported file type") {
    if (!res.headersSent) res.status(415).json({ error: "Unsupported file type." });
    return;
  }
  console.error("[error]", err?.message || err);
  if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
});

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
