import crypto from "node:crypto";
import { z } from "zod";
import { authenticate, requireRole, requireStepUp } from "../../middleware.js";
import {
  AssessmentAuthorityError,
  assessmentAuthorityRepository as repository,
} from "../../repositories/assessment-authority.repository.pg.js";

const questionSchema = z.object({
  id: z.string().trim().min(1).max(160).optional(),
  type: z.enum(["MCQ", "Descriptive"]),
  prompt: z.string().trim().min(4).max(20_000),
  options: z.array(z.string().max(5_000)).max(20).default([]),
  answer: z.any().optional(),
  correctAnswer: z.any().optional(),
  points: z.coerce.number().positive().max(10_000).default(10),
  rubric: z.any().optional(),
  category: z.string().trim().max(160).optional(),
  difficulty: z.union([z.string().max(80), z.number()]).optional(),
  explanation: z.string().max(20_000).optional(),
}).strict().superRefine((question, ctx) => {
  if (question.type !== "MCQ") return;
  if (question.options.length < 2) {
    ctx.addIssue({ code: "custom", path: ["options"], message: "MCQ requires at least two options" });
  }
  const answer = question.answer ?? question.correctAnswer;
  if (!Number.isInteger(answer) || answer < 0 || answer >= question.options.length) {
    ctx.addIssue({ code: "custom", path: ["answer"], message: "MCQ answer must be a valid option index" });
  }
});

const assessmentFields = {
  title: z.string().trim().min(4).max(240),
  chapterId: z.string().trim().min(1).max(160).nullable().optional(),
  type: z.enum(["MCQ", "Descriptive", "Timed Quiz", "Mixed"]),
  strictMode: z.boolean().default(true),
  questions: z.array(questionSchema).min(1).max(1_000),
  durationMinutes: z.coerce.number().int().min(1).max(360),
  passScore: z.coerce.number().min(1).max(100),
  questionLimit: z.coerce.number().int().positive().max(1_000).optional(),
  difficulty: z.string().trim().min(1).max(80).default("Beginner"),
};

const createSchema = z.object({
  courseId: z.string().trim().min(1).max(160),
  courseVersion: z.coerce.number().int().positive(),
  ...assessmentFields,
}).strict().superRefine((value, ctx) => {
  if (value.questionLimit && value.questionLimit > value.questions.length) {
    ctx.addIssue({ code: "custom", path: ["questionLimit"], message: "Question limit exceeds question count" });
  }
});

const updateSchema = z.object({
  courseVersion: z.coerce.number().int().positive(),
  assessmentVersion: z.coerce.number().int().positive(),
  title: assessmentFields.title.optional(),
  chapterId: assessmentFields.chapterId,
  type: assessmentFields.type.optional(),
  strictMode: z.boolean().optional(),
  questions: assessmentFields.questions.optional(),
  durationMinutes: z.coerce.number().int().min(1).max(360).optional(),
  passScore: z.coerce.number().min(1).max(100).optional(),
  questionLimit: z.coerce.number().int().positive().max(1_000).nullable().optional(),
  difficulty: z.string().trim().min(1).max(80).optional(),
}).strict().superRefine((value, ctx) => {
  if (value.questions && value.questionLimit && value.questionLimit > value.questions.length) {
    ctx.addIssue({ code: "custom", path: ["questionLimit"], message: "Question limit exceeds supplied question count" });
  }
});

const errorStatus = (error) => {
  if (!(error instanceof AssessmentAuthorityError)) return 500;
  if (["COURSE_NOT_FOUND", "ASSESSMENT_NOT_FOUND"].includes(error.code)) return 404;
  if (["FORBIDDEN", "ENROLLMENT_REQUIRED", "CHAPTERS_INCOMPLETE"].includes(error.code)) return 403;
  if (["VERSION_CONFLICT", "ASSESSMENT_CONFLICT", "ASSESSMENT_HAS_HISTORY", "ATTEMPT_CONFLICT"].includes(error.code)) return 409;
  if (["INVALID_CHAPTER", "NO_CHANGES", "ASSESSMENT_EMPTY"].includes(error.code)) return 400;
  return 500;
};

export const sendAssessmentAuthorityError = (res, error) => {
  if (!(error instanceof AssessmentAuthorityError)) throw error;
  return res.status(errorStatus(error)).json({
    error: error.message,
    code: error.code,
    ...(Object.keys(error.details || {}).length ? { details: error.details } : {}),
  });
};

