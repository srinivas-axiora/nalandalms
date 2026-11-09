// Module: Assessments (CRUD, approval, status) + attempts (start, submit).
// Handlers moved verbatim from server.js; shared deps injected via ctx.
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { assessments, courses, chapters, assignments, attempts, archives, settings, now, isAdmin } from "../../core.js";
import { audit, canManageCourse, assessmentsVisibleTo, assessmentForUser, questionPointsTotal, addAssessmentTime } from "../../domain.js";
import { authenticate, requireRole, requireStepUp } from "../../middleware.js";
import { canAttemptAssessment, ENROLLMENT_STATUS } from "../enrollments/progress.service.js";
import { buildBlindExamAttempt, getBlindQuestions, recordQuestionAnswer, finalizeAttempt, manualGradeAttempt } from "./exam.service.js";
import { users } from "../../core.js";
import { canGradeAttempt, requireAttemptPermission } from "../../security/authorization.js";
import { attemptsRepository, AttemptRepositoryError } from "../../repositories/attempts.repository.pg.js";
import { upsertAttemptProjection } from "../../attempt-projection.js";
import { registerAssessmentAuthoringPgRoutes, sendAssessmentAuthorityError } from "./assessments.pg.routes.js";
import { assessmentAuthorityRepository, AssessmentAuthorityError } from "../../repositories/assessment-authority.repository.pg.js";
import { identityRepository } from "../../repositories/identity.repository.pg.js";
import { settingsRepository } from "../../repositories/settings.repository.pg.js";
import { relationalAttemptsEnabled, relationalSettingsEnabled } from "../../runtime-modes.js";

const USE_PG_COURSES = process.env.USE_PG_COURSES === "1";
const USE_RELATIONAL_SETTINGS = relationalSettingsEnabled();
const USE_RELATIONAL_ATTEMPTS = relationalAttemptsEnabled();
const findAssessmentRuntime = (id) => USE_PG_COURSES
  ? assessmentAuthorityRepository.findRuntimeById(id)
  : Promise.resolve(assessments.find((item) => item.id === id));
const assessmentForAttempt = (attempt) => USE_PG_COURSES
  ? Promise.resolve({
      id: attempt.assessmentId,
      durationMinutes: attempt.durationMinutesSnapshot || 15,
      passScore: attempt.passScoreSnapshot || 70,
    })
  : findAssessmentRuntime(attempt.assessmentId);

const attemptErrorStatus = (error) => {
  if (!(error instanceof AttemptRepositoryError)) return error.status || 400;
  if (error.code === "ATTEMPT_NOT_FOUND") return 404;
  if (["ATTEMPT_CONFLICT", "ATTEMPT_CLOSED"].includes(error.code)) return 409;
  return 500;
};

const enrollmentTransition = (attempt, { includeAttemptTime = true } = {}) => ({
  status: ["Passed", "Failed"].includes(attempt.status) ? attempt.status : null,
  addTimeSeconds: includeAttemptTime ? (attempt.timeSpentSeconds || 0) : 0,
  completedAt: attempt.status === "Passed" ? now() : null,
});

