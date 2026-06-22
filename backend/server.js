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

const roles = ["Super Admin", "Admin", "Manager", "Employee"];
const adminRoles = ["Super Admin", "Admin"];
const now = () => new Date().toISOString();
const nextCourseId = (skill = "GN") => `NLD-${skill.slice(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

// ── Login security & rate limiting state ──
const loginSecurity = {};  // { email: { failedAttempts, lockedUntil, lastFailedAt } }
const sessionVersions = {}; // { userId: number }
const rateLimitLog = [];    // [{ ip, endpoint, at }]
const issuedCertificates = []; // issued cert records
const archives = [];        // deleted entity archives

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 10;
const MAX_CHAPTER_TIME_INCREMENT_SECONDS = 5 * 60;
const ASSESSMENT_TIME_GRACE_SECONDS = 30;

const isAdmin = (role) => adminRoles.includes(role);

const rateLimitCheck = (ip, endpoint) => {
  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
  const recent = rateLimitLog.filter((e) => e.ip === ip && e.endpoint === endpoint && e.at > cutoff);
  return recent.length >= RATE_LIMIT_MAX;
};
const rateLimitRecord = (ip, endpoint) => {
  rateLimitLog.push({ ip, endpoint, at: Date.now() });
  // Cleanup old entries
  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS * 2;
  while (rateLimitLog.length > 0 && rateLimitLog[0].at < cutoff) rateLimitLog.shift();
};

// Seed/demo credentials are env-driven. In production, accounts without a
// configured SEED_*_PASSWORD get a random unknown password (no shipped creds);
// the documented values below are development conveniences only.
const rolePassword = (role) => {
  const envKey = {
    "Super Admin": "SEED_SUPERADMIN_PASSWORD",
    "Admin": "SEED_ADMIN_PASSWORD",
    "Manager": "SEED_MANAGER_PASSWORD",
    "Employee": "SEED_EMPLOYEE_PASSWORD",
  }[role];
  if (envKey && process.env[envKey]) return process.env[envKey];
  return crypto.randomBytes(18).toString("base64url");
};

const demoUser = ({ id, name, email, department, team, designation, role, managerId, status, joinedAt }) => ({
  id,
  name,
  email,
  passwordHash: bcrypt.hashSync(rolePassword(role), 10),
  department,
  team,
  designation,
  role,
  managerId,
  status,
  joinedAt,
  createdAt: now(),
});

const users = [
  demoUser({ id: "SAnalanda", name: "Super Admin", email: "sanalanda@nalanda.local", department: "Administration", team: "Platform Governance", designation: "Super Administrator", role: "Super Admin", managerId: null, status: "Active", joinedAt: "2024-01-01" }),
  demoUser({ id: "EMP-1001", name: "Nisha Rao", email: "admin@nalanda.local", department: "People Ops", team: "Learning Strategy", designation: "L&D Director", role: "Admin", managerId: null, status: "Active", joinedAt: "2024-01-15" }),
  demoUser({ id: "EMP-1002", name: "Aarav Menon", email: "aarav@nalanda.local", department: "Sales", team: "Enterprise Sales", designation: "Sales Lead", role: "Manager", managerId: "EMP-1001", status: "Active", joinedAt: "2024-03-10" }),
  demoUser({ id: "EMP-1003", name: "Kabir Sethi", email: "kabir@nalanda.local", department: "Engineering", team: "Platform", designation: "Tech Lead", role: "Manager", managerId: "EMP-1001", status: "Active", joinedAt: "2024-02-20" }),
  demoUser({ id: "EMP-1004", name: "Diya Sharma", email: "diya@nalanda.local", department: "Engineering", team: "Platform", designation: "Software Engineer", role: "Employee", managerId: "EMP-1003", status: "Active", joinedAt: "2024-06-01" }),
  demoUser({ id: "EMP-1005", name: "Meera Iyer", email: "meera@nalanda.local", department: "Sales", team: "Enterprise Sales", designation: "Account Exec", role: "Employee", managerId: "EMP-1002", status: "Active", joinedAt: "2024-07-15" }),
  demoUser({ id: "EMP-1006", name: "Rohan Das", email: "rohan@nalanda.local", department: "Operations", team: "Revenue Operations", designation: "Ops Analyst", role: "Employee", managerId: "EMP-1002", status: "Active", joinedAt: "2024-08-01" }),
  demoUser({ id: "EMP-1007", name: "Ananya Paul", email: "ananya@nalanda.local", department: "Engineering", team: "QA Automation", designation: "QA Engineer", role: "Employee", managerId: "EMP-1003", status: "Inactive", joinedAt: "2023-11-04" }),
  demoUser({ id: "EMP-1008", name: "Vikram Shah", email: "vikram@nalanda.local", department: "People Ops", team: "HR Operations", designation: "HR Business Partner", role: "Admin", managerId: "EMP-1001", status: "Active", joinedAt: "2024-04-22" }),
];

if (IS_PRODUCTION && !process.env.SEED_SUPERADMIN_PASSWORD) {
  console.warn("[security] No SEED_*_PASSWORD set in production — seeded accounts use random unknown passwords. Set SEED_SUPERADMIN_PASSWORD (and peers) to bootstrap access.");
}

const skills = [
  { id: "SKILL-SEC", name: "Security", category: "Technical", description: "Secure coding, OWASP controls, and threat modeling.", status: "Active", createdAt: now() },
  { id: "SKILL-LEAD", name: "Leadership", category: "Leadership", description: "Feedback, coaching, and team development practices.", status: "Active", createdAt: now() },
  { id: "SKILL-ANL", name: "Analytics", category: "Functional", description: "Data interpretation, storytelling, and business review skills.", status: "Active", createdAt: now() },
  { id: "SKILL-COMM", name: "Communication", category: "Behavioral", description: "Clear stakeholder communication and presentation skills.", status: "Active", createdAt: now() },
  { id: "SKILL-COMP", name: "Compliance", category: "Compliance", description: "Policy, risk, and regulatory readiness.", status: "Active", createdAt: now() },
  { id: "SKILL-QA", name: "QA Automation", category: "Technical", description: "Automated test strategy, UI/API automation, regression quality gates, and release evidence.", status: "Active", createdAt: now() },
  { id: "SKILL-PYFS", name: "Python Full Stack", category: "Technical", description: "Python APIs, frontend integration, databases, authentication, and deployment-ready full stack delivery.", status: "Active", createdAt: now() },
];

const targetSkills = [
  { id: "TS-001", skillId: "SKILL-SEC", scope: "Department", department: "Engineering", targetLevel: "Advanced", targetScore: 85, priority: "High" },
  { id: "TS-002", skillId: "SKILL-ANL", scope: "Department", department: "Sales", targetLevel: "Intermediate", targetScore: 75, priority: "Medium" },
  { id: "TS-003", skillId: "SKILL-LEAD", scope: "Role", designation: "Sales Lead", targetLevel: "Advanced", targetScore: 85, priority: "High" },
  { id: "TS-004", skillId: "SKILL-COMP", scope: "Organization", targetLevel: "Intermediate", targetScore: 70, priority: "High" },
  { id: "TS-005", skillId: "SKILL-SEC", scope: "Employee", userId: "EMP-1004", targetLevel: "Advanced", targetScore: 90, priority: "High" },
  { id: "TS-006", skillId: "SKILL-QA", scope: "Department", department: "Team:QA Automation", targetLevel: "Advanced", targetScore: 85, priority: "High" },
  { id: "TS-007", skillId: "SKILL-PYFS", scope: "Department", department: "Team:Platform", targetLevel: "Intermediate", targetScore: 80, priority: "High" },
];

const skillRatings = [
  { id: "SK-001", userId: "EMP-1004", skill: "Security", score: 87, assessmentsBased: 2, trend: "up", lastUpdated: now() },
  { id: "SK-002", userId: "EMP-1004", skill: "Leadership", score: 42, assessmentsBased: 0, trend: "stable", lastUpdated: now() },
  { id: "SK-003", userId: "EMP-1004", skill: "Analytics", score: 55, assessmentsBased: 0, trend: "stable", lastUpdated: now() },
  { id: "SK-004", userId: "EMP-1004", skill: "Communication", score: 70, assessmentsBased: 1, trend: "up", lastUpdated: now() },
  { id: "SK-005", userId: "EMP-1004", skill: "Compliance", score: 63, assessmentsBased: 1, trend: "stable", lastUpdated: now() },
  { id: "SK-006", userId: "EMP-1005", skill: "Leadership", score: 78, assessmentsBased: 1, trend: "up", lastUpdated: now() },
  { id: "SK-007", userId: "EMP-1005", skill: "Security", score: 35, assessmentsBased: 0, trend: "stable", lastUpdated: now() },
  { id: "SK-008", userId: "EMP-1005", skill: "Communication", score: 82, assessmentsBased: 1, trend: "up", lastUpdated: now() },
  { id: "SK-009", userId: "EMP-1006", skill: "Leadership", score: 91, assessmentsBased: 2, trend: "up", lastUpdated: now() },
  { id: "SK-010", userId: "EMP-1002", skill: "Security", score: 72, assessmentsBased: 1, trend: "up", lastUpdated: now() },
  { id: "SK-011", userId: "EMP-1002", skill: "Leadership", score: 88, assessmentsBased: 2, trend: "up", lastUpdated: now() },
];

const chapterFeedbacks = [
  { id: "CF-001", chapterId: "CH-001", courseId: "CRS-001", userId: "EMP-1004", rating: 5, clarity: 5, relevance: 4, comments: "Very clear and practical content.", submittedAt: now() },
];

const courses = [
  { id: "CRS-001", title: "Secure Coding for Cloud Teams", description: "Threat modeling, OWASP controls, and secure release patterns.", skill: "Security", skillIds: ["SKILL-SEC"], targetLevel: "Advanced", prerequisites: [], category: "Technical", tags: ["OWASP", "Cloud"], thumbnailColor: "#22d3ee", ownerId: "EMP-1003", approval: "Approved", status: "Active", version: 2, difficulty: "Advanced", estimatedHours: 6, createdAt: now(), updatedAt: now() },
  { id: "CRS-002", title: "Manager Essentials: Feedback Systems", description: "Practical rituals for coaching and performance reviews.", skill: "Leadership", skillIds: ["SKILL-LEAD", "SKILL-COMM"], targetLevel: "Intermediate", prerequisites: [], category: "Soft Skills", tags: ["Coaching", "People"], thumbnailColor: "#a78bfa", ownerId: "EMP-1002", approval: "Approved", status: "Active", version: 1, difficulty: "Intermediate", estimatedHours: 4, createdAt: now(), updatedAt: now() },
  { id: "CRS-003", title: "Data Storytelling for Business Reviews", description: "Build executive narratives with evidence and charts.", skill: "Analytics", skillIds: ["SKILL-ANL"], targetLevel: "Beginner", prerequisites: [], category: "Business", tags: ["BI", "Charts"], thumbnailColor: "#34d399", ownerId: "EMP-1003", approval: "Pending", status: "Active", version: 1, difficulty: "Beginner", estimatedHours: 3, createdAt: now(), updatedAt: now() },
  { id: "CRS-QA-001", title: "QA Automation Foundations", description: "Build a practical base in automation strategy, selectors, test design, and stable UI validation.", skill: "QA Automation", skillIds: ["SKILL-QA"], targetLevel: "Intermediate", prerequisites: [], category: "QA Automation", tags: ["Selenium", "Playwright", "Regression"], thumbnailColor: "#38bdf8", ownerId: "EMP-1003", approval: "Approved", status: "Active", version: 1, difficulty: "Intermediate", estimatedHours: 6, createdAt: now(), updatedAt: now() },
  { id: "CRS-PY-001", title: "Python Full Stack Essentials", description: "Create full stack applications with Python APIs, React interfaces, authentication, and database workflows.", skill: "Python Full Stack", skillIds: ["SKILL-PYFS"], targetLevel: "Intermediate", prerequisites: [], category: "Full Stack", tags: ["Python", "FastAPI", "React"], thumbnailColor: "#34d399", ownerId: "EMP-1003", approval: "Approved", status: "Active", version: 1, difficulty: "Intermediate", estimatedHours: 7, createdAt: now(), updatedAt: now() },
  { id: "CRS-QAPY-001", title: "Python API Test Automation", description: "Use Python to validate APIs, contract behavior, fixtures, CI execution, and evidence-ready automation reports.", skill: "QA Automation", skillIds: ["SKILL-QA", "SKILL-PYFS"], targetLevel: "Advanced", prerequisites: ["CRS-QA-001"], category: "QA Automation", tags: ["Pytest", "API", "CI"], thumbnailColor: "#f59e0b", ownerId: "EMP-1003", approval: "Approved", status: "Active", version: 1, difficulty: "Advanced", estimatedHours: 6, createdAt: now(), updatedAt: now() },
];

const chapters = [
  { id: "CH-001", courseId: "CRS-001", sequence: 1, title: "Threat Model Primer", description: "Identify assets, actors, and trust boundaries.", contentType: "Rich Text", body: "A threat model identifies what you're protecting (assets), who might attack (threat actors), where trust changes (boundaries), and what could go wrong (threats). Document controls and validation evidence before every release.", durationMinutes: 25, minimumTimeMinutes: 15, createdAt: now(), updatedAt: now() },
  { id: "CH-002", courseId: "CRS-001", sequence: 2, title: "OWASP Top 10 Deep Dive", description: "Master the OWASP Top 10 vulnerabilities.", contentType: "PDF", body: "Comprehensive walkthrough of all OWASP Top 10 items with real-world exploit examples and mitigation strategies.", fileName: "owasp-top10.pdf", durationMinutes: 35, minimumTimeMinutes: 25, createdAt: now(), updatedAt: now() },
  { id: "CH-003", courseId: "CRS-001", sequence: 3, title: "Secret Scanning & CI/CD", description: "Automated secret detection in pipelines.", contentType: "Video Link", body: "Learn to configure secret scanning tools in your CI/CD pipeline.", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", durationMinutes: 20, minimumTimeMinutes: 10, createdAt: now(), updatedAt: now() },
  { id: "CH-004", courseId: "CRS-002", sequence: 1, title: "SBI Feedback Method", description: "Situation, Behavior, Impact framework.", contentType: "Rich Text", body: "The SBI model structures feedback around observable Situations, specific Behaviors, and measurable Impact. This makes feedback concrete and actionable rather than vague.", durationMinutes: 20, minimumTimeMinutes: 12, createdAt: now(), updatedAt: now() },
  { id: "CH-005", courseId: "CRS-002", sequence: 2, title: "Coaching Conversations", description: "Running effective 1:1 coaching sessions.", contentType: "Rich Text", body: "Structure your coaching around GROW: Goal, Reality, Options, Will. Ask powerful questions instead of giving answers.", durationMinutes: 30, minimumTimeMinutes: 15, createdAt: now(), updatedAt: now() },
  { id: "CH-006", courseId: "CRS-003", sequence: 1, title: "Narrative Flow Fundamentals", description: "Start with the decision, show signal, explain risk.", contentType: "Rich Text", body: "Every data story should answer: What decision does this inform? What does the data signal? What's the risk of inaction?", durationMinutes: 20, minimumTimeMinutes: 10, createdAt: now(), updatedAt: now() },
  { id: "CH-007", courseId: "CRS-003", sequence: 2, title: "Chart Selection Patterns", description: "Choosing the right visualization for your data.", contentType: "PDF", body: "Guide to selecting appropriate chart types based on data relationships.", fileName: "chart-patterns.pdf", durationMinutes: 25, minimumTimeMinutes: 15, createdAt: now(), updatedAt: now() },
  { id: "CH-QA-001", courseId: "CRS-QA-001", sequence: 1, title: "Automation Strategy & Scope", description: "Define what should be automated and how to prioritize regression coverage.", contentType: "Rich Text", body: "Effective QA automation starts with choosing stable, high-value workflows. Classify tests by risk, frequency, business impact, and data setup complexity before writing scripts.", durationMinutes: 35, minimumTimeMinutes: 20, createdAt: now(), updatedAt: now() },
  { id: "CH-QA-002", courseId: "CRS-QA-001", sequence: 2, title: "Locator Design & Page Objects", description: "Create maintainable selectors and reusable page-level actions.", contentType: "Rich Text", body: "Reliable automation depends on stable locators, clear page objects, and test code that describes user behavior instead of DOM implementation details.", durationMinutes: 40, minimumTimeMinutes: 25, createdAt: now(), updatedAt: now() },
  { id: "CH-QA-003", courseId: "CRS-QA-001", sequence: 3, title: "Regression Execution & Reporting", description: "Run suites, manage failures, and produce actionable test evidence.", contentType: "Rich Text", body: "A regression suite should produce fast feedback, isolate flaky failures, and publish artifacts that make release decisions easier.", durationMinutes: 40, minimumTimeMinutes: 25, createdAt: now(), updatedAt: now() },
  { id: "CH-PY-001", courseId: "CRS-PY-001", sequence: 1, title: "Python Backend Foundations", description: "Structure services, routes, validation, and clean business logic.", contentType: "Rich Text", body: "Python backend applications need clear route boundaries, schema validation, service layers, and predictable error handling.", durationMinutes: 45, minimumTimeMinutes: 30, createdAt: now(), updatedAt: now() },
  { id: "CH-PY-002", courseId: "CRS-PY-001", sequence: 2, title: "Frontend Integration Patterns", description: "Connect React interfaces to Python APIs with state and error handling.", contentType: "Rich Text", body: "A full stack feature connects UI state, API contracts, loading states, validation feedback, and secure persistence into one workflow.", durationMinutes: 45, minimumTimeMinutes: 30, createdAt: now(), updatedAt: now() },
  { id: "CH-PY-003", courseId: "CRS-PY-001", sequence: 3, title: "Auth, Database & Deployment", description: "Secure the app, persist data, and prepare production deployment.", contentType: "Rich Text", body: "Production full stack systems need authentication, authorization, migrations, environment configuration, and repeatable deployment checks.", durationMinutes: 50, minimumTimeMinutes: 35, createdAt: now(), updatedAt: now() },
  { id: "CH-QAPY-001", courseId: "CRS-QAPY-001", sequence: 1, title: "Pytest API Foundations", description: "Write API tests with fixtures, assertions, and reusable clients.", contentType: "Rich Text", body: "API automation with pytest relies on reusable clients, focused fixtures, deterministic data setup, and assertions that verify contracts.", durationMinutes: 35, minimumTimeMinutes: 20, createdAt: now(), updatedAt: now() },
  { id: "CH-QAPY-002", courseId: "CRS-QAPY-001", sequence: 2, title: "Contract & Negative Testing", description: "Validate schemas, status codes, edge cases, and failure behavior.", contentType: "Rich Text", body: "Strong API quality includes positive, negative, boundary, authorization, and contract tests that catch behavior drift early.", durationMinutes: 40, minimumTimeMinutes: 25, createdAt: now(), updatedAt: now() },
  { id: "CH-QAPY-003", courseId: "CRS-QAPY-001", sequence: 3, title: "CI Evidence & Quality Gates", description: "Run automated checks in CI and publish audit-friendly evidence.", contentType: "Rich Text", body: "CI quality gates should execute reliable tests, capture reports, fail on critical regressions, and expose evidence for release review.", durationMinutes: 40, minimumTimeMinutes: 25, createdAt: now(), updatedAt: now() },
];

const questionTemplates = [
  ["What is the main goal of {topic}?", ["Create reliable delivery evidence", "Avoid all documentation", "Skip validation", "Reduce team communication"], 0],
  ["Which practice improves {topic} most?", ["Stable design and clear ownership", "Random naming", "Manual-only checks", "Ignoring failures"], 0],
  ["What should be reviewed before approving {topic} work?", ["Risk, coverage, and evidence", "Only color choices", "Lunch schedule", "Browser bookmarks"], 0],
  ["Which metric best supports monitoring {topic}?", ["Completion and quality trend", "Number of meetings only", "Window size", "Keyboard brand"], 0],
  ["What is a common failure mode in {topic}?", ["Unstable data or unclear scope", "Too much evidence", "Clear ownership", "Version control"], 0],
  ["How should defects found during {topic} be handled?", ["Log with steps, evidence, and impact", "Hide until release", "Delete the test", "Rename the course"], 0],
  ["Which artifact helps audit {topic}?", ["Traceable test report", "Personal notes only", "Unlabeled screenshot", "Empty checklist"], 0],
  ["What makes {topic} maintainable?", ["Reusable patterns and readable naming", "Duplicated scripts everywhere", "Hard-coded secrets", "No review process"], 0],
  ["When should {topic} be updated?", ["When product behavior or risk changes", "Never", "Only after an outage", "Only yearly"], 0],
  ["Who benefits from clear {topic} outcomes?", ["Learners, managers, and auditors", "No one", "Only external vendors", "Only designers"], 0],
];

function makeQuestions(prefix, topic) {
  return [1, 2, 3].flatMap((setNo) => questionTemplates.map(([prompt, options, answer], index) => ({
    id: `${prefix}-Q${String((setNo - 1) * questionTemplates.length + index + 1).padStart(2, "0")}`,
    type: "MCQ",
    prompt: `${prompt.replace("{topic}", topic)} ${setNo === 1 ? "" : `(Scenario ${setNo})`}`.trim(),
    options: [...options],
    answer,
    points: 10,
  })));
}

const generatedAssessments = chapters.filter(ch => ch.id.startsWith("CH-QA-") || ch.id.startsWith("CH-PY-") || ch.id.startsWith("CH-QAPY-")).map((chapter) => ({
  id: `ASM-${chapter.id.replace("CH-", "")}`,
  title: `${chapter.title} Assessment`,
  chapterId: chapter.id,
  courseId: chapter.courseId,
  type: "MCQ",
  ownerId: "EMP-1003",
  approval: "Approved",
  difficulty: "Intermediate",
  durationMinutes: 20,
  passScore: 70,
  questionLimit: 10,
  questions: makeQuestions(`Q-${chapter.id.replace("CH-", "")}`, chapter.title),
  createdAt: now(),
  updatedAt: now(),
}));

const assessments = [
  { id: "ASM-001", title: "Threat Model Assessment", chapterId: "CH-001", courseId: "CRS-001", type: "MCQ", ownerId: "EMP-1003", approval: "Approved", durationMinutes: 15, passScore: 70, questions: [
    { id: "Q-001", type: "MCQ", prompt: "What should be documented first in a threat model?", options: ["Team lunch plan", "Assets and trust boundaries", "Marketing launch", "Sprint velocity"], answer: 1, points: 25 },
    { id: "Q-002", type: "MCQ", prompt: "Which control prevents API key exposure in production?", options: ["Manual approval", "CI secret scanning", "Quarterly email", "Post-release audit"], answer: 1, points: 25 },
  ], createdAt: now(), updatedAt: now() },
  { id: "ASM-002", title: "OWASP Knowledge Check", chapterId: "CH-002", courseId: "CRS-001", type: "MCQ", ownerId: "EMP-1003", approval: "Approved", durationMinutes: 20, passScore: 75, questions: [
    { id: "Q-003", type: "MCQ", prompt: "Which OWASP category covers injection attacks?", options: ["A01 Broken Access", "A03 Injection", "A05 Misconfiguration", "A09 Logging"], answer: 1, points: 50 },
  ], createdAt: now(), updatedAt: now() },
  { id: "ASM-003", title: "Secret Scanning Quiz", chapterId: "CH-003", courseId: "CRS-001", type: "Mixed", ownerId: "EMP-1003", approval: "Approved", durationMinutes: 15, passScore: 60, questions: [
    { id: "Q-004", type: "MCQ", prompt: "Where should secrets be stored?", options: ["Source code", "Environment variables / vault", "README file", "Slack channel"], answer: 1, points: 30 },
    { id: "Q-005", type: "Descriptive", prompt: "Describe your ideal CI/CD secret scanning setup.", points: 20 },
  ], createdAt: now(), updatedAt: now() },
  { id: "ASM-004", title: "SBI Feedback Check", chapterId: "CH-004", courseId: "CRS-002", type: "Descriptive", ownerId: "EMP-1002", approval: "Approved", durationMinutes: 20, passScore: 60, questions: [
    { id: "Q-006", type: "Descriptive", prompt: "Write a feedback note using Situation, Behavior, and Impact.", points: 50 },
  ], createdAt: now(), updatedAt: now() },
  { id: "ASM-005", title: "Coaching Assessment", chapterId: "CH-005", courseId: "CRS-002", type: "MCQ", ownerId: "EMP-1002", approval: "Pending", durationMinutes: 15, passScore: 70, questions: [
    { id: "Q-007", type: "MCQ", prompt: "What does GROW stand for?", options: ["Goal Reality Options Will", "Growth Review Outcome Work", "Guide Reflect Observe Write", "Goal Results Objectives Win"], answer: 0, points: 50 },
  ], createdAt: now(), updatedAt: now() },
  ...generatedAssessments,
];

const assignments = [
  { id: "ENR-001", courseId: "CRS-001", userId: "EMP-1004", assignedBy: "EMP-1003", dueAt: "2026-05-20", priority: "High", mandatory: true, progress: 66, completedChapters: ["CH-001", "CH-002"], timeSpentSeconds: 5040, timeSpentMinutes: 84, chapterTimeSpentSeconds: { "CH-001": 2400, "CH-002": 2640 }, completedAt: null, createdAt: now() },
  { id: "ENR-002", courseId: "CRS-002", userId: "EMP-1005", assignedBy: "EMP-1002", dueAt: "2026-05-18", priority: "Medium", mandatory: true, progress: 50, completedChapters: ["CH-004"], timeSpentSeconds: 2700, timeSpentMinutes: 45, chapterTimeSpentSeconds: { "CH-004": 2700 }, completedAt: null, createdAt: now() },
  { id: "ENR-003", courseId: "CRS-001", userId: "EMP-1002", assignedBy: "EMP-1001", dueAt: "2026-05-25", priority: "Medium", mandatory: false, progress: 33, completedChapters: ["CH-001"], timeSpentSeconds: 1800, timeSpentMinutes: 30, chapterTimeSpentSeconds: { "CH-001": 1800 }, completedAt: null, createdAt: now() },
  { id: "ENR-004", courseId: "CRS-002", userId: "EMP-1006", assignedBy: "EMP-1002", dueAt: "2026-05-10", priority: "Low", mandatory: false, progress: 100, completedChapters: ["CH-004", "CH-005"], timeSpentSeconds: 3900, timeSpentMinutes: 65, chapterTimeSpentSeconds: { "CH-004": 1800, "CH-005": 2100 }, completedAt: now(), createdAt: now() },
];

const attempts = [
  { id: "ATT-001", assessmentId: "ASM-001", chapterId: "CH-001", courseId: "CRS-001", userId: "EMP-1004", status: "Passed", score: 85, maxScore: 100, feedback: "Excellent understanding of threat modeling.", answers: { "Q-001": 1, "Q-002": 1 }, startedAt: now(), submittedAt: now(), selectedQuestionIds: ["Q-001", "Q-002"], tabSwitchWarnings: 0, autoSubmittedReason: null, flags: [], timeSpentSeconds: 340 },
  { id: "ATT-002", assessmentId: "ASM-002", chapterId: "CH-002", courseId: "CRS-001", userId: "EMP-1004", status: "Passed", score: 90, maxScore: 100, feedback: "Strong OWASP knowledge.", answers: { "Q-003": 1 }, startedAt: now(), submittedAt: now(), selectedQuestionIds: ["Q-003"], tabSwitchWarnings: 0, autoSubmittedReason: null, flags: [], timeSpentSeconds: 420 },
  { id: "ATT-003", assessmentId: "ASM-004", chapterId: "CH-004", courseId: "CRS-002", userId: "EMP-1005", status: "Passed", score: 78, maxScore: 100, feedback: "Good use of SBI framework.", answers: { "Q-006": "In yesterday's standup (S), you interrupted two team members (B), which made them hesitant to share updates (I)." }, startedAt: now(), submittedAt: now(), selectedQuestionIds: ["Q-006"], tabSwitchWarnings: 0, autoSubmittedReason: null, flags: [], timeSpentSeconds: 680 },
];

const proctoringLogs = [];
const auditLogs = [{ id: "AUD-001", actorId: "EMP-1001", action: "System initialized", entity: "SYSTEM", at: now() }];
const securityEvents = [];
const learningTimeEvents = [];
const acharyaFeedbackMemory = [];
const reportExports = [];
let settings = { fullscreenRequired: true, cameraRequired: true, microphoneRequired: true, tabSwitchAutoSubmit: true, noiseThreshold: 70, maxAssessmentFlags: 2 };

// Video progress store (temporary before PostgreSQL migration)
const videoProgress = {}; // { "userId-courseId-chapterId": { currentTime, updatedAt } }

// ── Durable persistence (PostgreSQL when DATABASE_URL is set, else JSON file) ──
const dbPath = path.resolve(__dirname, "..", "database", "db.json");
const storage = createStorage({ filePath: dbPath, databaseUrl: process.env.DATABASE_URL });

const snapshot = () => ({
  users,
  courses,
  chapters,
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
  loginSecurity,
  sessionVersions,
  issuedCertificates,
  archives,
  skills,
  targetSkills,
  skillRatings,
  chapterFeedbacks
});

const saveDb = async () => {
  await storage.save(snapshot());
};

// Coalesce concurrent save requests: while a save is running, mark a single
// follow-up so rapid mutations collapse into at most one extra write.
let saving = false;
let savePending = false;
const persist = () => {
  if (saving) { savePending = true; return; }
  saving = true;
  saveDb().finally(() => {
    saving = false;
    if (savePending) { savePending = false; persist(); }
  });
};

const loadDb = async () => {
  try {
    const data = await storage.load();
    if (!data) {
      await saveDb(); // Seed storage with the initial dataset.
      return;
    }
    if (data.users) { users.length = 0; users.push(...data.users); }
    if (data.courses) { courses.length = 0; courses.push(...data.courses); }
    if (data.chapters) { chapters.length = 0; chapters.push(...data.chapters); }
    if (data.assessments) { assessments.length = 0; assessments.push(...data.assessments); }
    if (data.assignments) { assignments.length = 0; assignments.push(...data.assignments); }
    if (data.attempts) { attempts.length = 0; attempts.push(...data.attempts); }
    if (data.proctoringLogs) { proctoringLogs.length = 0; proctoringLogs.push(...data.proctoringLogs); }
    if (data.auditLogs) { auditLogs.length = 0; auditLogs.push(...data.auditLogs); }
    if (data.securityEvents) { securityEvents.length = 0; securityEvents.push(...data.securityEvents); }
    if (data.learningTimeEvents) { learningTimeEvents.length = 0; learningTimeEvents.push(...data.learningTimeEvents); }
    if (data.acharyaFeedbackMemory) { acharyaFeedbackMemory.length = 0; acharyaFeedbackMemory.push(...data.acharyaFeedbackMemory); }
    if (data.reportExports) { reportExports.length = 0; reportExports.push(...data.reportExports); }
    if (data.settings) { Object.assign(settings, data.settings); }
    if (data.videoProgress) { Object.assign(videoProgress, data.videoProgress); }
    if (data.loginSecurity) { Object.assign(loginSecurity, data.loginSecurity); }
    if (data.sessionVersions) { Object.assign(sessionVersions, data.sessionVersions); }
    if (data.issuedCertificates) { issuedCertificates.length = 0; issuedCertificates.push(...data.issuedCertificates); }
    if (data.archives) { archives.length = 0; archives.push(...data.archives); }
    if (data.skills) { skills.length = 0; skills.push(...data.skills); }
    if (data.targetSkills) { targetSkills.length = 0; targetSkills.push(...data.targetSkills); }
    if (data.skillRatings) { skillRatings.length = 0; skillRatings.push(...data.skillRatings); }
    if (data.chapterFeedbacks) { chapterFeedbacks.length = 0; chapterFeedbacks.push(...data.chapterFeedbacks); }
  } catch (err) {
    console.error("[persist] load failed:", err?.message || err);
    throw err;
  }
};

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
