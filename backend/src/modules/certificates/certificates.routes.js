// Module wiring: assembles repository -> service -> controller and mounts routes.
import { createCertificatesRepository } from "./certificates.repository.js";
import { createCertificatesService } from "./certificates.service.js";
import { createCertificatesController } from "./certificates.controller.js";
import { issuedCertificates, users, courses, assignments, now } from "../../core.js";
import { audit } from "../../domain.js";
import { authenticate, requireRole } from "../../middleware.js";

export function registerCertificates(app) {
  const store = { issuedCertificates, users, courses };
  const repo = createCertificatesRepository(store);
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
  app.post("/api/certificates", authenticate, requireRole("Admin", "Manager", "Instructor"), controller.create);

  // ── Auto-Issue Endpoint upon Course & Screening Completion ──
  app.post("/api/certificates/auto-issue", authenticate, (req, res) => {
    const { courseId, attemptId } = req.body;
    if (!courseId) return res.status(400).json({ error: "courseId is required" });

    // Validate assignment state
    const assignment = assignments.find((a) => a.courseId === courseId && a.userId === req.user.id);
    if (!assignment) return res.status(404).json({ error: "Enrollment not found" });

    if (assignment.status !== "Passed" && assignment.status !== "Certified" && assignment.progress < 100) {
      return res.status(403).json({ error: "Course requirements and proctored assessment screening must be passed before certificate can be issued" });
    }

    const cert = service.autoIssueCredential({
      userId: req.user.id,
      courseId,
      attemptId,
    });

    if (!cert) {
      return res.status(400).json({ error: "Could not issue certificate" });
    }

    res.status(201).json({ ok: true, data: cert });
  });

  // Export service instance for internal pipeline hooks
  return service;
}