export function registerAssessments(app) {
  if (USE_PG_COURSES) registerAssessmentAuthoringPgRoutes(app);
  else {
  app.get("/api/assessments", authenticate, (req, res) => {
    const visible = assessmentsVisibleTo(req.user);
    res.json({ data: visible.map((item) => assessmentForUser(item, req.user)), total: visible.length });
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
  app.put("/api/assessments/:id", authenticate, requireRole("Admin", "Manager"), (req, res) => {
    const schema = z.object({
      title: z.string().min(4).optional(),
      courseId: z.string().optional(),
      chapterId: z.string().optional(),
      difficulty: z.string().optional(),
      durationMinutes: z.coerce.number().min(1).optional(),
      passScore: z.coerce.number().min(1).max(100).optional(),
      questionLimit: z.coerce.number().int().positive().optional(),
      questions: z.array(z.record(z.string(), z.any())).min(1).optional()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const assessment = assessments.find((item) => item.id === req.params.id);
    if (!assessment) return res.status(404).json({ error: "Assessment not found" });

    const course = courses.find((item) => item.id === (parsed.data.courseId || assessment.courseId));
    if (!course) return res.status(404).json({ error: "Course not found" });
    if (!canManageCourse(req.user, course)) return res.status(403).json({ error: "Forbidden" });

    Object.assign(assessment, parsed.data, { updatedAt: now() });
    audit(req.user.id, "UPDATE_ASSESSMENT", "ASSESSMENT", assessment.id, parsed.data);
    res.json({ data: assessment });
  });

  app.patch("/api/assessments/:id/status", authenticate, requireRole("Admin", "Manager"), requireStepUp, (req, res) => {
    const schema = z.object({ status: z.enum(["Active", "Inactive"]) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const assessment = assessments.find((item) => item.id === req.params.id);
    if (!assessment) return res.status(404).json({ error: "Assessment not found" });

    assessment.status = parsed.data.status;
    audit(req.user.id, "ASSESSMENT_STATUS", "ASSESSMENT", assessment.id, parsed.data);
    res.json({ data: assessment });
  });

  app.delete("/api/assessments/:id", authenticate, requireRole("Admin", "Manager"), requireStepUp, (req, res) => {
    const schema = z.object({ deletionComment: z.string().min(10) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const idx = assessments.findIndex((item) => item.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Assessment not found" });
    const assessment = assessments[idx];

    const course = courses.find((item) => item.id === assessment.courseId);
    if (course && !canManageCourse(req.user, course)) return res.status(403).json({ error: "Forbidden" });

    archives.unshift({
      id: uuid(),
      entityType: "Assessment",
      entityId: assessment.id,
      entityData: { ...assessment },
      deletedBy: req.user.id,
      deletedByName: req.user.name,
      deletionComment: parsed.data.deletionComment,
      deletedAt: now()
    });

    assessments.splice(idx, 1);
    audit(req.user.id, "DELETE_ASSESSMENT", "ASSESSMENT", assessment.id);
    res.json({ success: true, message: "Assessment permanently deleted and archived" });
  });

  app.patch("/api/assessments/:id/approval", authenticate, requireRole("Admin"), requireStepUp, (req, res) => {
    const schema = z.object({ approval: z.enum(["Approved", "Rejected"]), feedback: z.string().optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const assessment = assessments.find((item) => item.id === req.params.id);
    if (!assessment) return res.status(404).json({ error: "Assessment not found" });
    assessment.approval = parsed.data.approval;
    audit(req.user.id, "ASSESSMENT_APPROVAL", "ASSESSMENT", assessment.id, parsed.data);
    res.json({ data: assessment });
  });
  }

  app.post("/api/assessments/:id/attempts/start", authenticate, requireRole("Employee", "Manager", "Admin", "Learner", "Instructor"), async (req, res) => {
    try {
      // Resolve operational policy before creating an attempt so a settings
      // authority outage cannot return failure after durable state changed.
      const authoritativeSettings = USE_RELATIONAL_SETTINGS
        ? await settingsRepository.getProctoring()
        : settings;
      let assessment;
      let committedAttempt;
      if (USE_PG_COURSES) {
        const started = await assessmentAuthorityRepository.startAttempt({
          assessmentId: req.params.id,
          actor: req.user,
          buildAttempt: (runtimeAssessment) => buildBlindExamAttempt({
            assessment: runtimeAssessment,
            userId: req.user.id,
            userRole: req.user.role,
            persistSideEffects: false,
          }),
        });
        assessment = started.assessment;
        committedAttempt = upsertAttemptProjection(started.attempt);
      } else {
        assessment = assessments.find((item) => item.id === req.params.id && item.approval === "Approved" && item.status === "Active");
        if (!assessment) return res.status(404).json({ error: "Approved assessment not found" });
        const course = courses.find((item) => item.id === assessment.courseId);
        if (!course || course.approval !== "Approved" || course.status !== "Active") {
          return res.status(403).json({ error: "Assessment is not available" });
        }
        if (!isAdmin(req.user.role)) {
          const attemptCheck = canAttemptAssessment({ courseId: assessment.courseId, userId: req.user.id, userRole: req.user.role });
          if (!attemptCheck.allowed) {
            return res.status(403).json({ error: attemptCheck.error, details: attemptCheck });
          }
        }
        const attempt = buildBlindExamAttempt({
          assessment,
          userId: req.user.id,
          userRole: req.user.role,
          persistSideEffects: !USE_RELATIONAL_ATTEMPTS,
        });
        committedAttempt = USE_RELATIONAL_ATTEMPTS
          ? upsertAttemptProjection(await attemptsRepository.insert(attempt))
          : attempt;
      }

      // Strip server-side answer keys from response
      const clientSafeAttempt = {
        id: committedAttempt.id,
        assessmentId: committedAttempt.assessmentId,
        courseId: committedAttempt.courseId,
        chapterId: committedAttempt.chapterId,
        userId: committedAttempt.userId,
        startedAt: committedAttempt.startedAt,
        expiresAt: committedAttempt.expiresAt,
        status: committedAttempt.status,
        maxScore: committedAttempt.maxScore,
        selectedQuestionIds: committedAttempt.selectedQuestionIds,
      };

      const strictRules = assessment.strictMode
        ? authoritativeSettings
        : null;
      res.status(201).json({ data: clientSafeAttempt, strictRules });
    } catch (err) {
      if (err instanceof AssessmentAuthorityError) return sendAssessmentAuthorityError(res, err);
      res.status(attemptErrorStatus(err)).json({ error: err.message });
    }
  });

  // ── Blind Question Delivery (Zero Answer Key Leakage) ──
  app.get("/api/assessments/attempts/:attemptId/questions", authenticate, requireAttemptPermission("view"), async (req, res) => {
    const attempt = req.authorizedAttempt;
    const assessment = await assessmentForAttempt(attempt);
    if (!assessment) return res.status(404).json({ error: "Assessment not found" });

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));

    try {
      const originalVersion = attempt.version;
      const wasSubmitted = Boolean(attempt.submittedAt);
      const blindData = getBlindQuestions({
        attempt,
        assessment,
        page,
        limit,
        persistSideEffects: !USE_RELATIONAL_ATTEMPTS,
      });
      if (USE_RELATIONAL_ATTEMPTS && !wasSubmitted && attempt.submittedAt) {
        const saved = await attemptsRepository.save(attempt, {
          expectedVersion: originalVersion,
          actorId: attempt.userId,
          action: "AUTO_SUBMIT_EXAM_ATTEMPT",
          metadata: { reason: attempt.autoSubmittedReason },
          enrollment: enrollmentTransition(attempt),
        });
        upsertAttemptProjection(saved);
      }
      res.json({ data: blindData });
    } catch (err) {
      res.status(attemptErrorStatus(err)).json({ error: err.message });
    }
  });

  // ── Autosave / Lock Question Answer ──
  app.post("/api/assessments/attempts/:attemptId/answer", authenticate, async (req, res) => {
    const schema = z.object({
      questionId: z.string().min(1),
      answer: z.any()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const attempt = USE_RELATIONAL_ATTEMPTS
      ? await attemptsRepository.findById(req.params.attemptId)
      : attempts.find((item) => item.id === req.params.attemptId);
    if (!attempt) return res.status(404).json({ error: "Attempt not found" });
    const assessment = await assessmentForAttempt(attempt);
    if (!assessment) return res.status(404).json({ error: "Assessment not found" });

    try {
      const result = recordQuestionAnswer({
        attempt,
        assessment,
        questionId: parsed.data.questionId,
        answer: parsed.data.answer,
        userId: req.user.id
      });
      if (USE_RELATIONAL_ATTEMPTS) {
        const saved = await attemptsRepository.save(attempt, {
          expectedVersion: attempt.version,
          guard: "answer",
          actorId: req.user.id,
          action: "SAVE_EXAM_ANSWER",
          metadata: { questionId: parsed.data.questionId },
        });
        upsertAttemptProjection(saved);
      }
      res.json(result);
    } catch (err) {
      if (USE_RELATIONAL_ATTEMPTS && attempt.submittedAt) {
        try {
          const saved = await attemptsRepository.save(attempt, {
            expectedVersion: attempt.version,
            actorId: req.user.id,
            action: "AUTO_SUBMIT_EXAM_ATTEMPT",
            metadata: { reason: attempt.autoSubmittedReason },
            enrollment: enrollmentTransition(attempt),
          });
          upsertAttemptProjection(saved);
        } catch (persistError) {
          return res.status(attemptErrorStatus(persistError)).json({ error: persistError.message });
        }
      }
      res.status(attemptErrorStatus(err)).json({ error: err.message });
    }
  });

  // ── Final Attempt Submission & Server-Side Scoring ──
  app.post("/api/assessments/attempts/:attemptId/submit", authenticate, async (req, res) => {
    const schema = z.object({
      answers: z.record(z.string(), z.any()).optional(),
      tabSwitchWarnings: z.coerce.number().int().min(0).optional()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const candidateAttempt = USE_RELATIONAL_ATTEMPTS
      ? await attemptsRepository.findById(req.params.attemptId)
      : attempts.find((item) => item.id === req.params.attemptId);
    const attempt = candidateAttempt?.userId === req.user.id ? candidateAttempt : null;
    if (!attempt) return res.status(404).json({ error: "Attempt not found" });
    if (attempt.submittedAt) return res.status(409).json({ error: "Attempt already submitted", data: attempt });
    const assessment = await assessmentForAttempt(attempt);
    if (!assessment) return res.status(404).json({ error: "Assessment not found" });

    try {
      const result = finalizeAttempt({
        attempt,
        assessment,
        answers: parsed.data.answers,
        tabSwitchWarnings: parsed.data.tabSwitchWarnings,
        persistSideEffects: !USE_RELATIONAL_ATTEMPTS,
      });
      if (USE_RELATIONAL_ATTEMPTS) {
        result.attempt = upsertAttemptProjection(await attemptsRepository.save(attempt, {
          expectedVersion: attempt.version,
          guard: "submit",
          actorId: req.user.id,
          action: "SUBMIT_EXAM_ATTEMPT",
          metadata: {
            score: attempt.score,
            status: attempt.status,
            timeSpentSeconds: attempt.timeSpentSeconds,
          },
          enrollment: enrollmentTransition(attempt),
        }));
      }

      res.json({
        data: result.attempt,
        score: result.score,
        passed: result.passed,
        feedback: result.feedback
      });
    } catch (err) {
      if (USE_RELATIONAL_ATTEMPTS && attempt.submittedAt) {
        try {
          const saved = await attemptsRepository.save(attempt, {
            expectedVersion: attempt.version,
            actorId: req.user.id,
            action: "AUTO_SUBMIT_EXAM_ATTEMPT",
            metadata: { reason: attempt.autoSubmittedReason },
            enrollment: enrollmentTransition(attempt),
          });
          upsertAttemptProjection(saved);
        } catch (persistError) {
          return res.status(attemptErrorStatus(persistError)).json({ error: persistError.message });
        }
      }
      res.status(attemptErrorStatus(err)).json({ error: err.message });
    }
  });

  // ── Pending Descriptive Review Queue ──
  app.get("/api/assessments/attempts/pending-review", authenticate, requireRole("Admin", "Manager", "Instructor"), async (req, res) => {
    const sourceAttempts = USE_RELATIONAL_ATTEMPTS
      ? await attemptsRepository.list({ statuses: ["PendingManualReview"] })
      : attempts;
    const pendingCandidates = sourceAttempts.filter((attempt) => attempt.status === "PendingManualReview");
    const pending = [];
    for (const attempt of pendingCandidates) {
      const permitted = canGradeAttempt(req.user, attempt)
        || (USE_PG_COURSES && await assessmentAuthorityRepository.canManageAssessment({
          id: attempt.assessmentId,
          actor: req.user,
        }));
      if (permitted) pending.push(attempt);
    }
    const relationalLearners = USE_PG_COURSES
      ? await identityRepository.findUserSummariesByIds(pending.map((attempt) => attempt.userId))
      : [];
    const relationalLearnersById = new Map(relationalLearners.map((user) => [user.id, user]));
    const decorated = await Promise.all(pending.map(async (a) => {
      const user = USE_PG_COURSES
        ? relationalLearnersById.get(a.userId)
        : users.find((u) => u.id === a.userId);
      const assessment = USE_PG_COURSES
        ? await assessmentAuthorityRepository.findById(a.assessmentId)
        : await findAssessmentRuntime(a.assessmentId);
      const course = USE_PG_COURSES ? null : courses.find((c) => c.id === a.courseId);
      return {
        ...a,
        learnerName: user?.name || "Unknown Learner",
        learnerEmail: user?.email || "",
        assessmentTitle: assessment?.title || "",
        courseTitle: assessment?.courseTitle || course?.title || "",
      };
    }));
    res.json({ data: decorated, total: decorated.length });
  });

  // ── Manual Grading of Descriptive Answers ──
  app.post(
    "/api/assessments/attempts/:attemptId/grade",
    authenticate,
    requireRole("Admin", "Manager", "Instructor"),
    requireAttemptPermission("grade"),
    requireStepUp,
    async (req, res) => {
    const schema = z.object({
      grades: z.record(z.string(), z.object({
        pointsAwarded: z.number().nonnegative(),
        feedback: z.string().optional()
      })),
      overallFeedback: z.string().optional()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const attempt = req.authorizedAttempt;
    const assessment = await assessmentForAttempt(attempt);
    if (!assessment) return res.status(404).json({ error: "Assessment not found" });

    try {
      const result = manualGradeAttempt({
        attempt,
        assessment,
        evaluatorId: req.user.id,
        grades: parsed.data.grades,
        overallFeedback: parsed.data.overallFeedback,
        persistSideEffects: !USE_RELATIONAL_ATTEMPTS,
      });
      if (USE_RELATIONAL_ATTEMPTS) {
        result.attempt = upsertAttemptProjection(await attemptsRepository.save(attempt, {
          expectedVersion: attempt.version,
          actorId: req.user.id,
          action: "MANUAL_GRADE_EXAM",
          metadata: { score: attempt.score, passed: attempt.status === "Passed" },
          enrollment: enrollmentTransition(attempt, { includeAttemptTime: false }),
        }));
      }
      res.json(result);
    } catch (err) {
      res.status(attemptErrorStatus(err)).json({ error: err.message });
    }
    },
  );
}
