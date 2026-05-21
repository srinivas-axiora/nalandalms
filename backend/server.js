import express from "express";
import cors from "cors";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import cookieParser from "cookie-parser";
import { GoogleGenAI } from "@google/genai";
import { loadEnvFile } from "node:process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 * 500 } });
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-me";
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

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// ── CSRF token store (server-side validated) ──
const csrfTokens = new Set();

const verifyCsrf = (req, res, next) => {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") return next();
  const tokenFromHeader = req.headers["x-csrf-token"];
  if (!tokenFromHeader || !csrfTokens.has(tokenFromHeader)) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }
  next();
};
app.use(verifyCsrf);

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

const rolePassword = (role) => {
  if (role === "Super Admin") return "Sadmin@2026";
  if (role === "Admin") return "Admin@2026";
  if (role === "Manager") return "Passwrod@2026";
  return "Password@123";
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

const courses = [
  { id: "NLD-SC-2048", title: "Secure Coding for Cloud Teams", description: "Threat modeling, OWASP controls, and secure release patterns.", skill: "Security", tags: ["OWASP", "Cloud"], contentTypes: ["PDF", "Rich Text", "Video Link"], approval: "Approved", status: "Active", ownerId: "EMP-1001", version: 3, createdAt: now(), updatedAt: now() },
  { id: "NLD-LD-1130", title: "Manager Essentials: Feedback Systems", description: "Coaching rituals and measurable development plans.", skill: "Leadership", tags: ["People", "Coaching"], contentTypes: ["Rich Text", "Uploaded Video"], approval: "Pending", status: "Active", ownerId: "EMP-1002", version: 1, createdAt: now(), updatedAt: now() },
];

const chapters = [
  { id: "CH-SC-001", courseId: "NLD-SC-2048", sequence: 1, title: "Threat Model Primer", description: "Identify assets, actors, and trust boundaries.", contentType: "Rich Text", body: "A threat model identifies assets, actors, trust boundaries, and failure modes before a release.", durationMinutes: 25, minimumTimeMinutes: 15, createdAt: now(), updatedAt: now() },
  { id: "CH-SC-002", courseId: "NLD-SC-2048", sequence: 2, title: "OWASP Controls", description: "Apply OWASP controls to common cloud application risks.", contentType: "PDF", body: "Map OWASP risks to release controls and validation evidence.", fileName: "owasp-controls.pdf", durationMinutes: 35, minimumTimeMinutes: 25, createdAt: now(), updatedAt: now() },
  { id: "CH-LD-001", courseId: "NLD-LD-1130", sequence: 1, title: "SBI Feedback Method", description: "Practice feedback using Situation, Behavior, and Impact.", contentType: "Rich Text", body: "Use SBI to make feedback observable, specific, and actionable.", durationMinutes: 20, minimumTimeMinutes: 12, createdAt: now(), updatedAt: now() },
];

const assessments = [
  { id: "ASM-9001", title: "Secure Release Readiness", courseId: "NLD-SC-2048", chapterId: "CH-SC-001", type: "Timed Quiz", approval: "Approved", strictMode: true, questions: [{ id: "Q1", type: "MCQ", prompt: "Best control for leaked API key prevention?", options: ["Manual approval", "CI secret scanning", "Newsletter", "Post audit"], answer: 1, points: 100 }], durationMinutes: 45, passScore: 80, ownerId: "EMP-1001", createdAt: now(), updatedAt: now() },
  { id: "ASM-9038", title: "Feedback Scenario Review", courseId: "NLD-LD-1130", chapterId: "CH-LD-001", type: "Descriptive", approval: "Pending", strictMode: true, questions: [{ id: "Q1", type: "Descriptive", prompt: "Write feedback for a missed target using SBI.", points: 100 }], durationMinutes: 60, passScore: 70, ownerId: "EMP-1002", createdAt: now(), updatedAt: now() },
];

const assignments = [
  { id: uuid(), courseId: "NLD-SC-2048", userId: "EMP-1004", assignedBy: "EMP-1003", progress: 76, timeSpentSeconds: 11200, timeSpentMinutes: 187, chapterTimeSpentSeconds: { "CH-SC-001": 5400, "CH-SC-002": 4200 }, completedChapters: ["CH-SC-001"], completedAt: null, createdAt: now() },
];

const attempts = [];
const proctoringLogs = [];
const auditLogs = [];
const learningTimeEvents = [];
const acharyaFeedbackMemory = [];
const reportExports = [];
let settings = { fullscreenRequired: true, cameraRequired: true, microphoneRequired: true, tabSwitchAutoSubmit: true, noiseThreshold: 70, maxAssessmentFlags: 2 };

// Video progress store (temporary before PostgreSQL migration)
const videoProgress = {}; // { "userId-courseId-chapterId": { currentTime, updatedAt } }

const publicUser = (user) => {
  const { passwordHash, ...safe } = user;
  const sessionVersion = sessionVersions[user.id] || 0;
  return { ...safe, sessionVersion, sv: sessionVersion };
};

const audit = (actorId, action, entityType, entityId, metadata = {}) => {
  auditLogs.unshift({ id: uuid(), actorId, action, entityType, entityId, metadata, createdAt: now() });
};

const signToken = (user) => {
  const sv = sessionVersions[user.id] || 0;
  return jwt.sign({ sub: user.id, role: user.role, department: user.department, sv }, JWT_SECRET, { expiresIn: "30m" });
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

app.get("/api/health", (_req, res) => {
  const apiKey = getGeminiApiKey();
  res.json({ ok: true, service: "Nalanda API", time: now(), geminiConfigured: Boolean(apiKey), geminiModel: GEMINI_MODEL });
});

app.get("/api/csrf-token", (req, res) => {
  const token = uuid();
  csrfTokens.add(token);
  // Cleanup: keep set from growing unbounded (max 1000 tokens)
  if (csrfTokens.size > 1000) {
    const first = csrfTokens.values().next().value;
    csrfTokens.delete(first);
  }
  res.json({ csrfToken: token });
});

app.post("/api/auth/login", (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  if (rateLimitCheck(ip, "/api/auth/login")) {
    return res.status(429).json({ error: "Too many login attempts. Please try again later." });
  }
  rateLimitRecord(ip, "/api/auth/login");

  const schema = z.object({ email: z.string().min(2), password: z.string().min(8) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const identifier = parsed.data.email.trim();
  const normalizedIdentifier = identifier.toLowerCase();
  const security = loginSecurity[identifier] || { failedAttempts: 0, lockedUntil: null, lastFailedAt: null };

  if (security.lockedUntil && new Date(security.lockedUntil).getTime() > Date.now()) {
    return res.status(403).json({ error: "Account locked due to too many failed attempts", lockedUntil: security.lockedUntil });
  }

  const user = users.find((item) => (
    item.email.toLowerCase() === normalizedIdentifier
    || (item.role === "Super Admin" && normalizedIdentifier === "super admin")
  ) && item.status === "Active");
  if (!user || !bcrypt.compareSync(parsed.data.password, user.passwordHash)) {
    security.failedAttempts += 1;
    security.lastFailedAt = now();
    if (security.failedAttempts >= MAX_LOGIN_ATTEMPTS) {
      security.lockedUntil = new Date(Date.now() + LOCKOUT_MS).toISOString();
    }
    loginSecurity[identifier] = security;
    return res.status(401).json({ error: "Invalid credentials", failedAttempts: security.failedAttempts, lockedUntil: security.lockedUntil });
  }

  loginSecurity[identifier] = { failedAttempts: 0, lockedUntil: null, lastFailedAt: null };
  audit(user.id, "LOGIN", "USER", user.id);
  res.cookie("token", signToken(user), { httpOnly: true, secure: false, sameSite: "lax", maxAge: 30 * 60 * 1000 });
  return res.json({ user: publicUser(user) });
});

app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie("token");
  res.clearCookie("csrfToken");
  res.json({ ok: true });
});

app.get("/api/auth/me", authenticate, (req, res) => {
  res.json({ user: publicUser(req.user), permissions: req.user.role });
});

app.get("/api/users", authenticate, requireRole("Admin", "Manager"), (req, res) => {
  const { department, role, status = "Active" } = req.query;
  let visible = isAdmin(req.user.role) ? users : users.filter((user) => user.managerId === req.user.id || user.id === req.user.id);
  if (department) visible = visible.filter((user) => user.department === department);
  if (role) visible = visible.filter((user) => user.role === role);
  if (status !== "All") visible = visible.filter((user) => user.status === status);
  res.json({ data: visible.map(publicUser), total: visible.length });
});

app.post("/api/users", authenticate, requireRole("Admin"), (req, res) => {
  const schema = z.object({
    id: z.string().min(2).optional(),
    name: z.string().min(2),
    email: z.string().email(),
    department: z.string().min(2),
    team: z.string().min(2).optional(),
    designation: z.string().min(2).optional(),
    role: z.enum(roles),
    managerId: z.string().nullable().optional(),
    status: z.enum(["Active", "Inactive"]).optional(),
    joinedAt: z.string().optional(),
    password: z.string().min(8)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const requestedId = parsed.data.id || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
  if (users.some((item) => item.id === requestedId || item.email === parsed.data.email)) {
    return res.status(409).json({ error: "User ID or email already exists" });
  }
  const user = { id: requestedId, ...parsed.data, status: parsed.data.status || "Active", passwordHash: bcrypt.hashSync(parsed.data.password, 10), createdAt: now() };
  delete user.password;
  users.push(user);
  audit(req.user.id, "CREATE_USER", "USER", user.id, { role: user.role });
  res.status(201).json({ data: publicUser(user) });
});

app.patch("/api/users/:id", authenticate, requireRole("Admin"), (req, res) => {
  const schema = z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    department: z.string().min(2).optional(),
    team: z.string().min(2).optional(),
    designation: z.string().min(2).optional(),
    role: z.enum(roles).optional(),
    managerId: z.string().nullable().optional(),
    status: z.enum(["Active", "Inactive"]).optional(),
    joinedAt: z.string().optional(),
    password: z.string().min(8).optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const user = users.find((item) => item.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  
  if (parsed.data.status === "Inactive" && user.status === "Active") {
    sessionVersions[user.id] = (sessionVersions[user.id] || 0) + 1;
  }
  
  const patch = { ...parsed.data };
  if (patch.password) {
    patch.passwordHash = bcrypt.hashSync(patch.password, 10);
    delete patch.password;
  }
  Object.assign(user, patch);
  audit(req.user.id, "UPDATE_USER", "USER", user.id, patch);
  res.json({ data: publicUser(user) });
});

app.patch("/api/users/:id/status", authenticate, requireRole("Admin"), (req, res) => {
  const schema = z.object({ status: z.enum(["Active", "Inactive"]) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const user = users.find((item) => item.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  
  if (parsed.data.status === "Inactive" && user.status === "Active") {
    sessionVersions[user.id] = (sessionVersions[user.id] || 0) + 1;
  }
  user.status = parsed.data.status;
  
  audit(req.user.id, "CHANGE_USER_STATUS", "USER", user.id, parsed.data);
  res.json({ data: publicUser(user), note: "Session revoked if inactivated." });
});

app.delete("/api/users/:id", authenticate, requireRole("Super Admin"), (req, res) => {
  const schema = z.object({ deletionComment: z.string().min(10) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  
  const idx = users.findIndex((item) => item.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "User not found" });
  const user = users[idx];
  
  // Revoke session
  sessionVersions[user.id] = (sessionVersions[user.id] || 0) + 1;
  
  archives.unshift({
    id: uuid(),
    entityType: "User",
    entityId: user.id,
    entityData: user,
    deletedBy: req.user.id,
    deletedByName: req.user.name,
    deletionComment: parsed.data.deletionComment,
    deletedAt: now()
  });
  
  users.splice(idx, 1);
  audit(req.user.id, "DELETE_USER", "USER", user.id);
  res.json({ success: true, message: "User permanently deleted and archived" });
});

app.get("/api/courses", authenticate, (req, res) => {
  const { skill, approval, status = "Active" } = req.query;
  let visible = courses;
  if (req.user.role === "Manager") visible = visible.filter((course) => course.ownerId === req.user.id || course.approval === "Approved");
  if (req.user.role === "Employee") visible = visible.filter((course) => course.approval === "Approved" && course.status === "Active");
  if (skill) visible = visible.filter((course) => course.skill === skill);
  if (approval) visible = visible.filter((course) => course.approval === approval);
  if (status !== "All") visible = visible.filter((course) => course.status === status);
  res.json({ data: visible, total: visible.length });
});

app.post("/api/courses", authenticate, requireRole("Admin", "Manager"), upload.fields([{ name: "pdf" }, { name: "video" }]), (req, res) => {
  const body = typeof req.body.payload === "string" ? JSON.parse(req.body.payload) : req.body;
  const schema = z.object({ title: z.string().min(4), description: z.string().min(10), skill: z.string().min(2), tags: z.array(z.string()).default([]), contentTypes: z.array(z.string()).default(["Rich Text"]) });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const course = { id: nextCourseId(parsed.data.skill), ...parsed.data, approval: req.user.role === "Admin" ? "Approved" : "Pending", status: "Active", ownerId: req.user.id, version: 1, createdAt: now(), updatedAt: now(), storage: { files: Object.keys(req.files || {}) } };
  courses.unshift(course);
  audit(req.user.id, "CREATE_COURSE", "COURSE", course.id, { approval: course.approval });
  res.status(201).json({ data: course });
});

app.put("/api/courses/:id", authenticate, requireRole("Admin", "Manager"), (req, res) => {
  const course = courses.find((item) => item.id === req.params.id);
  if (!course) return res.status(404).json({ error: "Course not found" });
  if (!canManageCourse(req.user, course)) return res.status(403).json({ error: "Forbidden" });
  Object.assign(course, req.body, { version: course.version + 1, approval: req.user.role === "Admin" ? "Approved" : "Pending", updatedAt: now() });
  audit(req.user.id, "UPDATE_COURSE", "COURSE", course.id, { version: course.version });
  res.json({ data: course });
});

app.post("/api/courses/:id/duplicate", authenticate, requireRole("Admin", "Manager"), (req, res) => {
  const source = courses.find((item) => item.id === req.params.id);
  if (!source) return res.status(404).json({ error: "Course not found" });
  const copy = { ...source, id: nextCourseId(source.skill), title: `${source.title} Copy`, approval: req.user.role === "Admin" ? "Approved" : "Pending", ownerId: req.user.id, version: 1, createdAt: now(), updatedAt: now() };
  courses.unshift(copy);
  audit(req.user.id, "DUPLICATE_COURSE", "COURSE", copy.id, { sourceId: source.id });
  res.status(201).json({ data: copy });
});

app.patch("/api/courses/:id/approval", authenticate, requireRole("Admin"), (req, res) => {
  const schema = z.object({ approval: z.enum(["Approved", "Rejected"]), reason: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const course = courses.find((item) => item.id === req.params.id);
  if (!course) return res.status(404).json({ error: "Course not found" });
  course.approval = parsed.data.approval;
  if (parsed.data.approval === "Rejected") course.status = "Inactive";
  audit(req.user.id, "COURSE_APPROVAL", "COURSE", course.id, parsed.data);
  res.json({ data: course });
});

app.patch("/api/courses/:id/status", authenticate, requireRole("Admin"), (req, res) => {
  const schema = z.object({ status: z.enum(["Active", "Inactive"]) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const course = courses.find((item) => item.id === req.params.id);
  if (!course) return res.status(404).json({ error: "Course not found" });
  course.status = parsed.data.status;
  audit(req.user.id, "COURSE_STATUS", "COURSE", course.id, parsed.data);
  res.json({ data: course });
});

app.get("/api/courses/:courseId/chapters", authenticate, (req, res) => {
  const course = courses.find((item) => item.id === req.params.courseId);
  if (!course) return res.status(404).json({ error: "Course not found" });
  if (req.user.role === "Employee" && (course.approval !== "Approved" || course.status !== "Active")) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const data = chapters
    .filter((chapter) => chapter.courseId === req.params.courseId)
    .sort((a, b) => a.sequence - b.sequence);
  res.json({ data, total: data.length });
});

app.post("/api/courses/:courseId/chapters", authenticate, requireRole("Admin", "Manager"), (req, res) => {
  const course = courses.find((item) => item.id === req.params.courseId);
  if (!course) return res.status(404).json({ error: "Course not found" });
  if (!canManageCourse(req.user, course)) return res.status(403).json({ error: "Forbidden" });

  const schema = z.object({
    id: z.string().min(2).optional(),
    sequence: z.coerce.number().int().positive().optional(),
    title: z.string().min(2),
    description: z.string().default(""),
    contentType: z.enum(["Rich Text", "PDF", "Video Link"]).default("Rich Text"),
    body: z.string().default(""),
    url: z.string().optional(),
    fileName: z.string().optional(),
    durationMinutes: z.coerce.number().int().min(0).default(10),
    minimumTimeMinutes: z.coerce.number().int().min(0).optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const courseChapters = chapters.filter((chapter) => chapter.courseId === course.id);
  const chapter = {
    id: parsed.data.id || `CH-${Math.floor(1000 + Math.random() * 9000)}`,
    courseId: course.id,
    sequence: parsed.data.sequence || courseChapters.length + 1,
    title: parsed.data.title,
    description: parsed.data.description,
    contentType: parsed.data.contentType,
    body: parsed.data.body,
    url: parsed.data.url,
    fileName: parsed.data.fileName,
    durationMinutes: parsed.data.durationMinutes,
    minimumTimeMinutes: parsed.data.minimumTimeMinutes ?? parsed.data.durationMinutes ?? 1,
    createdAt: now(),
    updatedAt: now()
  };

  if (chapters.some((item) => item.id === chapter.id)) return res.status(409).json({ error: "Chapter ID already exists" });
  chapters.push(chapter);
  course.updatedAt = now();
  audit(req.user.id, "CREATE_CHAPTER", "CHAPTER", chapter.id, { courseId: course.id, minimumTimeMinutes: chapter.minimumTimeMinutes });
  res.status(201).json({ data: chapter });
});

app.put("/api/courses/:courseId/chapters/:chapterId", authenticate, requireRole("Admin", "Manager"), (req, res) => {
  const course = courses.find((item) => item.id === req.params.courseId);
  if (!course) return res.status(404).json({ error: "Course not found" });
  if (!canManageCourse(req.user, course)) return res.status(403).json({ error: "Forbidden" });
  const chapter = chapters.find((item) => item.id === req.params.chapterId && item.courseId === course.id);
  if (!chapter) return res.status(404).json({ error: "Chapter not found" });

  const schema = z.object({
    sequence: z.coerce.number().int().positive().optional(),
    title: z.string().min(2).optional(),
    description: z.string().optional(),
    contentType: z.enum(["Rich Text", "PDF", "Video Link"]).optional(),
    body: z.string().optional(),
    url: z.string().nullable().optional(),
    fileName: z.string().nullable().optional(),
    durationMinutes: z.coerce.number().int().min(0).optional(),
    minimumTimeMinutes: z.coerce.number().int().min(0).optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  Object.assign(chapter, parsed.data, { updatedAt: now() });
  course.updatedAt = now();
  audit(req.user.id, "UPDATE_CHAPTER", "CHAPTER", chapter.id, parsed.data);
  res.json({ data: chapter });
});

app.post("/api/assignments", authenticate, requireRole("Admin", "Manager"), (req, res) => {
  const schema = z.object({ courseId: z.string(), userIds: z.array(z.string()).min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const created = parsed.data.userIds.map((userId) => ({ id: uuid(), courseId: parsed.data.courseId, userId, assignedBy: req.user.id, progress: 0, completedChapters: [], timeSpentMinutes: 0, timeSpentSeconds: 0, chapterTimeSpentSeconds: {}, completedAt: null, createdAt: now() }));
  assignments.push(...created);
  audit(req.user.id, "ASSIGN_COURSE", "COURSE", parsed.data.courseId, { count: created.length });
  res.status(201).json({ data: created });
});

app.get("/api/assessments", authenticate, (req, res) => {
  let visible = assessments;
  if (req.user.role === "Manager") visible = visible.filter((item) => item.ownerId === req.user.id || item.approval === "Approved");
  if (req.user.role === "Employee") visible = visible.filter((item) => item.approval === "Approved");
  res.json({ data: visible, total: visible.length });
});

app.post("/api/assessments", authenticate, requireRole("Admin", "Manager"), (req, res) => {
  const schema = z.object({
    title: z.string().min(4),
    courseId: z.string(),
    chapterId: z.string().optional(),
    type: z.enum(["MCQ", "Descriptive", "Timed Quiz", "Mixed"]),
    strictMode: z.boolean().default(true),
    questions: z.array(z.record(z.string(), z.any())).min(1),
    durationMinutes: z.coerce.number().min(1),
    passScore: z.coerce.number().min(1).max(100),
    questionLimit: z.coerce.number().int().positive().optional(),
    difficulty: z.string().optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const course = courses.find((item) => item.id === parsed.data.courseId);
  if (!course) return res.status(404).json({ error: "Course not found" });
  if (!canManageCourse(req.user, course)) return res.status(403).json({ error: "Forbidden" });
  if (parsed.data.chapterId && !chapters.some((item) => item.id === parsed.data.chapterId && item.courseId === parsed.data.courseId)) {
    return res.status(400).json({ error: "Chapter does not belong to course" });
  }

  const assessment = { id: `ASM-${Math.floor(1000 + Math.random() * 9000)}`, ...parsed.data, approval: req.user.role === "Admin" ? "Approved" : "Pending", status: "Active", ownerId: req.user.id, createdAt: now(), updatedAt: now() };
  assessments.unshift(assessment);
  audit(req.user.id, "CREATE_ASSESSMENT", "ASSESSMENT", assessment.id, { approval: assessment.approval });
  res.status(201).json({ data: assessment });
});

app.patch("/api/assessments/:id/approval", authenticate, requireRole("Admin"), (req, res) => {
  const schema = z.object({ approval: z.enum(["Approved", "Rejected"]), feedback: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const assessment = assessments.find((item) => item.id === req.params.id);
  if (!assessment) return res.status(404).json({ error: "Assessment not found" });
  assessment.approval = parsed.data.approval;
  audit(req.user.id, "ASSESSMENT_APPROVAL", "ASSESSMENT", assessment.id, parsed.data);
  res.json({ data: assessment });
});

app.post("/api/assessments/:id/attempts/start", authenticate, requireRole("Employee", "Manager", "Admin"), (req, res) => {
  const assessment = assessments.find((item) => item.id === req.params.id && item.approval === "Approved");
  if (!assessment) return res.status(404).json({ error: "Approved assessment not found" });
  const attempt = { id: uuid(), assessmentId: assessment.id, courseId: assessment.courseId, chapterId: assessment.chapterId || null, userId: req.user.id, startedAt: now(), submittedAt: null, status: "InProgress", score: null, maxScore: questionPointsTotal(assessment), feedback: "", answers: {}, selectedQuestionIds: [], tabSwitchWarnings: 0, autoSubmittedReason: null, timeSpentSeconds: 0, flags: [] };
  attempts.unshift(attempt);
  audit(req.user.id, "START_ATTEMPT", "ASSESSMENT_ATTEMPT", attempt.id);
  res.status(201).json({ data: attempt, strictRules: assessment.strictMode ? settings : null });
});

app.post("/api/assessments/attempts/:attemptId/submit", authenticate, (req, res) => {
  const schema = z.object({
    answers: z.record(z.string(), z.any()).default({}),
    selectedQuestionIds: z.array(z.string()).optional(),
    tabSwitchWarnings: z.coerce.number().int().min(0).optional(),
    autoSubmittedReason: z.string().nullable().optional(),
    timeSpentSeconds: z.coerce.number().int().min(0).optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const attempt = attempts.find((item) => item.id === req.params.attemptId && item.userId === req.user.id);
  if (!attempt) return res.status(404).json({ error: "Attempt not found" });
  if (attempt.submittedAt) return res.status(409).json({ error: "Attempt already submitted", data: attempt });
  const assessment = assessments.find((item) => item.id === attempt.assessmentId);
  if (!assessment) return res.status(404).json({ error: "Assessment not found" });
  const mcqQuestions = assessment.questions.filter((question) => question.type === "MCQ");
  const mcqScore = mcqQuestions.length ? Math.round((mcqQuestions.filter((question) => parsed.data.answers?.[question.id] === question.answer).length / mcqQuestions.length) * 100) : null;
  const submittedAt = now();
  const elapsedSeconds = Math.max(1, Math.round((new Date(submittedAt).getTime() - new Date(attempt.startedAt).getTime()) / 1000));
  const timeSpentSeconds = parsed.data.timeSpentSeconds || elapsedSeconds;
  Object.assign(attempt, {
    answers: parsed.data.answers,
    selectedQuestionIds: parsed.data.selectedQuestionIds || attempt.selectedQuestionIds || [],
    tabSwitchWarnings: parsed.data.tabSwitchWarnings ?? attempt.tabSwitchWarnings ?? 0,
    autoSubmittedReason: parsed.data.autoSubmittedReason ?? null,
    submittedAt,
    status: mcqScore === null ? "PendingManualReview" : "Submitted",
    score: mcqScore,
    maxScore: questionPointsTotal(assessment),
    feedback: mcqScore === null ? "Manual evaluation required" : mcqScore >= assessment.passScore ? "Passed" : "Needs improvement",
    timeSpentSeconds
  });
  const assignment = addAssessmentTime({ attempt, assessment, seconds: timeSpentSeconds });
  audit(req.user.id, "SUBMIT_ATTEMPT", "ASSESSMENT_ATTEMPT", attempt.id, { score: mcqScore, timeSpentSeconds });
  res.json({ data: attempt, feedback: mcqScore === null ? "Manual evaluation required" : mcqScore >= assessment.passScore ? "Passed" : "Needs improvement" });
});

app.post("/api/proctoring/events", authenticate, (req, res) => {
  const schema = z.object({ attemptId: z.string(), eventType: z.enum(["FULLSCREEN_EXIT", "TAB_SWITCH", "NOISE", "CAMERA_OFF", "MIC_OFF", "FACE_MISMATCH"]), severity: z.enum(["low", "medium", "high"]), metadata: z.record(z.string(), z.any()).optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const event = { id: uuid(), userId: req.user.id, ...parsed.data, createdAt: now() };
  proctoringLogs.unshift(event);
  const attempt = attempts.find((item) => item.id === parsed.data.attemptId);
  if (attempt) attempt.flags.push(event);
  if (settings.tabSwitchAutoSubmit && parsed.data.eventType === "TAB_SWITCH" && attempt && !attempt.submittedAt) {
    const assessment = assessments.find((item) => item.id === attempt.assessmentId);
    const submittedAt = now();
    const timeSpentSeconds = Math.max(1, Math.round((new Date(submittedAt).getTime() - new Date(attempt.startedAt).getTime()) / 1000));
    Object.assign(attempt, { status: "AutoSubmitted", submittedAt, autoSubmittedReason: "TAB_SWITCH", timeSpentSeconds });
    addAssessmentTime({ attempt, assessment, seconds: timeSpentSeconds });
  }
  audit(req.user.id, "PROCTORING_EVENT", "PROCTORING_LOG", event.id, { eventType: event.eventType });
  res.status(201).json({ data: event, autoSubmitted: attempt?.status === "AutoSubmitted" });
});

app.get("/api/analytics/global", authenticate, requireRole("Admin"), (_req, res) => {
  res.json({ users: users.length, activeUsers: users.filter((user) => user.status === "Active").length, courses: courses.length, approvedCourses: courses.filter((course) => course.approval === "Approved").length, completionRate: 78, averageScore: 86, topPerformers: ["Diya Sharma", "Nisha Rao"], lowPerformers: ["Rohan Das"] });
});

app.get("/api/analytics/team", authenticate, requireRole("Manager"), (req, res) => {
  const team = users.filter((user) => user.managerId === req.user.id);
  res.json({ managerId: req.user.id, members: team.map(publicUser), completionRate: 74, skillGaps: ["Secure coding", "Data storytelling"], engagement: "Medium-high" });
});

app.get("/api/analytics/me", authenticate, (req, res) => {
  res.json({ userId: req.user.id, progress: 76, completedCourses: 9, pendingCourses: 3, strengths: ["Communication", "Compliance"], weaknesses: ["Secure coding"], suggestions: ["Complete Secure Coding for Cloud Teams", "Retake practice quiz"] });
});

app.post("/api/reports/export", authenticate, requireRole("Admin", "Manager"), (req, res) => {
  const schema = z.object({ format: z.enum(["PDF", "Excel"]), reportType: z.enum(["User", "Team", "Course"]), filters: z.record(z.string(), z.any()).default({}) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const rows = buildReportRows({ reportType: parsed.data.reportType, filters: parsed.data.filters, requester: req.user });
  const summary = rows.reduce((acc, row) => ({
    chapterTimeSeconds: acc.chapterTimeSeconds + (row.chapterTimeSeconds || 0),
    assessmentTimeSeconds: acc.assessmentTimeSeconds + (row.assessmentTimeSeconds || 0),
    courseTimeSeconds: acc.courseTimeSeconds + (row.courseTimeSeconds || 0)
  }), { chapterTimeSeconds: 0, assessmentTimeSeconds: 0, courseTimeSeconds: 0 });
  const report = { id: uuid(), requestedBy: req.user.id, status: "Ready", downloadUrl: `/exports/${uuid()}.${parsed.data.format === "PDF" ? "pdf" : "xlsx"}`, ...parsed.data, rowCount: rows.length, rows, summary, createdAt: now() };
  reportExports.unshift(report);
  audit(req.user.id, "EXPORT_REPORT", "REPORT", report.id, parsed.data);
  res.status(202).json({ data: report });
});

app.get("/api/certificates", authenticate, (req, res) => {
  let visible = issuedCertificates;
  if (req.user.role === "Manager") {
    const teamIds = new Set(users.filter((u) => u.managerId === req.user.id).map((u) => u.id));
    visible = visible.filter((cert) => cert.employeeId === req.user.id || teamIds.has(cert.employeeId));
  } else if (req.user.role === "Employee") {
    visible = visible.filter((cert) => cert.employeeId === req.user.id);
  }
  res.json({ data: visible, total: visible.length });
});

app.post("/api/certificates", authenticate, requireRole("Admin"), (req, res) => {
  const schema = z.object({ employeeId: z.string(), courseId: z.string(), title: z.string().default("Certificate of Completion"), template: z.string().default("Executive"), accent: z.string().default("#0f766e"), duration: z.string().default(""), subtitle: z.string().default(""), footer: z.string().default(""), htmlSnapshot: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  
  const employee = users.find((u) => u.id === parsed.data.employeeId);
  const course = courses.find((c) => c.id === parsed.data.courseId);
  if (!employee || !course) return res.status(404).json({ error: "Employee or Course not found" });

  const cert = { id: `CERT-${Math.floor(1000 + Math.random() * 9000)}`, ...parsed.data, issuedBy: req.user.id, issuedByName: req.user.name, issuedAt: now() };
  issuedCertificates.unshift(cert);
  audit(req.user.id, "ISSUE_CERTIFICATE", "CERTIFICATE", cert.id, { employeeId: cert.employeeId, courseId: cert.courseId });
  res.status(201).json({ data: cert });
});

app.get("/api/archive", authenticate, requireRole("Super Admin"), (req, res) => {
  res.json({ data: archives, total: archives.length });
});

app.post("/api/archive/:id/restore", authenticate, requireRole("Super Admin"), (req, res) => {
  const idx = archives.findIndex((item) => item.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Archived record not found" });
  
  const record = archives[idx];
  if (record.entityType === "User") users.unshift(record.entityData);
  else if (record.entityType === "Course") courses.unshift(record.entityData);
  else if (record.entityType === "Assessment") assessments.unshift(record.entityData);

  archives.splice(idx, 1);
  audit(req.user.id, "RESTORE_ARCHIVE", record.entityType.toUpperCase(), record.entityId);
  res.json({ success: true, message: `${record.entityType} restored` });
});

app.get("/api/settings", authenticate, requireRole("Admin"), (_req, res) => {
  res.json({ data: settings });
});

app.patch("/api/settings", authenticate, requireRole("Admin"), (req, res) => {
  const schema = z.object({ fullscreenRequired: z.boolean().optional(), cameraRequired: z.boolean().optional(), microphoneRequired: z.boolean().optional(), tabSwitchAutoSubmit: z.boolean().optional(), noiseThreshold: z.number().min(1).max(100).optional(), maxAssessmentFlags: z.number().min(0).optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  settings = { ...settings, ...parsed.data };
  audit(req.user.id, "UPDATE_SETTINGS", "SETTINGS", "proctoring", parsed.data);
  res.json({ data: settings });
});

app.get("/api/audit-logs", authenticate, requireRole("Admin"), (req, res) => {
  const limit = Math.min(Number(req.query.limit || 50), 200);
  res.json({ data: auditLogs.slice(0, limit), total: auditLogs.length });
});

// ── Video Progress Endpoints ──

app.post("/api/courses/:courseId/chapters/:chapterId/progress", authenticate, (req, res) => {
  const { currentTime } = req.body;
  if (typeof currentTime !== "number") return res.status(400).json({ error: "Invalid currentTime" });
  
  const key = `${req.user.id}-${req.params.courseId}-${req.params.chapterId}`;
  videoProgress[key] = { currentTime, updatedAt: now() };
  
  res.json({ ok: true, currentTime });
});

app.post("/api/courses/:courseId/chapters/:chapterId/time", authenticate, (req, res) => {
  const schema = z.object({ seconds: z.number().int().positive() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const course = courses.find((item) => item.id === req.params.courseId);
  if (!course) return res.status(404).json({ error: "Course not found" });
  const chapter = chapters.find((item) => item.id === req.params.chapterId && item.courseId === req.params.courseId);
  if (!chapter) return res.status(404).json({ error: "Chapter not found" });

  const assignment = addChapterTime({ courseId: req.params.courseId, chapterId: req.params.chapterId, userId: req.user.id, seconds: parsed.data.seconds });
  const chapterTimeSeconds = chapterTimeFor(assignment, req.params.chapterId);
  const minimumTimeSeconds = Math.max(0, Math.round((chapter.minimumTimeMinutes || 0) * 60));

  res.json({
    ok: true,
    data: assignment,
    totals: {
      chapterId: req.params.chapterId,
      chapterTimeSeconds,
      minimumTimeSeconds,
      minimumTimeMet: chapterTimeSeconds >= minimumTimeSeconds,
      assessmentTimeSeconds: assessmentTimeFor({ userId: req.user.id, courseId: req.params.courseId, chapterId: req.params.chapterId }),
      courseTimeSeconds: assignment.timeSpentSeconds || 0
    }
  });
});

app.get("/api/analytics/time", authenticate, requireRole("Admin", "Manager"), (req, res) => {
  const rows = buildTimeRows(req.user);
  const summary = rows.reduce((acc, row) => ({
    chapterTimeSeconds: acc.chapterTimeSeconds + (row.chapterTimeSeconds || 0),
    assessmentTimeSeconds: acc.assessmentTimeSeconds + (row.assessmentTimeSeconds || 0),
    courseTimeSeconds: acc.courseTimeSeconds + (row.courseTimeSeconds || 0)
  }), { chapterTimeSeconds: 0, assessmentTimeSeconds: 0, courseTimeSeconds: 0 });
  res.json({
    data: rows,
    total: rows.length,
    eventCount: learningTimeEvents.filter((event) => visibleUserIdsFor(req.user).includes(event.userId)).length,
    summary
  });
});

app.get("/api/analytics/time/events", authenticate, requireRole("Admin", "Manager"), (req, res) => {
  const visibleUserIds = visibleUserIdsFor(req.user);
  const limit = Math.min(Number(req.query.limit || 100), 500);
  const data = learningTimeEvents.filter((event) => visibleUserIds.includes(event.userId)).slice(0, limit);
  res.json({ data, total: data.length });
});

app.get("/api/ai/generation-feedback", authenticate, requireRole("Admin", "Manager"), (req, res) => {
  res.json({ data: acharyaFeedbackMemory.slice(0, 25) });
});

app.post("/api/ai/generation-feedback", authenticate, requireRole("Admin", "Manager"), (req, res) => {
  const schema = z.object({
    skillName: z.string().min(1).default("General"),
    courseLevel: z.string().min(1).default("Beginner"),
    feedbackType: z.enum(["Course", "Chapter", "Assessment", "Overall"]).default("Overall"),
    rating: z.number().min(1).max(5).default(3),
    comment: z.string().min(10).max(1200),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const item = {
    id: uuid(),
    ...parsed.data,
    createdBy: req.user.id,
    createdAt: now(),
  };
  acharyaFeedbackMemory.unshift(item);
  if (acharyaFeedbackMemory.length > 100) acharyaFeedbackMemory.length = 100;
  saveAcharyaFeedbackMemory();
  audit(req.user.id, "ACHARYA_FEEDBACK", "ACHARYA", item.id, { feedbackType: item.feedbackType, rating: item.rating });
  return res.status(201).json({ data: item });
});

app.get("/api/courses/:courseId/chapters/:chapterId/progress", authenticate, (req, res) => {
  const key = `${req.user.id}-${req.params.courseId}-${req.params.chapterId}`;
  const record = videoProgress[key];
  const assignment = assignments.find((item) => item.courseId === req.params.courseId && item.userId === req.user.id);
  const chapter = chapters.find((item) => item.id === req.params.chapterId && item.courseId === req.params.courseId);
  const chapterTimeSeconds = assignment ? chapterTimeFor(assignment, req.params.chapterId) : 0;
  const minimumTimeSeconds = Math.max(0, Math.round((chapter?.minimumTimeMinutes || 0) * 60));
  res.json({
    currentTime: record ? record.currentTime : 0,
    chapterTimeSeconds,
    minimumTimeSeconds,
    minimumTimeMet: chapterTimeSeconds >= minimumTimeSeconds
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// ── AI Copilot Endpoint ──────────────────────────────────────────────────────

const SOFTWARE_EXPERT_SYSTEM_PROMPT = `You are **Nalanda AI Copilot** — a world-class Software Engineering expert and senior technical mentor embedded inside the Nalanda Learning & Development Platform.

Your expertise spans the FULL software development lifecycle:
- **Languages:** JavaScript, TypeScript, Python, Java, C#, Go, Rust, C++, SQL, Bash
- **Frontend:** React, Vue, Angular, HTML5, CSS3, Tailwind, Web APIs, Performance, Accessibility
- **Backend:** Node.js, Express, Django, Spring Boot, REST APIs, GraphQL, gRPC, Microservices
- **Databases:** PostgreSQL, MySQL, MongoDB, Redis, Elasticsearch, database design and optimization
- **DevOps & Cloud:** Docker, Kubernetes, CI/CD, GitHub Actions, AWS, GCP, Azure, Terraform, Nginx
- **Architecture:** System Design, DDD, CQRS, Event Sourcing, Clean Architecture, SOLID principles
- **Security:** OWASP Top 10, Auth (OAuth2/JWT/SSO), Secure Coding, Threat Modeling, Pen Testing
- **Testing:** Unit, Integration, E2E, TDD, BDD, Jest, Playwright, Cypress, JUnit
- **Data & AI:** Machine Learning basics, Data Structures, Algorithms, Big O, LLM integrations
- **Soft Skills for Engineers:** Code Reviews, Technical Documentation, System Design Interviews

### How you respond:
- Keep every normal answer under 30 words.
- Answer clearly and directly within that limit.
- Do not use code blocks, tables, or long lists unless the user explicitly asks for a longer answer.
- Only exceed 30 words when the user clearly asks for detail, elaboration, a long answer, step-by-step guidance, full explanation, or more than 30 words.
- Provide **accurate, expert-level** answers suitable for learners from Beginner to Expert.
- When explaining concepts, adapt to the learner's implied level based on their question.
- Use **concrete code examples** with proper syntax highlighting markers (\`\`\`language).
- Structure complex answers with numbered steps, bullet points, and clear headings.
- If the user is studying a specific chapter, ground your answer in that chapter's context.
- Be concise but complete. Avoid fluff. Prioritize correctness over brevity.
- For architecture/design questions, mention trade-offs clearly.
- Always encourage best practices (typing, testing, security, readability).
- If you don't know something, say so honestly rather than hallucinating.

You are available 24/7 to help learners master software engineering. Be an encouraging, knowledgeable mentor.`;

const allowsLongCopilotReply = (message = "") => /\b(more than 30 words|long answer|detailed|detail|elaborate|explain fully|full explanation|step[-\s]?by[-\s]?step|in depth|comprehensive|with code|code example)\b/i.test(message);

// Enforce the product rule that short Copilot answers are the default.
// The prompt asks Gemini to comply, and this guard catches any overlong response.
const capCopilotReply = (reply = "", maxWords = 30) => {
  const words = String(reply).trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return String(reply).trim();
  return `${words.slice(0, maxWords).join(" ").replace(/[.,;:!?-]+$/, "")}.`;
};

app.post("/api/ai/chat", authenticate, async (req, res) => {
  const { message, history = [], context } = req.body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Message is required" });
  }

  let systemPrompt = SOFTWARE_EXPERT_SYSTEM_PROMPT;
  if (context?.chapterTitle || context?.chapterBody || context?.courseTitle) {
    systemPrompt += `\n\n### Current Learning Context:\n`;
    if (context.courseTitle) systemPrompt += `- **Course:** ${context.courseTitle}\n`;
    if (context.chapterTitle) systemPrompt += `- **Chapter:** ${context.chapterTitle}\n`;
    if (context.chapterBody) {
      const trimmedBody = context.chapterBody.slice(0, 1200);
      systemPrompt += `- **Chapter Content Summary:** ${trimmedBody}${context.chapterBody.length > 1200 ? "..." : ""}\n`;
    }
    systemPrompt += `\nThe learner may be asking questions specifically about this chapter. Try to relate your answer to the chapter content when relevant.`;
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return res.status(503).json({ error: "GEMINI_API_KEY is required for Nalanda AI Copilot." });
  }

  const chatPrompt = [
    systemPrompt,
    "\n### Recent Conversation:",
    ...(history || []).slice(-10).map((m) => `${m.role === "assistant" ? "Assistant" : "User"}: ${m.content}`),
    `User: ${message.trim()}`,
  ].join("\n");

  try {
    const model = GEMINI_MODEL;
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: chatPrompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 2048,
      },
    });
    // Longer replies are allowed only when the learner explicitly asks for detail.
    const reply = allowsLongCopilotReply(message) ? (response.text || "").trim() : capCopilotReply(response.text || "");
    if (!reply.trim()) throw new Error("Empty response from Gemini");

    audit(req.user.id, "AI_CHAT", "AI_COPILOT", "session", { model, contextProvided: !!context?.chapterTitle });
    return res.json({ reply, model, source: "gemini" });
  } catch (err) {
    console.error("[AI Copilot] Gemini error:", err);
    return res.status(err?.status === 429 ? 429 : 502).json({ error: geminiErrorMessage(err) });
  }
});

// ── Text-to-Course Agent Endpoint ──────────────────────────────────────────────

const acharyaCategories = ["ProblemSolving", "Technical", "CourseDepth", "BeyondCourse", "AnalyticalAbility"];
const acharyaTypePlan = [...Array(10).fill("MCQ"), ...Array(5).fill("Rating"), ...Array(5).fill("YesNo"), ...Array(5).fill("ShortAnswer"), ...Array(5).fill("LongAnswer")];
const normalizeAcharyaQuestion = (question, index, chapterTitle, skillName) => {
  const type = acharyaTypePlan[index];
  const category = acharyaCategories[Math.floor(index / 6)] || "CourseDepth";
  const base = { id: question?.id || `Q${index + 1}`, type, category, prompt: question?.prompt || `${category} ${type} question for ${chapterTitle} in ${skillName}.`, points: Number(question?.points || 10) };
  if (type === "MCQ") return { ...base, options: Array.isArray(question?.options) && question.options.length >= 4 ? question.options.slice(0, 4) : ["Option A", "Option B", "Option C", "Option D"], answer: Number.isInteger(question?.answer) ? question.answer : 0 };
  if (type === "Rating") return { ...base, ratingScale: Number(question?.ratingScale || 5) };
  if (type === "YesNo") return { ...base, options: ["Yes", "No"], answer: Number.isInteger(question?.answer) ? question.answer : 0 };
  return { ...base, expectedAnswer: question?.expectedAnswer || question?.rubric || "Evaluate the learner response against course accuracy, reasoning, and completeness.", rubric: question?.rubric || question?.expectedAnswer || "Check relevance, correctness, clarity, and applied understanding." };
};
const stripHtml = (html = "") => String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const wordCount = (html = "") => stripHtml(html).split(/\s+/).filter(Boolean).length;
const escapeHtml = (value = "") => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const buildTrainingChapterBody = ({ topic, skillName, courseLevel, chunk }) => {
  const safeTopic = escapeHtml(topic || "Core Concepts");
  const safeSkillName = escapeHtml(skillName || "General");
  const safeCourseLevel = escapeHtml(courseLevel || "Beginner");
  const source = escapeHtml(chunk || "Use the course brief to connect this topic to practical workplace decisions, examples, and measurable learning outcomes.");
  return `<h2>Learning Outcomes</h2>
<ul>
  <li>Explain ${safeTopic} in the context of ${safeSkillName} work.</li>
  <li>Apply ${safeTopic} through a realistic workplace scenario.</li>
  <li>Identify common mistakes, risks, and quality checks.</li>
  <li>Use a simple decision framework to convert the lesson into an action plan.</li>
</ul>
<h2>Concept Overview</h2>
<p>${source}</p>
<p>This chapter is written for ${safeCourseLevel.toLowerCase()} learners who need more than a definition. The goal is to make the idea usable: what it means, when it matters, how it changes a decision, and how a learner can practice it without waiting for a perfect real-world situation.</p>
<p>Think of ${safeTopic} as a working habit rather than a theory. A good learner should be able to notice the situation, ask sharper questions, choose a response, and explain why that response is appropriate. That is what separates passive learning from professional performance.</p>
<blockquote><strong>Instructor note:</strong> Keep the lesson grounded in observable behavior. Learners should leave this chapter with phrases they can say, checks they can perform, and evidence they can show.</blockquote>
<h2>Step-by-Step Method</h2>
<ol>
  <li><strong>Frame the situation:</strong> identify the learner, customer, stakeholder, system, or process affected by the decision. Write the problem in one clear sentence before acting.</li>
  <li><strong>Separate facts from assumptions:</strong> list what is known, what is unknown, and what must be confirmed. This prevents the learner from solving the wrong problem quickly.</li>
  <li><strong>Select the response:</strong> use the principle from this chapter to decide what to say, do, document, improve, or escalate. Match the response to the risk and urgency.</li>
  <li><strong>Communicate clearly:</strong> explain the next action in simple language, confirm ownership, and set a timeline that another person can follow.</li>
  <li><strong>Check the outcome:</strong> verify whether the response solved the need, created new risks, or requires follow-up evidence.</li>
</ol>
<h2>Workplace Example</h2>
<p>Imagine a learner handling a client conversation where expectations are unclear. The client says the current process is too slow, but does not explain whether the delay is caused by approval time, unclear inputs, rework, or system performance. A shallow response would be to promise speed immediately. A professional response starts by clarifying the real friction.</p>
<p>The learner might say: "Let me confirm the part that is slowing you down. Are we talking about the time to collect information, the approval handoff, or the final delivery step?" That question turns a vague complaint into a useful diagnosis. Once the cause is known, the learner can propose a realistic action: simplify the input checklist, assign a single approver, automate a status update, or escalate a blocker.</p>
<p>This example shows why ${safeTopic} matters. The learner is not simply being polite or knowledgeable. They are creating clarity, reducing rework, and giving the client confidence that the next step is controlled.</p>
<h2>Key Takeaways</h2>
<ul>
  <li>Good learning content should lead to visible workplace behavior.</li>
  <li>Strong responses begin with context, not assumptions.</li>
  <li>Examples should show the learner what to say, decide, document, and verify.</li>
  <li>Professional judgment improves when learners practice with realistic constraints.</li>
</ul>
<h2>Practice Activity</h2>
<p>Write a short response, checklist, or action plan for a realistic case involving ${safeTopic}. Use the five-step method above. First, state the situation in one sentence. Second, list the facts and assumptions. Third, choose a response and explain why it fits. Fourth, write the message you would send to a stakeholder. Fifth, define how you will verify success.</p>
<p>After drafting the response, revise it for clarity. Remove vague phrases such as "as soon as possible" or "we will look into it." Replace them with specific commitments, owners, and checkpoints. This makes the output easier to assess and easier to use at work.</p>
<h2>Common Mistakes</h2>
<ul>
  <li>Giving a generic answer without understanding the learner or client context.</li>
  <li>Skipping examples, practice, or verification steps.</li>
  <li>Using unclear language that cannot be acted on or assessed.</li>
  <li>Explaining concepts without showing how they change day-to-day decisions.</li>
  <li>Repeating the same advice in different words instead of adding depth, contrast, or examples.</li>
</ul>
<h2>Reflection Prompt</h2>
<p>Before moving on, ask yourself: where would this lesson fail in a real workplace? Would a new learner know what to do next? Would a manager be able to observe the behavior? Would a client or stakeholder experience a clearer result? If the answer is no, strengthen the example or practice task until the learning becomes visible.</p>
<h2>Quick Knowledge Check</h2>
<p>What is the most important decision in this chapter, and how would you apply it during a real ${safeSkillName} task? Write your answer in three parts: the situation, the action, and the evidence that the action worked.</p>
<h2>Summary</h2>
<p>${safeTopic} becomes useful when the learner can explain it, practice it, avoid common mistakes, and apply it consistently in workplace situations. A premium learning page should feel practical, structured, and human. It should guide the learner from understanding to action, then from action to reflection. That is the standard to use before moving to the next chapter.</p>`;
};
const acharyaStopWords = new Set([
  "training", "complete", "freshers", "improve", "cover", "basic", "basics", "course", "chapter",
  "learn", "learning", "skills", "skill", "experience", "clearly", "politely", "realistic",
  "workplace", "development", "introduction", "foundation", "foundations"
]);
const titleCase = (value = "") => value.split(/\s+/).filter(Boolean).map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
const extractTopicWords = (text, skillName) => {
  const words = String(text)
    .split(/\s+/)
    .map((word) => word.replace(/[^a-zA-Z-]/g, "").toLowerCase())
    .filter((word) => word.length > 4 && !acharyaStopWords.has(word));
  const counts = new Map();
  words.forEach((word) => counts.set(word, (counts.get(word) || 0) + 1));
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([word]) => titleCase(word));
  return ranked.length ? ranked.slice(0, 8) : [skillName || "Core Concepts"];
};
const buildMockAcharyaDraft = ({ text, skillId, skillName, courseLevel, chapterCount, generationDurationMs }) => {
  const sentences = text.split(/[.!?]+/).map((item) => item.trim()).filter((item) => item.length > 10);
  const topicWords = extractTopicWords(text, skillName);
  const chunkSize = Math.max(1, Math.ceil((sentences.length || 1) / chapterCount));
  const chapters = Array.from({ length: chapterCount }, (_, index) => {
    const chunk = sentences.slice(index * chunkSize, (index + 1) * chunkSize).join(". ") || text.slice(0, 700);
    const topic = topicWords[index % Math.max(1, topicWords.length)] || skillName;
    return { title: `${index + 1}. ${topic} in Practice`, description: `A ${courseLevel.toLowerCase()} level chapter covering ${topic} through explanation, workplace examples, practice, and checks for understanding.`, contentType: "Rich Text", body: buildTrainingChapterBody({ topic, skillName, courseLevel, chunk }), durationMinutes: Math.max(25, Math.min(60, Math.ceil(chunk.length / 70))), minimumTimeMinutes: Math.max(18, Math.min(45, Math.ceil(chunk.length / 100))) };
  });
  const assessments = chapters.map((chapter, chapterIndex) => ({ title: `${chapter.title.replace(/^\d+\.\s*/, "")} Assessment`, type: "Mixed", chapterIndex, durationMinutes: 45, passScore: 70, questionLimit: 30, questions: acharyaTypePlan.map((type, index) => normalizeAcharyaQuestion({ prompt: `${acharyaCategories[Math.floor(index / 6)]}: ${type} item ${index + 1} for "${chapter.title}" in the ${skillName} course.`, options: ["Strongly aligned", "Partially aligned", "Weakly aligned", "Not aligned"], answer: 0 }, index, chapter.title, skillName)) }));
  return { course: { title: topicWords.length ? `${courseLevel} ${skillName}: ${topicWords.slice(0, 3).join(", ")}` : `${courseLevel} ${skillName} Course`, description: `An Acharya-generated ${courseLevel.toLowerCase()} course for ${skillName}, built from the provided source material with chapter-aligned assessments.`, skill: skillName, skillId, targetLevel: courseLevel, difficulty: courseLevel === "Expert" ? "Advanced" : courseLevel, category: skillName, tags: ["Acharya", skillName, courseLevel], prerequisites: [], thumbnailColor: "#22d3ee", estimatedHours: Math.max(1, Math.ceil(chapters.reduce((sum, chapter) => sum + chapter.durationMinutes, 0) / 60)) }, chapters, assessments, generationDurationMs };
};

const acharyaRequiredChapterSections = [
  "Learning Outcomes",
  "Concept Overview",
  "Step-by-Step Method",
  "Workplace Example",
  "Key Takeaways",
  "Practice Activity",
  "Common Mistakes",
  "Quick Knowledge Check",
  "Summary",
];

// Quality gate for each generated chapter before the pipeline moves forward.
// It checks length, instructional structure, examples, formatting, and repetition.
const validateAcharyaChapter = (chapter) => {
  const body = String(chapter?.body || "");
  const text = stripHtml(body);
  const count = wordCount(body);
  const missingSections = acharyaRequiredChapterSections.filter((section) => !body.toLowerCase().includes(section.toLowerCase()));
  const failures = [];
  if (count < 500) failures.push(`Minimum word count not met (${count}/500 words).`);
  if (missingSections.length) failures.push(`Missing sections: ${missingSections.join(", ")}.`);
  if (!/<(ul|ol)[\s>]/i.test(body)) failures.push("Needs bullet points or numbered lists.");
  if (!/<(blockquote|aside|strong)[\s>]/i.test(body)) failures.push("Needs a highlighted note or key takeaway emphasis.");
  if (!/example|scenario|imagine|case/i.test(text)) failures.push("Needs a practical example or scenario.");
  const sentences = text.split(/[.!?]+/).map((sentence) => sentence.trim().toLowerCase()).filter((sentence) => sentence.length > 40);
  if (new Set(sentences).size < Math.max(1, Math.floor(sentences.length * 0.8))) failures.push("Potential repetitive wording detected.");
  return {
    passed: failures.length === 0,
    wordCount: count,
    missingSections,
    failures,
  };
};

// Merge provider output with a deterministic fallback so every chapter has the fields
// the frontend expects, even if the provider returns partial JSON.
const normalizeAcharyaChapter = (chapter, fallback, index) => ({
  ...fallback,
  ...(chapter || {}),
  title: chapter?.title || fallback.title || `Chapter ${index + 1}`,
  description: chapter?.description || fallback.description || "",
  contentType: "Rich Text",
  body: chapter?.body || fallback.body,
  durationMinutes: Number(chapter?.durationMinutes || fallback.durationMinutes || 35),
  minimumTimeMinutes: Number(chapter?.minimumTimeMinutes || fallback.minimumTimeMinutes || 25),
});

// The first generation step creates only the course map. Full content is written
// later one chapter at a time so the output does not become shallow.
const normalizeAcharyaOutline = ({ parsed, fallback, skillName, skillId, courseLevel, chapterCount }) => {
  const fallbackCourse = fallback.course;
  const parsedCourse = parsed?.course || {};
  const parsedChapters = Array.isArray(parsed?.chapters) ? parsed.chapters : [];
  return {
    course: {
      ...fallbackCourse,
      ...parsedCourse,
      skill: skillName,
      skillId,
      targetLevel: courseLevel,
      difficulty: courseLevel === "Expert" ? "Advanced" : courseLevel,
      tags: Array.isArray(parsedCourse.tags) && parsedCourse.tags.length ? parsedCourse.tags : fallbackCourse.tags,
    },
    chapters: Array.from({ length: chapterCount }, (_, index) => ({
      title: parsedChapters[index]?.title || fallback.chapters[index]?.title || `Chapter ${index + 1}`,
      description: parsedChapters[index]?.description || fallback.chapters[index]?.description || "",
      learningGoal: parsedChapters[index]?.learningGoal || parsedChapters[index]?.goal || `Apply ${skillName} in a realistic workplace situation.`,
      topic: parsedChapters[index]?.topic || extractTopicWords(`${parsedChapters[index]?.title || ""} ${parsedChapters[index]?.description || ""}`, skillName)[0] || skillName,
    })),
  };
};

// Assessments are intentionally normalized after all chapters are complete,
// preserving the required sequence: outline -> chapters -> validation -> assessments.
const normalizeAcharyaAssessments = (assessments, chapters, fallbackAssessments, skillName) => chapters.map((chapter, chapterIndex) => {
  const raw = Array.isArray(assessments) ? assessments[chapterIndex] : null;
  const fallback = fallbackAssessments[chapterIndex] || {};
  const rawQuestions = Array.isArray(raw?.questions) ? raw.questions : fallback.questions;
  return {
    ...fallback,
    ...(raw || {}),
    title: raw?.title || fallback.title || `${chapter.title.replace(/^\d+\.\s*/, "")} Assessment`,
    type: "Mixed",
    chapterIndex,
    durationMinutes: Number(raw?.durationMinutes || fallback.durationMinutes || 45),
    passScore: Number(raw?.passScore || fallback.passScore || 70),
    questionLimit: 30,
    questions: acharyaTypePlan.map((type, index) => normalizeAcharyaQuestion(rawQuestions?.[index], index, chapter.title, skillName)),
  };
});

// Newline-delimited JSON lets the frontend show live progress without waiting
// for the entire course draft to finish.
const writeNdjson = (res, event) => {
  res.write(`${JSON.stringify({ at: now(), ...event })}\n`);
};

app.post("/api/ai/generate-course-stream", authenticate, requireRole("Admin", "Manager"), async (req, res) => {
  const startedAt = Date.now();
  const { text, skillId = "", skillName = "General", courseLevel = "Beginner" } = req.body;
  const chapterCount = Math.max(1, Math.min(20, Number(req.body.chapterCount || 3)));
  if (!text || text.trim().length < 50) return res.status(400).json({ error: "Please provide sufficient educational text (min 50 characters) to generate a course." });

  res.writeHead(200, {
    "Content-Type": "application/x-ndjson; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  const fallback = buildMockAcharyaDraft({ text, skillId, skillName, courseLevel, chapterCount, generationDurationMs: 0 });
  const relevantFeedback = getRelevantAcharyaFeedback({ text, skillName, courseLevel });
  const feedbackGuidance = buildFeedbackGuidance(relevantFeedback);
  const apiKey = getGeminiApiKey();
  // Provider generation is opt-in here. The default path is deterministic and fast,
  // while still following the same staged pipeline and validation rules.
  const ai = apiKey && req.body?.useProviderGeneration === true ? new GoogleGenAI({ apiKey }) : null;
  let usedFallback = !ai;
  let repairedSections = 0;

  // Prevent a slow provider call from freezing the course creation experience.
  const withTimeout = (promise, ms, label) => Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s`)), ms)),
  ]);

  const generateJson = async (prompt, maxOutputTokens = 8192, timeoutMs = 20000) => {
    if (!ai) throw new Error("Gemini API key is not configured.");
    const response = await withTimeout(ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json", temperature: 0.25, maxOutputTokens },
    }), timeoutMs, "Acharya generation step");
    return parseGeminiJson(response.text);
  };

  try {
    writeNdjson(res, { type: "status", stage: "reading", message: "Reading the source material and generation requirements." });
    writeNdjson(res, { type: "status", stage: "outline", message: `Creating the complete ${chapterCount}-chapter structure before writing content.` });

    let outline = normalizeAcharyaOutline({ parsed: null, fallback, skillName, skillId, courseLevel, chapterCount });
    if (ai) {
      try {
        const parsed = await generateJson(`You are Acharya, Nalanda's senior instructional designer. Return strict JSON only.

First create only the course structure. Do not write full chapter content and do not write assessments yet.

Course rules:
- Build exactly ${chapterCount} chapters/modules.
- Sequence chapters from foundation to applied practice.
- Each chapter plan must have title, description, topic, and learningGoal.
- The course should feel premium, practical, and specific to "${skillName}" at "${courseLevel}" level.

Prior feedback memory:
${feedbackGuidance}

Output JSON:
{
  "course": { "title": "...", "description": "...", "tags": ["..."], "difficulty": "${courseLevel}" },
  "chapters": [
    { "title": "...", "description": "...", "topic": "...", "learningGoal": "..." }
  ]
}

Source material:
${text}`, 4096);
        outline = normalizeAcharyaOutline({ parsed, fallback, skillName, skillId, courseLevel, chapterCount });
      } catch (err) {
        usedFallback = true;
        writeNdjson(res, { type: "status", stage: "outline", message: "Outline generation needed the structured fallback, so Acharya is continuing with a deterministic course plan." });
      }
    }

    writeNdjson(res, { type: "outline", message: `Course structure created with ${chapterCount} chapters.`, course: outline.course, chapters: outline.chapters });

    const chapters = [];
    for (let index = 0; index < chapterCount; index += 1) {
      const plan = outline.chapters[index];
      const fallbackChapter = fallback.chapters[index];
      writeNdjson(res, { type: "chapter_start", index, total: chapterCount, message: `Creating Chapter ${index + 1} of ${chapterCount}: ${plan.title}` });

      let chapter = fallbackChapter;
      if (ai) {
        try {
          const parsed = await generateJson(`You are Acharya, writing one premium LMS chapter. Return strict JSON only.

Write only Chapter ${index + 1} of ${chapterCount}. Do not write other chapters. Do not write assessments.

Quality rules:
- Minimum 500 words in the body.
- Use clean HTML, not Markdown.
- Include these sections: ${acharyaRequiredChapterSections.join(", ")}.
- Use proper headings, subheadings, paragraphs, bullet lists, numbered lists, highlighted notes, examples, practical explanations, and key takeaways.
- Sound like a professional educator, technical blogger, and instructional designer.
- Avoid generic AI phrasing, repetition, filler, and continuous plain paragraphs.
- Include a workplace example and an activity the learner can complete.
- Keep the chapter specific to "${skillName}" and "${courseLevel}" learners.

Course title: ${outline.course.title}
Chapter plan: ${JSON.stringify(plan)}
Previously completed chapters: ${chapters.map((item) => item.title).join(", ") || "None"}
Prior feedback memory:
${feedbackGuidance}

Output JSON:
{ "title": "...", "description": "...", "contentType": "Rich Text", "body": "<h2>Learning Outcomes</h2>...", "durationMinutes": 35, "minimumTimeMinutes": 25 }

Source material:
${text}`, 8192);
          chapter = normalizeAcharyaChapter(parsed, fallbackChapter, index);
        } catch (err) {
          usedFallback = true;
          chapter = fallbackChapter;
        }
      }

      let validation = validateAcharyaChapter(chapter);
      if (!validation.passed && ai) {
        repairedSections += 1;
        writeNdjson(res, { type: "chapter_repair", index, total: chapterCount, message: `Chapter ${index + 1} needs a focused quality repair before moving on.`, validation });
        try {
          const repaired = await generateJson(`Repair only the failed parts of this chapter and return the full corrected chapter JSON.

Validation failures:
${validation.failures.join("\n")}

Repair rules:
- Keep the title unless it is unclear.
- Body must be at least 500 words.
- Preserve good existing content and improve missing or weak sections.
- Use clean HTML with headings, lists, highlighted notes, examples, practical explanations, and key takeaways.
- Do not write assessments.

Course: ${outline.course.title}
Skill: ${skillName}
Level: ${courseLevel}
Chapter JSON:
${JSON.stringify(chapter)}`, 8192);
          chapter = normalizeAcharyaChapter(repaired, fallbackChapter, index);
          validation = validateAcharyaChapter(chapter);
        } catch (err) {
          usedFallback = true;
        }
      }

      if (!validation.passed) {
        chapter = fallbackChapter;
        validation = validateAcharyaChapter(chapter);
        usedFallback = true;
      }

      chapters.push(chapter);
      writeNdjson(res, {
        type: "chapter_done",
        index,
        total: chapterCount,
        message: `Chapter ${index + 1} of ${chapterCount} Created`,
        chapter,
        validation,
      });
    }

    writeNdjson(res, { type: "assessment_start", message: "All chapters are complete. Creating assessments, quizzes, MCQs, assignments, and descriptive questions now." });

    let assessments = fallback.assessments;
    if (ai) {
      try {
        const parsed = await generateJson(`You are Acharya, creating assessments only after all chapters are complete. Return strict JSON only.

Create one mixed assessment per chapter. Each assessment must include 30 questions in this order:
- 10 MCQ
- 5 Rating
- 5 YesNo
- 5 ShortAnswer
- 5 LongAnswer

Questions must test problem solving, technical understanding, course depth, beyond-course application, and analytical ability. Use the finished chapters as the source of truth.

Output JSON:
{ "assessments": [
  { "title": "...", "durationMinutes": 45, "passScore": 70, "questions": [{ "prompt": "...", "options": ["...", "...", "...", "..."], "answer": 0, "points": 10 }] }
] }

Skill: ${skillName}
Level: ${courseLevel}
Chapters:
${JSON.stringify(chapters.map((chapter, i) => ({ index: i, title: chapter.title, description: chapter.description, bodyPreview: stripHtml(chapter.body).slice(0, 1200) })))}`, 8192);
        assessments = normalizeAcharyaAssessments(parsed.assessments, chapters, fallback.assessments, skillName);
      } catch (err) {
        usedFallback = true;
        assessments = normalizeAcharyaAssessments(null, chapters, fallback.assessments, skillName);
      }
    } else {
      assessments = normalizeAcharyaAssessments(null, chapters, fallback.assessments, skillName);
    }

    writeNdjson(res, { type: "assessment_done", message: `Assessments created for ${chapters.length} chapters.`, assessments });

    const generationDurationMs = Date.now() - startedAt;
    const draft = {
      course: {
        ...outline.course,
        estimatedHours: Math.max(1, Math.ceil(chapters.reduce((sum, chapter) => sum + Number(chapter.durationMinutes || 35), 0) / 60)),
      },
      chapters,
      assessments,
      generationDurationMs,
      usedFallback,
      usedFeedbackCount: relevantFeedback.length,
      repairedSections,
    };

    audit(req.user.id, "ACHARYA_GENERATE_DRAFT_STREAM", "ACHARYA", "draft", { skillName, courseLevel, chapterCount, repairedSections });
    writeNdjson(res, { type: "final", message: "Acharya draft completed and ready for review.", draft });
  } catch (err) {
    console.error("[Acharya Stream Error]", err);
    writeNdjson(res, { type: "error", message: geminiErrorMessage(err), detail: err?.message || "Unknown error" });
  } finally {
    res.end();
  }
});

app.post("/api/ai/generate-course", authenticate, requireRole("Admin", "Manager"), async (req, res, next) => {
  if (req.body?.skillId || req.body?.chapterCount || req.body?.courseLevel) {
    const startedAt = Date.now();
    const { text, skillId = "", skillName = "General", courseLevel = "Beginner" } = req.body;
    const chapterCount = Math.max(1, Math.min(20, Number(req.body.chapterCount || 3)));
    if (!text || text.trim().length < 50) return res.status(400).json({ error: "Please provide sufficient educational text (min 50 characters) to generate a course." });
    const relevantFeedback = getRelevantAcharyaFeedback({ text, skillName, courseLevel });
    const feedbackGuidance = buildFeedbackGuidance(relevantFeedback);
    const prompt = `You are Acharya, Nalanda's course generation specialist for employee skill training and development. Return strict JSON only.

Build exactly ${chapterCount} chapters. The application will generate assessments separately, so focus on excellent chapter teaching content.

Chapter generation rules:
- Each chapter must be detailed enough for a 25-60 minute self-paced training session.
- Each chapter body must be clean HTML, not Markdown, with these sections in order: <h2>Learning Outcomes</h2>, <h2>Concept Overview</h2>, <h2>Step-by-Step Method</h2>, <h2>Workplace Example</h2>, <h2>Practice Activity</h2>, <h2>Common Mistakes</h2>, <h2>Quick Knowledge Check</h2>, <h2>Summary</h2>.
- Learning outcomes must be specific, observable, and aligned to skill "${skillName}".
- Include realistic workplace examples, especially client handling, communication, decision-making, escalation, or task execution when relevant.
- Do not create shallow one-paragraph chapters. Expand brief source material into a complete lesson using safe, practical training assumptions.
- Do not wrap the HTML in code fences. Do not escape HTML tags.

Prior feedback memory to improve this generation:
${feedbackGuidance}

Output JSON shape:
{
  "course": { "title": "...", "description": "...", "tags": ["..."], "difficulty": "${courseLevel}" },
  "chapters": [
    { "title": "...", "description": "...", "contentType": "Rich Text", "body": "<h2>Learning Outcomes</h2>...", "durationMinutes": 35, "minimumTimeMinutes": 25 }
  ]
}

Use skill "${skillName}" and course level "${courseLevel}". Source text: ${text}`;
    try {
      let draft = null;
      const apiKey = getGeminiApiKey();
      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        try {
          const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json", temperature: 0.2, maxOutputTokens: 8192 },
          });
          const parsed = parseGeminiJson(response.text);
          const generationDurationMs = Date.now() - startedAt;
          const mock = buildMockAcharyaDraft({ text, skillId, skillName, courseLevel, chapterCount, generationDurationMs });
          draft = {
            ...mock,
            course: { ...mock.course, ...(parsed.course || {}), skill: skillName, skillId, targetLevel: courseLevel, difficulty: courseLevel === "Expert" ? "Advanced" : courseLevel },
            chapters: Array.from({ length: chapterCount }, (_, index) => ({ ...mock.chapters[index], ...(parsed.chapters || [])[index] })),
            assessments: mock.assessments,
            generationDurationMs,
            usedFeedbackCount: relevantFeedback.length,
          };
        } catch (err) {
          console.warn("[Acharya Gemini Draft Warning] Using structured fallback:", err?.message || err);
          draft = { ...buildMockAcharyaDraft({ text, skillId, skillName, courseLevel, chapterCount, generationDurationMs: Date.now() - startedAt }), usedFallback: true, usedFeedbackCount: relevantFeedback.length };
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        draft = { ...buildMockAcharyaDraft({ text, skillId, skillName, courseLevel, chapterCount, generationDurationMs: Date.now() - startedAt }), usedFallback: true, usedFeedbackCount: relevantFeedback.length };
      }
      audit(req.user.id, "ACHARYA_GENERATE_DRAFT", "ACHARYA", "draft", { skillName, courseLevel, chapterCount });
      return res.status(201).json({ draft });
    } catch (err) {
      console.error("[Acharya Draft Error]", err);
      return res.status(err?.status === 429 ? 429 : 500).json({ error: geminiErrorMessage(err) });
    }
  }
  return next();
});

app.post("/api/ai/generate-course", authenticate, requireRole("Admin", "Manager"), async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim().length < 50) {
    return res.status(400).json({ error: "Please provide sufficient educational text (min 50 characters) to generate a course." });
  }

  const prompt = `You are the Nalanda Text-to-Course Preparation Agent, an autonomous specialist responsible for converting raw educational content into fully structured, pedagogically optimized, multimedia-ready course chapters.

OBJECTIVE:
Transform the provided unstructured text into a complete, interactive, LMS-ready course structure in strict JSON format.

CHAPTER GENERATION GUIDELINES:
- Each chapter must be detailed enough for a 25-60 minute self-paced training session, not a short note.
- Each chapter body must be clean HTML, not Markdown, with these sections in order:
  <h2>Learning Outcomes</h2>
  <h2>Concept Overview</h2>
  <h2>Step-by-Step Method</h2>
  <h2>Workplace Example</h2>
  <h2>Practice Activity</h2>
  <h2>Common Mistakes</h2>
  <h2>Quick Knowledge Check</h2>
  <h2>Summary</h2>
- Use paragraphs, ordered lists, unordered lists, and scenario-based examples.
- Expand brief source notes into complete training content using safe, practical assumptions.
- Keep the course focused on skill training and development.
- Do not wrap HTML in code fences. Do not escape HTML tags.

REQUIREMENTS:
- Understand & segment text into logical learning units (create multiple chapters when content is substantial).
- Identify topic hierarchy from context, not formatting.
- Rewrite content in a clear, student-friendly voice.
- Generate chapter-level & topic-level learning objectives.
- Summarize and simplify complex parts.
- Detect missing concepts & fill gaps.
- Auto-recommend images with text-to-image prompts inside the chapter body (e.g., [Suggested Image: ...]).
- Generate pre-assessment & post-assessment questions.
- Auto-generate a glossary section in each chapter.
- Keep language neutral, non-biased, and educational.
- Each question must have a unique "id" field like "Q1", "Q2", etc.

OUTPUT FORMAT (Strict JSON):
{
  "course": {
    "title": "Catchy, professional title",
    "description": "Comprehensive course description (2-3 sentences)",
    "skill": "Main subject area (e.g., Leadership, Security, Data Science)",
    "tags": ["tag1", "tag2", "tag3"],
    "difficulty": "Beginner | Intermediate | Advanced"
  },
  "chapters": [
    {
      "title": "Chapter title",
      "description": "Short chapter description",
      "body": "Full clean HTML content with all required chapter sections. Use paragraphs, <ol>, <ul>, workplace examples, practice activities, common mistakes, and a summary.",
      "durationMinutes": 35
    }
  ],
  "assessments": [
    {
      "title": "Pre-Assessment or Post-Assessment title",
      "type": "MCQ",
      "durationMinutes": 10,
      "passScore": 80,
      "questions": [
        {
          "id": "Q1",
          "type": "MCQ",
          "prompt": "Question text",
          "options": ["A", "B", "C", "D"],
          "answer": 0,
          "points": 10
        }
      ]
    }
  ]
}

RAW TEXT TO PROCESS:
${text}
`;

  try {
    const apiKey = getGeminiApiKey();
    let parsedResult = null;

    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });
      parsedResult = JSON.parse(response.text);
    } else {
      console.warn("[Text-to-Course] GEMINI_API_KEY not found. Using robust mock generator fallback.");
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Build a richer multi-chapter mock based on content length
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
      const chunkSize = Math.max(3, Math.ceil(sentences.length / 3));
      const chapterTexts = [];
      for (let i = 0; i < sentences.length; i += chunkSize) {
        chapterTexts.push(sentences.slice(i, i + chunkSize).join(". ").trim());
      }
      if (chapterTexts.length === 0) chapterTexts.push(text.slice(0, 800));

      const topicWords = extractTopicWords(text, "General");
      const courseTitle = topicWords.length >= 2
        ? "Mastering " + topicWords.slice(0, 3).join(", ")
        : "Introduction to " + (text.split(" ").slice(0, 5).join(" ") || "the Topic");

      parsedResult = {
        course: {
          title: courseTitle,
          description: "An auto-generated course based on the provided text. This course breaks down complex topics into easily digestible learning modules with assessments and glossaries.",
          skill: "General",
          tags: ["Auto-Generated", "AI", ...topicWords.slice(0, 2)],
          difficulty: text.length > 3000 ? "Intermediate" : "Beginner"
        },
        chapters: chapterTexts.map((ct, i) => {
          const topic = topicWords[i % Math.max(1, topicWords.length)] || "Core Concepts";
          return {
            title: i === 0 ? "Foundations & Core Concepts" : i === chapterTexts.length - 1 ? "Advanced Topics & Synthesis" : "Deep Dive: Key Principles " + (i + 1),
            description: "Chapter " + (i + 1) + " builds practical understanding through concepts, examples, practice, and checks for application.",
            body: buildTrainingChapterBody({ topic, skillName: parsedResult?.course?.skill || "General", courseLevel: text.length > 3000 ? "Intermediate" : "Beginner", chunk: ct }),
            durationMinutes: Math.max(25, Math.min(60, Math.ceil(ct.length / 70)))
          };
        }),
        assessments: [
          {
            title: "Pre-Assessment: Baseline Knowledge",
            type: "MCQ",
            durationMinutes: 10,
            passScore: 60,
            questions: [
              { id: "Q1", type: "MCQ", prompt: "Which best describes the primary subject of this course?", options: ["An unrelated topic", "The core subject covered in the text", "A historical overview only", "None of the above"], answer: 1, points: 25 },
              { id: "Q2", type: "MCQ", prompt: "What is a key objective of the first chapter?", options: ["Memorize dates", "Understand foundational concepts", "Skip to advanced topics", "Review unrelated material"], answer: 1, points: 25 },
            ]
          },
          {
            title: "Post-Assessment: Comprehensive Review",
            type: "MCQ",
            durationMinutes: 15,
            passScore: 70,
            questions: [
              { id: "Q1", type: "MCQ", prompt: "What is the primary focus of the first chapter?", options: ["Advanced implementation", "Core concepts and fundamentals", "Historical overview", "Conclusion"], answer: 1, points: 25 },
              { id: "Q2", type: "MCQ", prompt: "Which learning approach is emphasized throughout the course?", options: ["Rote memorization", "Practical application", "Passive reading", "Speed reading"], answer: 1, points: 25 },
              { id: "Q3", type: "MCQ", prompt: "What should you do after completing all chapters?", options: ["Nothing", "Review key concepts and attempt the assessment", "Delete the course", "Skip the summary"], answer: 1, points: 25 },
              { id: "Q4", type: "Descriptive", prompt: "In your own words, summarize the most important concept you learned from this course and describe how you would apply it.", points: 25 },
            ]
          }
        ]
      };
    }

    // Ensure every question has an id
    (parsedResult.assessments || []).forEach(a => {
      (a.questions || []).forEach((q, qi) => {
        if (!q.id) q.id = "Q" + (qi + 1);
      });
    });

    const newCourse = {
      id: nextCourseId(parsedResult.course?.skill || "GN"),
      title: parsedResult.course?.title || "Untitled Course",
      description: parsedResult.course?.description || "No description provided",
      skill: parsedResult.course?.skill || "General",
      tags: parsedResult.course?.tags || [],
      contentTypes: ["Rich Text"],
      approval: req.user.role === "Admin" ? "Approved" : "Pending",
      status: "Active",
      ownerId: req.user.id,
      version: 1,
      createdAt: now(),
      updatedAt: now()
    };

    const newChapters = (parsedResult.chapters || []).map((ch, idx) => ({
      id: `CH-${Math.floor(1000 + Math.random() * 9000)}`,
      courseId: newCourse.id,
      sequence: idx + 1,
      title: ch.title || "Untitled Chapter",
      description: ch.description || "",
      contentType: "Rich Text",
      body: ch.body || "",
      durationMinutes: ch.durationMinutes || 10,
      minimumTimeMinutes: Math.floor((ch.durationMinutes || 10) * 0.7),
      createdAt: now(),
      updatedAt: now()
    }));

    // Map each assessment to its corresponding chapter when possible
    const newAssessments = (parsedResult.assessments || []).map((a, ai) => ({
      id: `ASM-${Math.floor(1000 + Math.random() * 9000)}`,
      title: a.title || "Knowledge Check",
      courseId: newCourse.id,
      chapterId: newChapters.length > 0 ? newChapters[Math.min(ai, newChapters.length - 1)].id : null,
      type: a.type || "MCQ",
      strictMode: true,
      questions: (a.questions || []).map((q, qi) => ({ ...q, id: q.id || ("Q" + (qi + 1)) })),
      durationMinutes: a.durationMinutes || 15,
      passScore: a.passScore || 80,
      ownerId: req.user.id,
      approval: "Approved",
      status: "Active",
      createdAt: now(),
      updatedAt: now()
    }));

    courses.unshift(newCourse);
    chapters.push(...newChapters);
    assessments.unshift(...newAssessments);

    audit(req.user.id, "AI_GENERATE_COURSE", "COURSE", newCourse.id, { title: newCourse.title, chapters: newChapters.length, assessments: newAssessments.length });

    return res.status(201).json({
      data: newCourse,
      chapters: newChapters,
      assessments: newAssessments,
      chaptersCount: newChapters.length,
      assessmentsCount: newAssessments.length
    });

  } catch (err) {
    console.error("[Text-to-Course Error]", err);
    return res.status(err?.status === 429 ? 429 : 500).json({ error: geminiErrorMessage(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Nalanda API listening on http://localhost:${PORT}`);
});
