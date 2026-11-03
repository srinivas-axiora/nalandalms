import crypto from "node:crypto";
import { z } from "zod";
import {
  ASSESSMENT_TIME_GRACE_SECONDS,
  assessments,
  courses,
  isAdmin,
  now,
} from "../../core.js";
import { authenticate, requireRole, requireStepUp } from "../../middleware.js";
import { canCreateCandidateAssessment } from "../../security/authorization.js";
import {
  CandidateAssessmentRepositoryError,
  candidateAssessmentsPgRepository as repository,
} from "../../repositories/candidate-assessments.repository.pg.js";
import {
  blindCandidateQuestions,
  candidateAnalytics,
  evaluateCandidateSubmission,
  summarizeCandidateLink,
} from "./candidate-assessment.runtime.js";

const eventSeverity = Object.freeze({
  FACE_ABSENT: "medium",
  MULTIPLE_FACES: "high",
  GAZE_AWAY: "medium",
  DEVICE_DETECTED: "high",
  TAB_SWITCH: "high",
  FULLSCREEN_EXIT: "high",
  AUDIO_SPIKE: "low",
  CAMERA_OFF: "medium",
  MIC_OFF: "medium",
  COPY_PASTE_ATTEMPT: "high",
  WINDOW_BLUR: "medium",
});

const createSchema = z.object({
  assessmentId: z.string().min(1),
  durationMinutes: z.coerce.number().int().min(1).max(360).optional(),
  passScore: z.coerce.number().min(1).max(100).optional(),
  questionLimit: z.coerce.number().int().positive().optional(),
  proctoringRequired: z.boolean().default(true),
  fullscreenRequired: z.boolean().default(true),
  tabSwitchAutoSubmit: z.boolean().default(false),
  maxTabSwitches: z.coerce.number().int().min(1).max(10).default(3),
  expiresAt: z.string().datetime({ offset: true }).nullable().optional(),
});

const startSchema = z.object({
  candidateName: z.string().trim().min(2).max(160),
  candidateEmail: z.string().trim().email().max(320),
});

