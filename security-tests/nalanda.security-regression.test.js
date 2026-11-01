import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import bcrypt from "bcryptjs";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// This suite runs against an isolated file-store root. It is intentionally
// separate from the normal green test suite: every failing assertion is a
// release-blocking security regression that remains to be fixed.
const projectRoot = process.cwd();
const isolatedRoot = fs.mkdtempSync(path.join(os.tmpdir(), "nalanda-security-"));
process.chdir(isolatedRoot);
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "security-regression-only-secret-000000000000000000";
process.env.RAZORPAY_KEY_SECRET = "security-regression-razorpay-secret";

const { app } = await import("../backend/server.js");
const core = await import("../backend/src/core.js");
const { signToken, signStepUpToken } = await import("../backend/src/domain.js");

const unique = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const cookieFor = (user) => `token=${signToken(user)}`;
const stepUpFor = (user) => `stepUpToken=${signStepUpToken(user)}`;

async function csrfPair() {
  const response = await request(app).get("/api/csrf-token");
  const cookie = response.headers["set-cookie"].find((item) => item.startsWith("csrfToken="));
  return { token: response.body.csrfToken, cookie: cookie.split(";")[0] };
}

const learnerA = {
  id: "SEC-LEARNER-A",
  name: "Security Learner A",
  email: "security-learner-a@example.test",
  passwordHash: bcrypt.hashSync("SecurityOnly123!", 10),
  role: "Learner",
  department: "Security",
  team: "Red",
  status: "Active",
};
const learnerB = {
  ...learnerA,
  id: "SEC-LEARNER-B",
  name: "Security Learner B",
  email: "security-learner-b@example.test",
  team: "Blue",
};
const paymentLearner = {
  ...learnerA,
  id: "SEC-PAYMENT-LEARNER",
  name: "Security Payment Learner",
  email: "security-payment-learner@example.test",
};
const foreignInstructor = {
  ...learnerA,
  id: "SEC-INSTRUCTOR-FOREIGN",
  name: "Foreign Instructor",
  email: "foreign-instructor@example.test",
  role: "Instructor",
};
const courseA = {
  id: "SEC-COURSE-A",
  title: "Security Course A",
  description: "Security regression fixture course A",
  skill: "Security",
  ownerId: "EMP-1003",
  approval: "Approved",
  status: "Active",
  isFree: false,
  priceCents: 10000,
  currency: "INR",
  prerequisites: [],
};
const courseB = {
  ...courseA,
  id: "SEC-COURSE-B",
  title: "Security Course B",
  description: "Security regression fixture course B",
  priceCents: 900000,
};
const assessment = {
  id: "SEC-ASSESSMENT-A",
  courseId: courseA.id,
  title: "Security Assessment",
  approval: "Approved",
  status: "Active",
  durationMinutes: 1,
  passScore: 70,
  strictMode: true,
  ownerId: "EMP-1003",
  questions: [{
    id: "SEC-Q-1",
    type: "MCQ",
    prompt: "Secure answer?",
    options: ["No", "Yes"],
    answer: 1,
    points: 100,
  }],
};
const victimAttempt = {
  id: "SEC-VICTIM-ATTEMPT",
  assessmentId: assessment.id,
  courseId: courseA.id,
  userId: learnerB.id,
  startedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  expiresAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  submittedAt: null,
  status: "InProgress",
  score: null,
  maxScore: 100,
  answers: {},
  selectedQuestionIds: ["SEC-Q-1"],
  questionMap: {
    "SEC-Q-1": {
      prompt: "Secure answer?",
      type: "MCQ",
      points: 100,
      options: ["No", "Yes"],
      correctIndex: 1,
      originalIndex: 1,
    },
  },
  flags: [],
};

