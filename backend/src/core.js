// Core foundation: configuration constants, in-memory state + seed data, and the
// durable persistence layer (storage adapter, snapshot/save/load). Extracted from
// server.js as the first foundation layer; imported by server.js and (later) modules.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "node:url";
import { createStorage } from "../db.js";
import {
  pythonFullStackCourse,
  pythonFullStackSkills,
  pythonFullStackChapters,
  pythonFullStackAssessments,
} from "./seed/courses/python-fullstack/index.js";
import {
  javaFullStackCourse,
  javaFullStackSkills,
  javaFullStackChapters,
  javaFullStackAssessments,
} from "./seed/courses/java-fullstack/index.js";
import {
  dataScienceCourse,
  dataScienceSkills,
  dataScienceChapters,
  dataScienceAssessments,
} from "./seed/courses/data-science/index.js";
import {
  aiMlCourse,
  aiMlSkills,
  aiMlChapters,
  aiMlAssessments,
} from "./seed/courses/ai-ml/index.js";
import {
  manualTestingCourse,
  manualTestingSkills,
  manualTestingChapters,
  manualTestingAssessments,
} from "./seed/courses/manual-testing/index.js";
import {
  automationTestingCourse,
  automationTestingSkills,
  automationTestingChapters,
  automationTestingAssessments,
} from "./seed/courses/automation-testing/index.js";
import {
  dataAnalyticsCourse,
  dataAnalyticsSkills,
  dataAnalyticsChapters,
  dataAnalyticsAssessments,
} from "./seed/courses/data-analytics/index.js";
import {
  devopsCourse,
  devopsSkills,
  devopsChapters,
  devopsAssessments,
} from "./seed/courses/devops/index.js";
import {
  mlopsCourse,
  mlopsSkills,
  mlopsChapters,
  mlopsAssessments,
} from "./seed/courses/mlops/index.js";
import {
  dataEngineerCourse,
  dataEngineerSkills,
  dataEngineerChapters,
  dataEngineerAssessments,
} from "./seed/courses/data-engineer/index.js";
import {
  digitalMarketingCourse,
  digitalMarketingSkills,
  digitalMarketingChapters,
  digitalMarketingAssessments,
} from "./seed/courses/digital-marketing/index.js";
import {
  uiUxCourse,
  uiUxSkills,
  uiUxChapters,
  uiUxAssessments,
} from "./seed/courses/ui-ux/index.js";
import {
  reactDeveloperCourse,
  reactDeveloperSkills,
  reactDeveloperChapters,
  reactDeveloperAssessments,
} from "./seed/courses/react-developer/index.js";
import {
  forwardDeployCourse,
  forwardDeploySkills,
  forwardDeployChapters,
  forwardDeployAssessments,
} from "./seed/courses/forward-deploy-engineer/index.js";
import {
  businessAnalystCourse,
  businessAnalystSkills,
  businessAnalystChapters,
  businessAnalystAssessments,
} from "./seed/courses/business-analyst/index.js";
import {
  humanResourcesCourse,
  humanResourcesSkills,
  humanResourcesChapters,
  humanResourcesAssessments,
} from "./seed/courses/human-resources/index.js";
import {
  salesExecutiveCourse,
  salesExecutiveSkills,
  salesExecutiveChapters,
  salesExecutiveAssessments,
} from "./seed/courses/sales-executive/index.js";
import {
  payrollComplianceCourse,
  payrollComplianceSkills,
  payrollComplianceChapters,
  payrollComplianceAssessments,
} from "./seed/courses/payroll-compliance/index.js";
import {
  technicalArchitectCourse,
  technicalArchitectSkills,
  technicalArchitectChapters,
  technicalArchitectAssessments,
} from "./seed/courses/technical-architect/index.js";
import {
  sixSigmaCourse,
  sixSigmaSkills,
  sixSigmaChapters,
  sixSigmaAssessments,
} from "./seed/courses/six-sigma-operations/index.js";
import {
  questionLibrary,
  draftInternAssessments,
} from "./seed/question-library/questions.js";
import { seedCandidateAssessments } from "./seed/question-library/seed-submissions.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const roles = ["Super Admin", "Admin", "Manager", "Employee", "Learner", "Instructor", "InstituteAdmin"];
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
  ...javaFullStackSkills,
  ...pythonFullStackSkills,
  ...dataScienceSkills,
  ...aiMlSkills,
  ...manualTestingSkills,
  ...automationTestingSkills,
  ...dataAnalyticsSkills,
  ...devopsSkills,
  ...mlopsSkills,
  ...dataEngineerSkills,
  ...digitalMarketingSkills,
  ...uiUxSkills,
  ...reactDeveloperSkills,
  ...forwardDeploySkills,
  ...businessAnalystSkills,
  ...humanResourcesSkills,
  ...salesExecutiveSkills,
  ...payrollComplianceSkills,
  ...technicalArchitectSkills,
  ...sixSigmaSkills,
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
  javaFullStackCourse,
  pythonFullStackCourse,
  dataScienceCourse,
  aiMlCourse,
  manualTestingCourse,
  automationTestingCourse,
  dataAnalyticsCourse,
  devopsCourse,
  mlopsCourse,
  dataEngineerCourse,
  digitalMarketingCourse,
  uiUxCourse,
  reactDeveloperCourse,
  forwardDeployCourse,
  businessAnalystCourse,
  humanResourcesCourse,
  salesExecutiveCourse,
  payrollComplianceCourse,
  technicalArchitectCourse,
  sixSigmaCourse,
  { id: "CRS-001", title: "Secure Coding for Cloud Teams", description: "Threat modeling, OWASP controls, and secure release patterns.", skill: "Security", skillIds: ["SKILL-SEC"], targetLevel: "Advanced", prerequisites: [], category: "Technical", tags: ["OWASP", "Cloud"], thumbnailColor: "#22d3ee", ownerId: "EMP-1003", approval: "Approved", status: "Active", version: 2, difficulty: "Advanced", estimatedHours: 6, createdAt: now(), updatedAt: now() },
  { id: "CRS-002", title: "Manager Essentials: Feedback Systems", description: "Practical rituals for coaching and performance reviews.", skill: "Leadership", skillIds: ["SKILL-LEAD", "SKILL-COMM"], targetLevel: "Intermediate", prerequisites: [], category: "Soft Skills", tags: ["Coaching", "People"], thumbnailColor: "#a78bfa", ownerId: "EMP-1002", approval: "Approved", status: "Active", version: 1, difficulty: "Intermediate", estimatedHours: 4, createdAt: now(), updatedAt: now() },
  { id: "CRS-003", title: "Data Storytelling for Business Reviews", description: "Build executive narratives with evidence and charts.", skill: "Analytics", skillIds: ["SKILL-ANL"], targetLevel: "Beginner", prerequisites: [], category: "Business", tags: ["BI", "Charts"], thumbnailColor: "#34d399", ownerId: "EMP-1003", approval: "Pending", status: "Active", version: 1, difficulty: "Beginner", estimatedHours: 3, createdAt: now(), updatedAt: now() },
  { id: "CRS-QA-001", title: "QA Automation Foundations", description: "Build a practical base in automation strategy, selectors, test design, and stable UI validation.", skill: "QA Automation", skillIds: ["SKILL-QA"], targetLevel: "Intermediate", prerequisites: [], category: "QA Automation", tags: ["Selenium", "Playwright", "Regression"], thumbnailColor: "#38bdf8", ownerId: "EMP-1003", approval: "Approved", status: "Active", version: 1, difficulty: "Intermediate", estimatedHours: 6, createdAt: now(), updatedAt: now() },
  { id: "CRS-PY-001", title: "Python Full Stack Essentials", description: "Create full stack applications with Python APIs, React interfaces, authentication, and database workflows.", skill: "Python Full Stack", skillIds: ["SKILL-PYFS"], targetLevel: "Intermediate", prerequisites: [], category: "Full Stack", tags: ["Python", "FastAPI", "React"], thumbnailColor: "#34d399", ownerId: "EMP-1003", approval: "Approved", status: "Active", version: 1, difficulty: "Intermediate", estimatedHours: 7, createdAt: now(), updatedAt: now() },
  { id: "CRS-QAPY-001", title: "Python API Test Automation", description: "Use Python to validate APIs, contract behavior, fixtures, CI execution, and evidence-ready automation reports.", skill: "QA Automation", skillIds: ["SKILL-QA", "SKILL-PYFS"], targetLevel: "Advanced", prerequisites: ["CRS-QA-001"], category: "QA Automation", tags: ["Pytest", "API", "CI"], thumbnailColor: "#f59e0b", ownerId: "EMP-1003", approval: "Approved", status: "Active", version: 1, difficulty: "Advanced", estimatedHours: 6, createdAt: now(), updatedAt: now() },
];

