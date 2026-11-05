import crypto from "node:crypto";
import { z } from "zod";
import { authenticate, requireRole } from "../../middleware.js";
import {
  CohortAuthorityError,
  cohortAuthorityRepository as repository,
  hashCohortInviteCode,
} from "../../repositories/cohort-authority.repository.pg.js";

const id = z.string().trim().min(1).max(200).regex(/^[A-Za-z0-9._:-]+$/);
const instant = z.union([z.iso.datetime({ offset: true }), z.iso.date()]);
const createSchema = z.object({
  name: z.string().trim().min(3).max(200),
  courseId: id,
  startDate: instant.optional(),
  endDate: instant.nullable().optional(),
  capacity: z.coerce.number().int().min(1).max(10000).default(100),
  description: z.string().trim().max(4000).default(""),
}).strict();
const joinSchema = z.object({
  inviteCode: z.string().trim().toUpperCase().regex(/^NLD-[A-HJ-NP-Z2-9]{12}$/),
}).strict();

const inviteAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const generateInviteCode = () => {
  let code = "NLD-";
  for (let index = 0; index < 12; index += 1) {
    code += inviteAlphabet[crypto.randomInt(inviteAlphabet.length)];
  }
  return code;
};

const statusFor = (error) => {
  if (!(error instanceof CohortAuthorityError)) return 500;
  if (["COHORT_NOT_FOUND", "COURSE_NOT_FOUND", "INVITE_INVALID"].includes(error.code)) return 404;
  if (error.code === "FORBIDDEN") return 403;
  if (["INVALID_DATE_RANGE", "COURSE_INACTIVE", "USER_INACTIVE", "COHORT_FULL"].includes(error.code)) return 400;
  if (["INVITE_CONFLICT", "ENROLLMENT_CONFLICT"].includes(error.code)) return 409;
  return 500;
};

const sendKnownError = (res, error) => res.status(statusFor(error)).json({
  error: error.message,
  code: error.code,
  ...(Object.keys(error.details || {}).length ? { details: error.details } : {}),
});

export function registerCohortsPgRoutes(app) {
  app.post(
    "/api/cohorts",
    authenticate,
    requireRole("Admin", "Manager", "Instructor"),
    async (req, res) => {
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
      const startDate = parsed.data.startDate || new Date().toISOString();

      for (let attempt = 0; attempt < 3; attempt += 1) {
        const inviteCode = generateInviteCode();
        try {
          const data = await repository.createCohort({
            actor: req.user,
            cohort: {
              id: `COH-${crypto.randomBytes(10).toString("hex").toUpperCase()}`,
              name: parsed.data.name,
              courseId: parsed.data.courseId,
              startDate,
              endDate: parsed.data.endDate || null,
              capacity: parsed.data.capacity,
              description: parsed.data.description,
            },
            inviteCodeHash: hashCohortInviteCode(inviteCode),
          });
          return res.status(201).json({ data: { ...data, inviteCode } });
        } catch (error) {
          if (error instanceof CohortAuthorityError && error.code === "INVITE_CONFLICT" && attempt < 2) continue;
          if (!(error instanceof CohortAuthorityError)) throw error;
          return sendKnownError(res, error);
        }
      }
      return res.status(409).json({ error: "Unable to allocate a unique cohort invite code", code: "INVITE_CONFLICT" });
    },
  );

  app.get("/api/cohorts", authenticate, async (req, res) => {
    const data = await repository.listCohorts(req.user);
    return res.json({ data, total: data.length });
  });

  app.get("/api/cohorts/:id", authenticate, async (req, res) => {
    const parsed = id.safeParse(req.params.id);
    if (!parsed.success) return res.status(400).json({ error: "Invalid cohort identifier" });
    try {
      return res.json({ data: await repository.findVisibleCohort({ cohortId: parsed.data, actor: req.user }) });
    } catch (error) {
      if (!(error instanceof CohortAuthorityError)) throw error;
      return sendKnownError(res, error);
    }
  });

  app.post("/api/cohorts/join", authenticate, async (req, res) => {
    const parsed = joinSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    try {
      const result = await repository.joinCohort({
        actor: req.user,
        inviteCodeHash: hashCohortInviteCode(parsed.data.inviteCode),
        enrollmentId: `ENR-${crypto.randomBytes(10).toString("hex").toUpperCase()}`,
      });
      return res.status(result.created ? 201 : 200).json({
        message: result.alreadyMember ? "You are already a member of this cohort" : "Successfully joined cohort",
        data: { cohort: result.cohort, enrollment: result.enrollment },
      });
    } catch (error) {
      if (!(error instanceof CohortAuthorityError)) throw error;
      return sendKnownError(res, error);
    }
  });

  app.get("/api/cohorts/:id/analytics", authenticate, async (req, res) => {
    const parsed = id.safeParse(req.params.id);
    if (!parsed.success) return res.status(400).json({ error: "Invalid cohort identifier" });
    try {
      return res.json({ data: await repository.getAnalytics({ cohortId: parsed.data, actor: req.user }) });
    } catch (error) {
      if (!(error instanceof CohortAuthorityError)) throw error;
      return sendKnownError(res, error);
    }
  });
}