const eventSchema = z.object({
  attemptToken: z.string().min(32).max(256),
  eventId: z.string().trim().min(8).max(128).regex(/^[A-Za-z0-9._:-]+$/),
  eventType: z.enum(Object.keys(eventSeverity)),
  // Accepted for compatibility but ignored; severity is server-defined.
  severity: z.enum(["low", "medium", "high"]).optional(),
  confidence: z.number().min(0).max(1).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

const submitSchema = z.object({
  attemptToken: z.string().min(32).max(256),
  answers: z.record(z.string(), z.any()),
});

const errorStatus = (error) => {
  if (!(error instanceof CandidateAssessmentRepositoryError)) return 500;
  if (["LINK_NOT_FOUND", "SESSION_NOT_FOUND"].includes(error.code)) return 404;
  if (["LINK_CLOSED", "LINK_EXPIRED"].includes(error.code)) return 403;
  if (["DUPLICATE_EMAIL", "SESSION_CLOSED"].includes(error.code)) return 409;
  if (error.code === "QUESTIONS_MISSING") return 503;
  return 500;
};

const sendError = (res, error) => {
  if (!(error instanceof CandidateAssessmentRepositoryError)) throw error;
  return res.status(errorStatus(error)).json({
    error: error.message,
    code: error.code,
    ...(error.details || {}),
  });
};

const canManage = (user, link) => isAdmin(user.role) || link.createdBy === user.id;
const withoutAnswerSnapshot = (link) => {
  const { questionSnapshot: _questionSnapshot, ...safe } = link;
  return safe;
};

export function registerCandidateAssessmentsPg(app) {
  app.post(
    "/api/candidate-assessments",
    authenticate,
    requireRole("Admin", "Manager", "Instructor"),
    async (req, res) => {
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
      const assessment = assessments.find((item) => item.id === parsed.data.assessmentId);
      if (!assessment) return res.status(404).json({ error: "Assessment not found" });
      if (!canCreateCandidateAssessment(req.user, assessment)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const sourceQuestions = assessment.questions || [];
      if (!sourceQuestions.length) return res.status(409).json({ error: "Assessment questions are not configured" });
      const course = courses.find((item) => item.id === assessment.courseId);
      if (!course) return res.status(409).json({ error: "Assessment course is not available" });
      if (parsed.data.expiresAt && Date.parse(parsed.data.expiresAt) <= Date.now()) {
        return res.status(400).json({ error: "expiresAt must be in the future" });
      }
      const questionLimit = Math.min(
        parsed.data.questionLimit || assessment.questionLimit || sourceQuestions.length,
        sourceQuestions.length
      );
      const token = crypto.randomBytes(32).toString("hex");
      const link = {
        id: `CAL-${crypto.randomBytes(16).toString("hex").toUpperCase()}`,
        assessmentId: assessment.id,
        title: assessment.title,
        courseId: assessment.courseId,
        courseTitle: course.title,
        chapterId: assessment.chapterId || null,
        durationMinutes: parsed.data.durationMinutes || assessment.durationMinutes || 30,
        passScore: parsed.data.passScore || assessment.passScore || 70,
        questionLimit,
        proctoringRequired: parsed.data.proctoringRequired !== false,
        fullscreenRequired: parsed.data.fullscreenRequired !== false,
        tabSwitchAutoSubmit: parsed.data.tabSwitchAutoSubmit,
        maxTabSwitches: parsed.data.maxTabSwitches,
        expiresAt: parsed.data.expiresAt || null,
        createdBy: req.user.id,
        createdByName: req.user.name,
        createdAt: now(),
      };
      try {
        const created = await repository.createLink({
          link,
          token,
          questions: structuredClone(sourceQuestions.slice(0, questionLimit)),
        });
        return res.status(201).json({
          ok: true,
          data: { ...withoutAnswerSnapshot(created), token },
          shareableUrl: `/candidate-assessment/${token}`,
        });
      } catch (error) {
        return sendError(res, error);
      }
    }
  );

  app.get("/api/candidate-assessments", authenticate, async (req, res) => {
    const links = await repository.listForUser(req.user);
    const data = links.map(summarizeCandidateLink);
    return res.json({ data, total: data.length });
  });

  app.get("/api/candidate-assessments/analytics/:id", authenticate, async (req, res) => {
    const link = await repository.findByIdentifier(req.params.id);
    if (!link) return res.status(404).json({ error: "Candidate assessment not found" });
    if (!canManage(req.user, link)) return res.status(403).json({ error: "Forbidden" });
    return res.json({ ok: true, ...candidateAnalytics(link) });
  });

  app.get("/api/candidate-assessments/:id", authenticate, async (req, res) => {
    const link = await repository.findByIdentifier(req.params.id);
    if (!link) return res.status(404).json({ error: "Candidate assessment not found" });
    if (!canManage(req.user, link)) return res.status(403).json({ error: "Forbidden" });
    return res.json({ ok: true, data: withoutAnswerSnapshot(link) });
  });

  app.patch("/api/candidate-assessments/:id/status", authenticate, requireStepUp, async (req, res) => {
    const link = await repository.findByIdentifier(req.params.id);
    if (!link) return res.status(404).json({ error: "Candidate assessment not found" });
    if (!canManage(req.user, link)) return res.status(403).json({ error: "Forbidden" });
    try {
      const updated = await repository.toggleStatus({ identifier: link.id, actorId: req.user.id });
      return res.json({ ok: true, status: updated.status });
    } catch (error) {
      return sendError(res, error);
    }
  });

  app.post("/api/candidate-assessments/:id/rotate-token", authenticate, requireStepUp, async (req, res) => {
    const link = await repository.findByIdentifier(req.params.id);
    if (!link) return res.status(404).json({ error: "Candidate assessment not found" });
    if (!canManage(req.user, link)) return res.status(403).json({ error: "Forbidden" });
    const token = crypto.randomBytes(32).toString("hex");
    try {
      const updated = await repository.rotateToken({ identifier: link.id, actorId: req.user.id, token });
      return res.json({
        ok: true,
        data: { id: updated.id, token, tokenHint: updated.tokenHint },
        shareableUrl: `/candidate-assessment/${token}`,
      });
    } catch (error) {
      return sendError(res, error);
    }
  });

  app.delete("/api/candidate-assessments/:id", authenticate, requireStepUp, async (req, res) => {
    const link = await repository.findByIdentifier(req.params.id);
    if (!link) return res.status(404).json({ error: "Candidate assessment not found" });
    if (!canManage(req.user, link)) return res.status(403).json({ error: "Forbidden" });
    try {
      await repository.deleteLink({ identifier: link.id, actorId: req.user.id });
      return res.json({ ok: true, message: "Assessment link deleted successfully" });
    } catch (error) {
      return sendError(res, error);
    }
  });

  app.get("/api/public/candidate-assessments/:token", async (req, res) => {
    const link = await repository.findPublicByToken(req.params.token);
    if (!link) return res.status(404).json({ error: "Candidate assessment link not found or expired" });
    if (link.status !== "Active") return res.status(403).json({ error: "This assessment link is currently closed" });
    if (link.isExpired) return res.status(403).json({ error: "This assessment link has expired" });
    return res.json({
      ok: true,
      data: {
        id: link.id,
        title: link.title,
        courseTitle: link.courseTitle,
        durationMinutes: link.durationMinutes,
        passScore: link.passScore,
        totalQuestions: link.questionLimit,
        proctoringRequired: link.proctoringRequired,
        fullscreenRequired: link.fullscreenRequired,
        tabSwitchAutoSubmit: link.tabSwitchAutoSubmit,
        maxTabSwitches: link.maxTabSwitches,
        status: link.status,
      },
    });
  });

  app.post("/api/public/candidate-assessments/:token/start", async (req, res) => {
    const parsed = startSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const attemptToken = crypto.randomBytes(32).toString("hex");
    try {
      const result = await repository.startSubmission({
        token: req.params.token,
        attemptToken,
        graceSeconds: ASSESSMENT_TIME_GRACE_SECONDS,
        submission: {
          id: `CAS-${crypto.randomBytes(16).toString("hex").toUpperCase()}`,
          candidateName: parsed.data.candidateName,
          candidateEmail: parsed.data.candidateEmail.toLowerCase(),
        },
      });
      return res.status(201).json({
        ok: true,
        attemptToken,
        submissionId: result.submission.id,
        candidateName: result.submission.candidateName,
        candidateEmail: result.submission.candidateEmail,
        durationMinutes: result.link.durationMinutes,
        passScore: result.link.passScore,
        questions: blindCandidateQuestions(result.questions),
        startedAt: result.submission.startedAt,
        expiresAt: result.submission.expiresAt,
      });
    } catch (error) {
      return sendError(res, error);
    }
  });

  app.post("/api/public/candidate-assessments/:token/event", async (req, res) => {
    const parsed = eventSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const metadata = parsed.data.metadata || {};
    if (Buffer.byteLength(JSON.stringify(metadata), "utf8") > 4096) {
      return res.status(413).json({ error: "Event metadata exceeds 4096 bytes" });
    }
    try {
      const result = await repository.recordEvent({
        token: req.params.token,
        attemptToken: parsed.data.attemptToken,
        event: {
          id: `CPE-${crypto.randomBytes(16).toString("hex").toUpperCase()}`,
          clientEventId: parsed.data.eventId,
          eventType: parsed.data.eventType,
          severity: eventSeverity[parsed.data.eventType],
          confidence: parsed.data.confidence ?? 1,
          metadata,
          createdAt: now(),
        },
      });
      if (result.expired) return res.status(403).json({ error: "Assessment time has expired" });
      return res.json({
        ok: true,
        trustScore: result.submission.trustScore,
        tabSwitchCount: result.submission.tabSwitchCount,
        ignoredProctoring: result.submission.ignoredProctoring,
        proctoringStatus: result.submission.proctoringStatus,
        autoSubmitted: result.autoSubmitted,
        replayed: result.replayed,
      });
    } catch (error) {
      return sendError(res, error);
    }
  });

  app.post("/api/public/candidate-assessments/:token/submit", async (req, res) => {
    const parsed = submitSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    if (Object.keys(parsed.data.answers).length > 500
      || Buffer.byteLength(JSON.stringify(parsed.data.answers), "utf8") > 64 * 1024) {
      return res.status(413).json({ error: "Answer payload is too large" });
    }
    try {
      const result = await repository.submit({
        token: req.params.token,
        attemptToken: parsed.data.attemptToken,
        evaluate: ({ submission, questions, passScore, maxTabSwitches }) => evaluateCandidateSubmission({
          submission,
          questions,
          answers: parsed.data.answers,
          passScore,
          maxTabSwitches,
        }),
      });
      if (result.expired) {
        return res.status(403).json({ error: "Assessment time has expired; saved answers were not accepted" });
      }
      const submission = result.submission;
      return res.json({
        ok: true,
        result: {
          submissionId: submission.id,
          candidateName: submission.candidateName,
          candidateEmail: submission.candidateEmail,
          score: submission.score,
          maxScore: submission.maxScore,
          percentage: submission.percentage,
          passed: submission.passed,
          status: submission.status,
          requiresManualReview: submission.requiresManualReview,
          trustScore: submission.trustScore,
          ignoredProctoring: submission.ignoredProctoring,
          proctoringStatus: submission.proctoringStatus,
          hiringRecommendation: submission.hiringRecommendation,
          timeSpentSeconds: submission.timeSpentSeconds,
          submittedAt: submission.submittedAt,
          tabSwitchCount: submission.tabSwitchCount,
          flagsCount: submission.flags.length,
          categoryBreakdown: submission.categoryBreakdown,
        },
      });
    } catch (error) {
      return sendError(res, error);
    }
  });
}
