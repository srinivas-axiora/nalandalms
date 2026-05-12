import express from "express";
import cors from "cors";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import cookieParser from "cookie-parser";

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 * 500 } });
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-me";

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
  res.json({ ok: true, service: "Nalanda API", time: now() });
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

app.listen(PORT, () => {
  console.log(`Nalanda API listening on http://localhost:${PORT}`);
});
