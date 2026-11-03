// Module wiring: assembles repository -> service -> controller and mounts routes.
import { createCertificatesRepository } from "./certificates.repository.js";
import { createCertificatesService } from "./certificates.service.js";
import { createCertificatesController } from "./certificates.controller.js";
import { issuedCertificates, users, courses, now } from "../../core.js";
import { audit } from "../../domain.js";
import { authenticate, requireRole, requireStepUp } from "../../middleware.js";
import { certificatesPgRepository } from "../../repositories/certificates.repository.pg.js";

const USE_PG_CERTIFICATES = process.env.USE_PG_CERTIFICATES === "1";

export function registerCertificates(app) {
  const store = { issuedCertificates, users, courses };
  const repo = USE_PG_CERTIFICATES ? certificatesPgRepository : createCertificatesRepository(store);
  const service = createCertificatesService({ repo, audit, now });
  const controller = createCertificatesController(service);

  // ── Public Verification Portal (Zero Auth Required) ──
  app.get("/api/certificates/verify/:certificateId", controller.verify);

  // Public friendly shortcut
  app.get("/verify/:certificateId", (req, res, next) => {
    // If request accepts HTML, pass along to frontend client, else return JSON verification
    if (req.accepts("html") && !req.accepts("json")) {
      return next();
    }
    return controller.verify(req, res);
  });

  // ── Authenticated User & Admin Routes ──
  app.get("/api/certificates", authenticate, controller.list);
  app.post(
    "/api/certificates",
    authenticate,
    requireRole("Admin", "Manager", "Instructor"),
    controller.authorizeCreate,
    requireStepUp,
    controller.create
  );

  app.post(
    "/api/certificates/:certificateId/revoke",
    authenticate,
    requireRole("Admin", "Manager", "Instructor"),
    requireStepUp,
    controller.revoke,
  );

  // ── Auto-Issue Endpoint upon Course & Screening Completion ──
  app.post("/api/certificates/auto-issue", authenticate, async (req, res) => {
    const { courseId, attemptId } = req.body;
    if (!courseId) return res.status(400).json({ error: "courseId is required" });

    const result = await service.autoIssueCredential({
      userId: req.user.id,
      courseId,
      attemptId,
    });
    if (result.error) return res.status(result.status).json({ error: result.error });
    res.status(result.status).json({ ok: true, data: result.data });
  });

  // Export service instance for internal pipeline hooks
  return service;
}