beforeAll(async () => {
  await core.storage.init();
  for (const user of [learnerA, learnerB, paymentLearner, foreignInstructor]) {
    if (!core.users.some((item) => item.id === user.id)) core.users.push(user);
    core.sessionVersions[user.id] = 0;
  }
  for (const course of [courseA, courseB]) {
    if (!core.courses.some((item) => item.id === course.id)) core.courses.push(course);
  }
  if (!core.assessments.some((item) => item.id === assessment.id)) core.assessments.push(assessment);
  if (!core.assignments.some((item) => item.courseId === courseA.id && item.userId === learnerA.id)) {
    core.assignments.push({
      id: "SEC-ENROLLMENT-A",
      courseId: courseA.id,
      userId: learnerA.id,
      assignedBy: "EMP-1003",
      progress: 0,
      completedChapters: [],
      chapterTimeSpentSeconds: {},
      timeSpentSeconds: 0,
      status: "Enrolled",
    });
  }
  if (!core.attempts.some((item) => item.id === victimAttempt.id)) core.attempts.push(victimAttempt);
  core.chapters.push(
    {
      id: "SEC-CHAPTER-1",
      courseId: courseA.id,
      sequence: 1,
      title: "First chapter",
      body: "First chapter body",
      minimumTimeMinutes: 10,
    },
    {
      id: "SEC-CHAPTER-2",
      courseId: courseA.id,
      sequence: 2,
      title: "Locked chapter",
      body: "CONFIDENTIAL LOCKED CONTENT",
      minimumTimeMinutes: 10,
    },
  );
  core.candidateAssessments.push({
    id: "SEC-CANDIDATE-LINK",
    token: "sec-expired-candidate-token",
    assessmentId: assessment.id,
    title: assessment.title,
    courseId: courseA.id,
    courseTitle: courseA.title,
    durationMinutes: 30,
    passScore: 70,
    questionLimit: 1,
    status: "Active",
    createdBy: "EMP-1003",
    expiresAt: new Date(Date.now() - 60_000).toISOString(),
    submissions: [{
      id: "SEC-CANDIDATE-SUBMISSION",
      candidateName: "Private Candidate",
      candidateEmail: "private-candidate@example.test",
      submittedAt: new Date().toISOString(),
      percentage: 100,
      score: 100,
      maxScore: 100,
      passed: true,
      evaluatedResponses: [{ questionId: "SEC-Q-1", correctAnswer: 1 }],
    }],
  });
});

afterAll(() => {
  process.chdir(projectRoot);
  fs.rmSync(isolatedRoot, { recursive: true, force: true });
});

