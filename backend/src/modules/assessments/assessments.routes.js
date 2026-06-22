// Module: Assessments (CRUD, approval, status) + attempts (start, submit).
// Handlers moved verbatim from server.js; shared deps injected via ctx.
import { z } from "zod";
import { v4 as uuid } from "uuid";

export function registerAssessments(app, ctx) {
  const {
    authenticate, requireRole, requireStepUp, assessments, courses, chapters, assignments, attempts, archives,
    settings, audit, now, isAdmin, canManageCourse, assessmentsVisibleTo, assessmentForUser,
    questionPointsTotal, addAssessmentTime, ASSESSMENT_TIME_GRACE_SECONDS,
  } = ctx;

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

  app.post("/api/assessments/:id/attempts/start", authenticate, requireRole("Employee", "Manager", "Admin"), (req, res) => {
    const assessment = assessments.find((item) => item.id === req.params.id && item.approval === "Approved" && item.status === "Active");
    if (!assessment) return res.status(404).json({ error: "Approved assessment not found" });
    const course = courses.find((item) => item.id === assessment.courseId);
    if (!course || course.approval !== "Approved" || course.status !== "Active") {
      return res.status(403).json({ error: "Assessment is not available" });
    }
    if (!isAdmin(req.user.role)) {
      const assigned = assignments.some((assignment) => assignment.userId === req.user.id && assignment.courseId === assessment.courseId);
      if (!assigned) return res.status(403).json({ error: "You are not assigned to this course" });
    }
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
    const requestedTimeSpentSeconds = parsed.data.timeSpentSeconds || elapsedSeconds;
    const timeSpentSeconds = Math.min(requestedTimeSpentSeconds, elapsedSeconds + ASSESSMENT_TIME_GRACE_SECONDS);
    if (requestedTimeSpentSeconds > elapsedSeconds + ASSESSMENT_TIME_GRACE_SECONDS) {
      audit(req.user.id, "ASSESSMENT_TIME_CLAMPED", "ASSESSMENT_ATTEMPT", attempt.id, { requestedTimeSpentSeconds, elapsedSeconds });
    }
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
}