const nextId = () => `ASM-${crypto.randomBytes(10).toString("hex").toUpperCase()}`;

export function registerAssessmentAuthoringPgRoutes(app) {
  app.get("/api/assessments", authenticate, async (req, res) => {
    const parsed = z.object({
      status: z.enum(["Active", "Inactive", "All"]).default("Active"),
      approval: z.enum(["Draft", "Pending", "Approved", "Rejected"]).optional(),
      courseId: z.string().trim().max(160).optional(),
    }).safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const data = await repository.listVisible({ actor: req.user, ...parsed.data });
    return res.json({ data, total: data.length });
  });

  app.post("/api/assessments", authenticate, requireRole("Admin", "Manager"), async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const { courseVersion, ...assessment } = parsed.data;
    try {
      const result = await repository.createAssessment({
        assessment: { id: nextId(), ...assessment },
        actor: req.user,
        expectedCourseVersion: courseVersion,
      });
      return res.status(201).json({ data: result.assessment, courseVersion: result.courseVersion });
    } catch (error) {
      return sendAssessmentAuthorityError(res, error);
    }
  });

  app.put("/api/assessments/:id", authenticate, requireRole("Admin", "Manager"), async (req, res) => {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const { courseVersion, assessmentVersion, ...updates } = parsed.data;
    try {
      const result = await repository.updateAssessment({
        id: req.params.id,
        actor: req.user,
        expectedCourseVersion: courseVersion,
        expectedAssessmentVersion: assessmentVersion,
        updates,
      });
      return res.json({ data: result.assessment, courseVersion: result.courseVersion });
    } catch (error) {
      return sendAssessmentAuthorityError(res, error);
    }
  });

  app.patch(
    "/api/assessments/:id/status",
    authenticate,
    requireRole("Admin", "Manager"),
    requireStepUp,
    async (req, res) => {
      const parsed = z.object({
        courseVersion: z.coerce.number().int().positive(),
        assessmentVersion: z.coerce.number().int().positive(),
        status: z.enum(["Active", "Inactive"]),
      }).strict().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
      try {
        const result = await repository.setStatus({
          id: req.params.id,
          actor: req.user,
          expectedCourseVersion: parsed.data.courseVersion,
          expectedAssessmentVersion: parsed.data.assessmentVersion,
          status: parsed.data.status,
        });
        return res.json({ data: result.assessment, courseVersion: result.courseVersion });
      } catch (error) {
        return sendAssessmentAuthorityError(res, error);
      }
    }
  );

  app.patch(
    "/api/assessments/:id/approval",
    authenticate,
    requireRole("Admin"),
    requireStepUp,
    async (req, res) => {
      const parsed = z.object({
        courseVersion: z.coerce.number().int().positive(),
        assessmentVersion: z.coerce.number().int().positive(),
        approval: z.enum(["Approved", "Rejected"]),
        feedback: z.string().trim().min(10).max(5_000),
      }).strict().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
      try {
        const result = await repository.reviewAssessment({
          id: req.params.id,
          actor: req.user,
          ...parsed.data,
          expectedCourseVersion: parsed.data.courseVersion,
          expectedAssessmentVersion: parsed.data.assessmentVersion,
        });
        return res.json({ data: result.assessment, courseVersion: result.courseVersion });
      } catch (error) {
        return sendAssessmentAuthorityError(res, error);
      }
    }
  );

  app.delete(
    "/api/assessments/:id",
    authenticate,
    requireRole("Admin", "Manager"),
    requireStepUp,
    async (req, res) => {
      const parsed = z.object({
        courseVersion: z.coerce.number().int().positive(),
        assessmentVersion: z.coerce.number().int().positive(),
        deletionComment: z.string().trim().min(10).max(5_000),
      }).strict().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
      try {
        const result = await repository.archiveAndDelete({
          id: req.params.id,
          actor: req.user,
          expectedCourseVersion: parsed.data.courseVersion,
          expectedAssessmentVersion: parsed.data.assessmentVersion,
          deletionComment: parsed.data.deletionComment,
        });
        return res.json({ success: true, data: result });
      } catch (error) {
        return sendAssessmentAuthorityError(res, error);
      }
    }
  );
}
