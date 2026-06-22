// Module wiring: assembles repository -> service -> controller and mounts routes.
// `ctx` is the strangler-migration bridge supplying shared dependencies from
// server.js (store + audit + auth middleware). In the full rollout these become
// direct imports from the persistence/middleware layers.
import { createCertificatesRepository } from "./certificates.repository.js";
import { createCertificatesService } from "./certificates.service.js";
import { createCertificatesController } from "./certificates.controller.js";

export function registerCertificates(app, ctx) {
  const { store, audit, now, authenticate, requireRole } = ctx;
  const repo = createCertificatesRepository(store);
  const service = createCertificatesService({ repo, audit, now });
  const controller = createCertificatesController(service);

  app.get("/api/certificates", authenticate, controller.list);
  app.post("/api/certificates", authenticate, requireRole("Admin"), controller.create);
}
