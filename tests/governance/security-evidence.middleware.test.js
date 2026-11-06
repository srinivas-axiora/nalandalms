import express from "express";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { audit } from "../../backend/src/domain.js";
import { persistResponseMiddleware, securityLoggingMiddleware } from "../../backend/src/middleware.js";
import { securityEvidenceRepository } from "../../backend/src/repositories/security-evidence.repository.pg.js";
import { evidenceWriteContextMiddleware } from "../../backend/src/security/evidence-write-context.js";

describe("security evidence response gate", () => {
  const previous = process.env.USE_PG_AUDIT;

  beforeEach(() => { process.env.USE_PG_AUDIT = "1"; });
  afterEach(() => {
    vi.restoreAllMocks();
    if (previous === undefined) delete process.env.USE_PG_AUDIT;
    else process.env.USE_PG_AUDIT = previous;
  });

  const makeApp = () => {
    const app = express();
    app.use(evidenceWriteContextMiddleware);
    app.use(persistResponseMiddleware);
    app.use(securityLoggingMiddleware);
    app.get("/audit", (_req, res) => {
      audit("USR-1", "TEST_AUDIT", "SYSTEM", "gate", {
        email: "must-not-persist@example.invalid",
        nested: { passwordHash: "must-not-persist", allowed: true },
      });
      res.json({ ok: true });
    });
    app.get("/denied", (_req, res) => res.status(403).json({ error: "Forbidden" }));
    return app;
  };

  it("waits for relational audit evidence before completing a response", async () => {
    const append = vi.spyOn(securityEvidenceRepository, "appendAudit").mockResolvedValue({ id: "ok" });
    const response = await request(makeApp()).get("/audit");
    expect(response.status).toBe(200);
    expect(append).toHaveBeenCalledWith(expect.objectContaining({
      action: "TEST_AUDIT",
      metadata: { nested: { allowed: true } },
    }));
  });

  it("fails closed when durable audit evidence cannot be written", async () => {
    vi.spyOn(securityEvidenceRepository, "appendAudit").mockRejectedValue(new Error("database unavailable"));
    const response = await request(makeApp()).get("/audit");
    expect(response.status).toBe(503);
    expect(response.body.error).toMatch(/could not be saved/i);
  });

  it("records authorization failures before returning the denial", async () => {
    const append = vi.spyOn(securityEvidenceRepository, "appendSecurityEvent").mockResolvedValue({ id: "event" });
    const response = await request(makeApp()).get("/denied");
    expect(response.status).toBe(403);
    expect(append).toHaveBeenCalledWith(expect.objectContaining({
      type: "AUTHORIZATION_DENIED",
      metadata: { statusCode: 403 },
    }));
  });
});