const chapters = [
  ...javaFullStackChapters,
  ...pythonFullStackChapters,
  ...dataScienceChapters,
  ...aiMlChapters,
  ...manualTestingChapters,
  ...automationTestingChapters,
  ...dataAnalyticsChapters,
  ...devopsChapters,
  ...mlopsChapters,
  ...dataEngineerChapters,
  ...digitalMarketingChapters,
  ...uiUxChapters,
  ...reactDeveloperChapters,
  ...forwardDeployChapters,
  ...businessAnalystChapters,
  ...humanResourcesChapters,
  ...salesExecutiveChapters,
  ...payrollComplianceChapters,
  ...technicalArchitectChapters,
  ...sixSigmaChapters,
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
  ...draftInternAssessments,
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
  ...javaFullStackAssessments,
  ...pythonFullStackAssessments,
  ...dataScienceAssessments,
  ...aiMlAssessments,
  ...manualTestingAssessments,
  ...automationTestingAssessments,
  ...dataAnalyticsAssessments,
  ...devopsAssessments,
  ...mlopsAssessments,
  ...dataEngineerAssessments,
  ...digitalMarketingAssessments,
  ...uiUxAssessments,
  ...reactDeveloperAssessments,
  ...forwardDeployAssessments,
  ...businessAnalystAssessments,
  ...humanResourcesAssessments,
  ...salesExecutiveAssessments,
  ...payrollComplianceAssessments,
  ...technicalArchitectAssessments,
  ...sixSigmaAssessments,
];