describe("Nalanda release-blocking security regressions", () => {
  it("SEC-001 public registration cannot self-assign Instructor", async () => {
    const csrf = await csrfPair();
    const response = await request(app)
      .post("/api/auth/register")
      .set("Cookie", csrf.cookie)
      .set("x-csrf-token", csrf.token)
      .send({
        name: "Untrusted Applicant",
        email: `${unique("applicant")}@example.test`,
        password: "SecurityOnly123!",
        role: "Instructor",
      });

    expect(response.status).toBe(201);
    expect(response.body.user.role).toBe("Learner");
  });

  it("SEC-002 learners cannot retrieve question-bank answer keys", async () => {
    const response = await request(app)
      .get("/api/assessments/question-library?limit=5")
      .set("Cookie", cookieFor(learnerA));

    expect(response.status).toBe(403);
    expect(JSON.stringify(response.body)).not.toMatch(/\"answer\"|\"correctAnswer\"|\"expectedAnswer\"/);
  });

  it("SEC-003 foreign users cannot read candidate analytics or PII", async () => {
    const response = await request(app)
      .get("/api/candidate-assessments/analytics/SEC-CANDIDATE-LINK")
      .set("Cookie", cookieFor(learnerA));

    expect(response.status).toBe(403);
    expect(JSON.stringify(response.body)).not.toContain("private-candidate@example.test");
  });

  it("SEC-004 foreign instructors cannot terminate another course's exam", async () => {
    victimAttempt.status = "InProgress";
    victimAttempt.submittedAt = null;
    const csrf = await csrfPair();
    const response = await request(app)
      .post(`/api/proctoring/attempts/${victimAttempt.id}/terminate`)
      .set("Cookie", `${csrf.cookie}; ${cookieFor(foreignInstructor)}`)
      .set("x-csrf-token", csrf.token)
      .send({ reason: "Unauthorized security regression attempt" });

    expect(response.status).toBe(403);
    expect(victimAttempt.status).toBe("InProgress");
  });

  it("SEC-005 unrelated users cannot read WebRTC signaling for an attempt", async () => {
    const response = await request(app)
      .get(`/api/proctoring/attempts/${victimAttempt.id}/signals`)
      .set("Cookie", cookieFor(learnerA));

    expect(response.status).toBe(403);
  });

  it("SEC-006 payment verification fails closed without a signature and rejects course substitution", async () => {
    const csrf = await csrfPair();
    const order = await request(app)
      .post("/api/payments/create-order")
      .set("Cookie", `${csrf.cookie}; ${cookieFor(paymentLearner)}`)
      .set("x-csrf-token", csrf.token)
      .send({ courseId: courseA.id });
    expect(order.status).toBe(200);

    const verification = await request(app)
      .post("/api/payments/verify")
      .set("Cookie", `${csrf.cookie}; ${cookieFor(paymentLearner)}`)
      .set("x-csrf-token", csrf.token)
      .send({
        orderId: order.body.orderId,
        paymentId: unique("pay"),
        courseId: courseB.id,
      });

    expect(verification.status).toBe(400);
    expect(core.assignments.some((item) => item.userId === paymentLearner.id && item.courseId === courseB.id)).toBe(false);
  });

  it("SEC-007 learner direct uploads and public file delivery are denied", async () => {
    const csrf = await csrfPair();
    const upload = await request(app)
      .put("/api/uploads/direct?key=security-probe.html")
      .set("Cookie", `${csrf.cookie}; ${cookieFor(learnerA)}`)
      .set("x-csrf-token", csrf.token)
      .set("Content-Type", "text/html")
      .send("<script>document.body.dataset.compromised='true'</script>");
    const publicRead = await request(app).get("/uploads/security-probe.html");

    expect(upload.status).toBe(403);
    expect([401, 403, 404]).toContain(publicRead.status);
  });

  it("SEC-008 expired attempts reject bulk final answers", async () => {
    victimAttempt.status = "InProgress";
    victimAttempt.submittedAt = null;
    victimAttempt.answers = {};
    const csrf = await csrfPair();
    const response = await request(app)
      .post(`/api/assessments/attempts/${victimAttempt.id}/submit`)
      .set("Cookie", `${csrf.cookie}; ${cookieFor(learnerB)}`)
      .set("x-csrf-token", csrf.token)
      .send({ answers: { "SEC-Q-1": 1 } });

    expect([403, 409]).toContain(response.status);
    expect(victimAttempt.answers["SEC-Q-1"]).toBeUndefined();
  });

  it("SEC-009 foreign instructors cannot issue arbitrary certificates", async () => {
    const csrf = await csrfPair();
    const response = await request(app)
      .post("/api/certificates")
      .set("Cookie", `${csrf.cookie}; ${cookieFor(foreignInstructor)}`)
      .set("x-csrf-token", csrf.token)
      .send({ employeeId: learnerA.id, courseId: courseA.id });

    expect(response.status).toBe(403);
  });

  it("SEC-010 logout invalidates the JWT that was presented", async () => {
    const csrf = await csrfPair();
    const authCookie = cookieFor(learnerA);
    const logout = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", `${csrf.cookie}; ${authCookie}`)
      .set("x-csrf-token", csrf.token)
      .send({});
    expect(logout.status).toBe(200);

    const replay = await request(app).get("/api/auth/me").set("Cookie", authCookie);
    expect(replay.status).toBe(401);
  });

  it("SEC-011 locked chapter content is not returned to the learner", async () => {
    const response = await request(app)
      .get(`/api/courses/${courseA.id}/chapters`)
      .set("Cookie", cookieFor(learnerA));
    const locked = response.body.data.find((item) => item.id === "SEC-CHAPTER-2");

    expect(response.status).toBe(200);
    expect(locked.isLocked).toBe(true);
    expect(locked.body).toBeUndefined();
    expect(locked.fileName).toBeUndefined();
    expect(locked.url).toBeUndefined();
  });

  it("SEC-012 an expired candidate link cannot be started directly", async () => {
    const response = await request(app)
      .post("/api/public/candidate-assessments/sec-expired-candidate-token/start")
      .send({ candidateName: "Expired Candidate", candidateEmail: `${unique("expired")}@example.test` });

    expect(response.status).toBe(403);
  });

  it("SEC-013 companion status is scoped to the candidate or assigned proctor", async () => {
    const response = await request(app)
      .get(`/api/proctoring/attempts/${victimAttempt.id}/companion/status`)
      .set("Cookie", cookieFor(learnerA));

    expect(response.status).toBe(403);
  });

  it("SEC-014 password hashes are redacted from audit responses", async () => {
    const admin = core.users.find((item) => item.role === "Admin");
    const csrf = await csrfPair();
    const update = await request(app)
      .patch(`/api/users/${learnerA.id}`)
      .set("Cookie", `${csrf.cookie}; ${cookieFor(admin)}; ${stepUpFor(admin)}`)
      .set("x-csrf-token", csrf.token)
      .send({ password: "ReplacementSecurity123!" });
    expect(update.status).toBe(200);

    const logs = await request(app).get("/api/audit-logs").set("Cookie", cookieFor(admin));
    const event = logs.body.data.find(
      (item) => item.action === "UPDATE_USER" && item.entityId === learnerA.id,
    );
    expect(event).toBeDefined();
    expect(event.metadata.password).toBeUndefined();
    expect(event.metadata.passwordHash).toBeUndefined();
  });

  it("SEC-P1-001 every client-supplied privileged registration role resolves to Learner", async () => {
    for (const role of ["Admin", "Manager", "Instructor"]) {
      const csrf = await csrfPair();
      const response = await request(app)
        .post("/api/auth/register")
        .set("Cookie", csrf.cookie)
        .set("x-csrf-token", csrf.token)
        .send({
          name: `Untrusted ${role}`,
          email: `${unique(role.toLowerCase())}@example.test`,
          password: "SecurityOnly123!",
          role,
        });
      expect(response.status, role).toBe(201);
      expect(response.body.user.role, role).toBe("Learner");
    }
  });

  it("SEC-P1-002 administrator role changes revoke the subject's existing JWT", async () => {
    const admin = core.users.find((item) => item.role === "Admin");
    const oldCookie = cookieFor(learnerB);
    const csrf = await csrfPair();
    const update = await request(app)
      .patch(`/api/users/${learnerB.id}`)
      .set("Cookie", `${csrf.cookie}; ${cookieFor(admin)}; ${stepUpFor(admin)}`)
      .set("x-csrf-token", csrf.token)
      .send({ role: "Employee" });
    expect(update.status).toBe(200);

    const replay = await request(app).get("/api/auth/me").set("Cookie", oldCookie);
    expect(replay.status).toBe(401);
  });

  it("SEC-P1-003 administrator password changes revoke the subject's existing JWT", async () => {
    const admin = core.users.find((item) => item.role === "Admin");
    const oldCookie = cookieFor(paymentLearner);
    const csrf = await csrfPair();
    const update = await request(app)
      .patch(`/api/users/${paymentLearner.id}`)
      .set("Cookie", `${csrf.cookie}; ${cookieFor(admin)}; ${stepUpFor(admin)}`)
      .set("x-csrf-token", csrf.token)
      .send({ password: "RotatedSecurityPassword123!" });
    expect(update.status).toBe(200);

    const replay = await request(app).get("/api/auth/me").set("Cookie", oldCookie);
    expect(replay.status).toBe(401);
  });

  it("SEC-P1-004 an authorized course owner needs step-up for proctor controls", async () => {
    const owner = core.users.find((item) => item.id === courseA.ownerId);
    victimAttempt.status = "InProgress";
    victimAttempt.isPaused = false;
    const csrf = await csrfPair();
    const response = await request(app)
      .post(`/api/proctoring/attempts/${victimAttempt.id}/pause`)
      .set("Cookie", `${csrf.cookie}; ${cookieFor(owner)}`)
      .set("x-csrf-token", csrf.token)
      .send({});

    expect(response.status).toBe(412);
    expect(victimAttempt.status).toBe("InProgress");
  });

  it("SEC-P1-005 a foreign instructor cannot manually grade another owner's attempt", async () => {
    const reviewAttempt = {
      ...victimAttempt,
      id: "SEC-FOREIGN-GRADE-ATTEMPT",
      status: "PendingManualReview",
      submittedAt: new Date().toISOString(),
      answers: {},
    };
    core.attempts.push(reviewAttempt);
    const csrf = await csrfPair();
    const response = await request(app)
      .post(`/api/assessments/attempts/${reviewAttempt.id}/grade`)
      .set("Cookie", `${csrf.cookie}; ${cookieFor(foreignInstructor)}; ${stepUpFor(foreignInstructor)}`)
      .set("x-csrf-token", csrf.token)
      .send({ grades: {}, overallFeedback: "Unauthorized grading attempt" });

    expect(response.status).toBe(403);
    expect(reviewAttempt.evaluatedBy).toBeUndefined();
  });

  it("SEC-P1-006 companion heartbeat rejects requests without its scoped token", async () => {
    victimAttempt.companion = {
      paired: true,
      pairedAt: new Date().toISOString(),
      lastPingAt: new Date().toISOString(),
      deviceName: "Security companion",
    };
    const response = await request(app)
      .post(`/api/proctoring/attempts/${victimAttempt.id}/companion/ping`)
      .send({ batteryLevel: 50 });

    expect([401, 403]).toContain(response.status);
  });
});
