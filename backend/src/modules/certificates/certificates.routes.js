// Module wiring: assembles repository -> service -> controller and mounts routes.
// Shared dependencies are imported directly from the foundation layers.
import { createCertificatesRepository } from "./certificates.repository.js";
import { createCertificatesService } from "./certificates.service.js";
import { createCertificatesController } from "./certificates.controller.js";
import { issuedCertificates, users, courses, now } from "../../core.js";
import { audit } from "../../domain.js";
import { authenticate, requireRole } from "../../middleware.js";

export function registerCertificates(app) {
  const store = { issuedCertificates, users, courses };
  const repo = createCertificatesRepository(store);
  const service = createCertificatesService({ repo, audit, now });
  const controller = createCertificatesController(service);

  app.get("/api/certificates", authenticate, controller.list);
  app.post("/api/certificates", authenticate, requireRole("Admin"), controller.create);
}