const cohorts = [];

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

// Seed Attendance: seed weekday records for Diya Sharma (EMP-1004) and Meera Iyer (EMP-1005) for mid-August 2026
const seedAttendance = [
  { id: "ATT-L-001", userId: "EMP-1004", date: "2026-08-17", checkInTime: "09:05:12", checkOutTime: "18:15:22", status: "Present" },
  { id: "ATT-L-002", userId: "EMP-1004", date: "2026-08-18", checkInTime: "08:58:34", checkOutTime: "18:02:11", status: "Present" },
  { id: "ATT-L-003", userId: "EMP-1004", date: "2026-08-19", checkInTime: "09:12:00", checkOutTime: "18:30:45", status: "Present" },
  { id: "ATT-L-004", userId: "EMP-1004", date: "2026-08-20", checkInTime: "08:54:19", checkOutTime: "18:05:00", status: "Present" },
  { id: "ATT-L-005", userId: "EMP-1004", date: "2026-08-21", checkInTime: "09:02:10", checkOutTime: "17:58:12", status: "Present" },
  { id: "ATT-L-006", userId: "EMP-1004", date: "2026-08-24", checkInTime: "09:04:45", checkOutTime: "18:09:55", status: "Present" },
  { id: "ATT-L-007", userId: "EMP-1004", date: "2026-08-25", checkInTime: "09:01:23", checkOutTime: "18:14:32", status: "Present" },
  { id: "ATT-L-008", userId: "EMP-1004", date: "2026-08-26", checkInTime: "09:15:00", checkOutTime: "18:00:20", status: "Present" },
  { id: "ATT-L-009", userId: "EMP-1004", date: "2026-08-27", checkInTime: "08:55:00", checkOutTime: "18:05:15", status: "Present" },
  { id: "ATT-L-010", userId: "EMP-1004", date: "2026-08-28", checkInTime: "09:08:12", checkOutTime: "18:10:00", status: "Present" },
  { id: "ATT-L-011", userId: "EMP-1005", date: "2026-08-24", checkInTime: "09:00:00", checkOutTime: "18:00:00", status: "Present" },
  { id: "ATT-L-012", userId: "EMP-1005", date: "2026-08-25", checkInTime: "09:05:00", checkOutTime: "18:10:00", status: "Present" },
  { id: "ATT-L-013", userId: "EMP-1005", date: "2026-08-26", checkInTime: "09:10:00", checkOutTime: "18:05:00", status: "Present" },
  { id: "ATT-L-014", userId: "EMP-1005", date: "2026-08-27", checkInTime: "08:59:00", checkOutTime: "18:02:00", status: "Present" },
  { id: "ATT-L-015", userId: "EMP-1005", date: "2026-08-28", checkInTime: "09:03:00", checkOutTime: "17:59:00", status: "Present" }
];
const attendanceLogs = [...seedAttendance];

