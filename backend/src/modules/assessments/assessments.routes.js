// Module: Assessments (CRUD, approval, status) + attempts (start, submit).
// Handlers moved verbatim from server.js; shared deps injected via ctx.
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { assessments, courses, chapters, assignments, attempts, archives, settings, now, isAdmin, ASSESSMENT_TIME_GRACE_SECONDS } from "../../core.js";
import { audit, canManageCourse, assessmentsVisibleTo, assessmentForUser, questionPointsTotal, addAssessmentTime } from "../../domain.js";
import { authenticate, requireRole, requireStepUp } from "../../middleware.js";
import { canAttemptAssessment, ENROLLMENT_STATUS } from "../enrollments/progress.service.js";
import { buildBlindExamAttempt, getBlindQuestions, recordQuestionAnswer, finalizeAttempt, manualGradeAttempt } from "./exam.service.js";
import { users } from "../../core.js";
import { canGradeAttempt, requireAttemptPermission } from "../../security/authorization.js";

export function registerAssessments(app) {
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

    app.post("/api/assessments/:id/attempts/start", authenticate, requireRole("Employee", "Manager", "Admin", "Learner", "Instructor"), (req, res) => {
    const assessment = assessments.find((item) => item.id === req.params.id && item.approval === "Approved" && item.status === "Active");
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

    try {
      const attempt = buildBlindExamAttempt({
        assessment,
        userId: req.user.id,
        userRole: req.user.role
      });

      // Strip server-side answer keys from response
      const clientSafeAttempt = {
        id: attempt.id,
        assessmentId: attempt.assessmentId,
        courseId: attempt.courseId,
        chapterId: attempt.chapterId,
        userId: attempt.userId,
        startedAt: attempt.startedAt,
        expiresAt: attempt.expiresAt,
        status: attempt.status,
        maxScore: attempt.maxScore,
        selectedQuestionIds: attempt.selectedQuestionIds,
      };

      res.status(201).json({ data: clientSafeAttempt, strictRules: assessment.strictMode ? settings : null });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // ── Blind Question Delivery (Zero Answer Key Leakage) ──
  app.get("/api/assessments/attempts/:attemptId/questions", authenticate, requireAttemptPermission("view"), (req, res) => {
    const attempt = req.authorizedAttempt;
    const assessment = assessments.find((item) => item.id === attempt.assessmentId);
    if (!assessment) return res.status(404).json({ error: "Assessment not found" });

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));

    const blindData = getBlindQuestions({ attempt, assessment, page, limit });
    res.json({ data: blindData });
  });

  // ── Autosave / Lock Question Answer ──
  app.post("/api/assessments/attempts/:attemptId/answer", authenticate, (req, res) => {
    const schema = z.object({
      questionId: z.string().min(1),
      answer: z.any()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const attempt = attempts.find((item) => item.id === req.params.attemptId);
    if (!attempt) return res.status(404).json({ error: "Attempt not found" });
    const assessment = assessments.find((item) => item.id === attempt.assessmentId);
    if (!assessment) return res.status(404).json({ error: "Assessment not found" });

    try {
      const result = recordQuestionAnswer({
        attempt,
        assessment,
        questionId: parsed.data.questionId,
        answer: parsed.data.answer,
        userId: req.user.id
      });
      res.json(result);
    } catch (err) {
      res.status(err.status || 400).json({ error: err.message });
    }
  });

  // ── Final Attempt Submission & Server-Side Scoring ──
  app.post("/api/assessments/attempts/:attemptId/submit", authenticate, (req, res) => {
    const schema = z.object({
      answers: z.record(z.string(), z.any()).optional(),
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

    const result = finalizeAttempt({
      attempt,
      assessment,
      answers: parsed.data.answers,
      autoSubmittedReason: parsed.data.autoSubmittedReason,
      tabSwitchWarnings: parsed.data.tabSwitchWarnings,
      elapsedSeconds: parsed.data.timeSpentSeconds
    });

    res.json({
      data: result.attempt,
      score: result.score,
      passed: result.passed,
      feedback: result.feedback
    });
  });

  // ── Pending Descriptive Review Queue ──
  app.get("/api/assessments/attempts/pending-review", authenticate, requireRole("Admin", "Manager", "Instructor"), (req, res) => {
    const pending = attempts.filter((attempt) => (
      attempt.status === "PendingManualReview" && canGradeAttempt(req.user, attempt)
    ));
    const decorated = pending.map((a) => {
      const user = users.find((u) => u.id === a.userId);
      const assessment = assessments.find((asm) => asm.id === a.assessmentId);
      const course = courses.find((c) => c.id === a.courseId);
      return {
        ...a,
        learnerName: user?.name || "Unknown Learner",
        learnerEmail: user?.email || "",
        assessmentTitle: assessment?.title || "",
        courseTitle: course?.title || "",
      };
    });
    res.json({ data: decorated, total: decorated.length });
  });

  // ── Manual Grading of Descriptive Answers ──
  app.post(
    "/api/assessments/attempts/:attemptId/grade",
    authenticate,
    requireRole("Admin", "Manager", "Instructor"),
    requireAttemptPermission("grade"),
    requireStepUp,
    (req, res) => {
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
    const assessment = assessments.find((item) => item.id === attempt.assessmentId);
    if (!assessment) return res.status(404).json({ error: "Assessment not found" });

    try {
      const result = manualGradeAttempt({
        attempt,
        assessment,
        evaluatorId: req.user.id,
        grades: parsed.data.grades,
        overallFeedback: parsed.data.overallFeedback
      });
      res.json(result);
    } catch (err) {
      res.status(err.status || 400).json({ error: err.message });
    }
    },
  );
}
