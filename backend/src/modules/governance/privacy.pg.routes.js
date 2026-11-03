import crypto from "node:crypto";
import { z } from "zod";
import { authenticate, requireRole, requireStepUp } from "../../middleware.js";
import {
  PrivacyRepositoryError,
  privacyPgRepository as repository,
} from "../../repositories/privacy.repository.pg.js";

const requestSchema = z.object({
  confirmEmail: z.string().trim().email().max(320),
  reason: z.string().trim().min(10).max(2000),
});

const reviewSchema = z.object({
  decision: z.enum(["APPROVE", "HOLD"]),
  reason: z.string().trim().min(10).max(2000),
});

const statusForError = (error) => {
  if (!(error instanceof PrivacyRepositoryError)) return 500;
  if (["REQUEST_NOT_FOUND", "USER_NOT_FOUND"].includes(error.code)) return 404;
  if (error.code === "EMAIL_MISMATCH") return 400;
  if ([
    "NOT_CANCELLABLE", "REQUEST_TERMINAL", "ISSUER_REASSIGNMENT_REQUIRED",
    "REQUEST_NOT_PROCESSING", "OBJECTS_PENDING",
  ].includes(error.code)) return 409;
  return 500;
};

const sendError = (res, error) => {
  if (!(error instanceof PrivacyRepositoryError)) throw error;
  return res.status(statusForError(error)).json({ error: error.message, code: error.code });
};

const publicRequest = (request) => request && ({
  id: request.id,
  status: request.status,
  requestedAt: request.requestedAt,
  graceEndsAt: request.graceEndsAt,
  completedAt: request.completedAt,
  cancelledAt: request.cancelledAt,
  legalHold: request.status === "Blocked",
  coverageVersion: request.coverageVersion,
  completionEvidence: request.status === "Completed" ? request.completionEvidence : undefined,
});

export function registerPrivacyPgRoutes(app) {
  app.get("/api/users/me/data-export", authenticate, requireStepUp, async (req, res) => {
    const data = await repository.exportUserData(req.user.id);
    if (!data) return res.status(404).json({ error: "User not found" });
    res.setHeader("Content-Disposition", `attachment; filename="nalanda-data-export-${req.user.id}.json"`);
    res.setHeader("Cache-Control", "private, no-store");
    return res.json(data);
  });

  app.get("/api/users/me/delete-request", authenticate, async (req, res) => {
    const request = await repository.getForUser(req.user.id);
    return res.json({ ok: true, data: publicRequest(request) });
  });

  app.post("/api/users/me/delete-request", authenticate, requireStepUp, async (req, res) => {
    const parsed = requestSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    try {
      const result = await repository.requestErasure({
        id: `PRIV-${crypto.randomBytes(16).toString("hex").toUpperCase()}`,
        userId: req.user.id,
        confirmEmail: parsed.data.confirmEmail,
        reason: parsed.data.reason,
        graceDays: 30,
      });
      return res.status(result.created ? 201 : 200).json({
        ok: true,
        created: result.created,
        data: publicRequest(result.request),
        scheduledDeletionDate: result.request.graceEndsAt,
      });
    } catch (error) {
      return sendError(res, error);
    }
  });

  app.post("/api/users/me/cancel-delete", authenticate, requireStepUp, async (req, res) => {
    try {
      const request = await repository.cancelForUser({ userId: req.user.id });
      return res.json({ ok: true, data: publicRequest(request) });
    } catch (error) {
      return sendError(res, error);
    }
  });

  app.get("/api/privacy/requests", authenticate, requireRole("Admin"), async (_req, res) => {
    const data = await repository.listRequests();
    return res.json({ ok: true, data, total: data.length });
  });

  app.post(
    "/api/privacy/requests/:requestId/review",
    authenticate,
    requireRole("Admin"),
    requireStepUp,
    async (req, res) => {
      const parsed = reviewSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
      try {
        const request = await repository.review({
          requestId: req.params.requestId,
          actorId: req.user.id,
          decision: parsed.data.decision,
          reason: parsed.data.reason,
        });
        return res.json({ ok: true, data: request });
      } catch (error) {
        return sendError(res, error);
      }
    }
  );
}