// Seed Performance Reviews:
const seedPerformanceReviews = [
  {
    id: "PR-001",
    userId: "EMP-1004",
    reviewerId: "EMP-1003",
    reviewerName: "Kabir Sethi",
    reviewDate: "2026-06-30",
    rating: 4.0,
    comments: "Diya has made excellent progress in expanding automated test suites and securing application dependencies. She demonstrates a solid grasp of secure coding principles. Her primary area of improvement is communicating test reports more frequently and actively participating in technical design discussions.",
    goals: "1. Complete advanced Python API testing course.\n2. Design and deploy regression security test suites in CI.\n3. Increase active communication during core platform architecture discussions."
  },
  {
    id: "PR-002",
    userId: "EMP-1005",
    reviewerId: "EMP-1002",
    reviewerName: "Aarav Menon",
    reviewDate: "2026-06-28",
    rating: 4.5,
    comments: "Meera is an outstanding performer in our Enterprise Sales team. She successfully closed multiple premium accounts this quarter and exceeded her sales target by 15%. She maintains excellent relations with client technical leads. Next quarter, she should focus on scaling existing accounts and mentoring junior sales specialists.",
    goals: "1. Expand recurring revenue within active enterprise accounts by 15%.\n2. Co-run onboarding workshops for two junior account executives."
  }
];
const performanceReviews = [...seedPerformanceReviews];

// Seed Communications / Announcements / Inbox messages:
const seedCommunications = [
  { id: "MSG-001", senderId: "SYSTEM", senderName: "Nalanda Institute", recipientId: "ALL", content: "Welcome to the new training semester! Please make sure to check your assigned courses and target skill paths.", sentAt: now() },
  { id: "MSG-002", senderId: "SYSTEM", senderName: "Nalanda Institute", recipientId: "ALL", content: "LMS Platform security audit is scheduled for this Sunday. Expect brief backend connectivity interruptions between 02:00 AM and 04:00 AM UTC.", sentAt: now() },
  { id: "MSG-003", senderId: "EMP-1003", senderName: "Kabir Sethi", recipientId: "EMP-1004", content: "Hi Diya, please ensure you complete the 'Secure Coding for Cloud Teams' course by the end of next week. Let me know if you run into any blockers.", sentAt: now() }
];
const communications = [...seedCommunications];
const candidateAssessments = [...seedCandidateAssessments];
let settings = { fullscreenRequired: true, cameraRequired: true, microphoneRequired: true, tabSwitchAutoSubmit: true, noiseThreshold: 70, maxAssessmentFlags: 2 };

// Video progress store (temporary before PostgreSQL migration)
const videoProgress = {}; // { "userId-courseId-chapterId": { currentTime, updatedAt } }

// ── Durable persistence (PostgreSQL when DATABASE_URL is set, else JSON file) ──
const dbPath = path.resolve(__dirname, "..", "..", "database", "db.json");
const storage = createStorage({ filePath: dbPath, databaseUrl: process.env.DATABASE_URL });

const snapshot = () => ({
  users,
  courses,
  chapters,
  assessments,
  assignments,
  cohorts,
  attempts,
  assignments,
  cohorts,
  cohorts,
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
  chapterFeedbacks,
  attendanceLogs,
  performanceReviews,
  communications,
  candidateAssessments
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
    if (data.cohorts) { cohorts.length = 0; cohorts.push(...data.cohorts); }
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
    if (data.attendanceLogs) { attendanceLogs.length = 0; attendanceLogs.push(...data.attendanceLogs); }
    if (data.performanceReviews) { performanceReviews.length = 0; performanceReviews.push(...data.performanceReviews); }
    if (data.communications) { communications.length = 0; communications.push(...data.communications); }
    if (data.candidateAssessments) { candidateAssessments.length = 0; candidateAssessments.push(...data.candidateAssessments); }
  } catch (err) {
    console.error("[persist] load failed:", err?.message || err);
    throw err;
  }
};

export {
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
  cohorts,
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
  attendanceLogs,
  performanceReviews,
  communications,
  candidateAssessments,
  questionLibrary,
};
