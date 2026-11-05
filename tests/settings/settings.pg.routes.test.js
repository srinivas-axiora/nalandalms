import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { authCookieFor, stepUpCookieFor, testUsers } from "../helpers/auth.js";
import { settingsRepository } from "../../backend/src/repositories/settings.repository.pg.js";

describe("relational operational settings routes", () => {
  const previous = process.env.USE_PG_SETTINGS;
  let app;
  beforeAll(async () => {
    process.env.USE_PG_SETTINGS = "1";
    const { registerSettings } = await import("../../backend/src/modules/settings/settings.routes.js?phase24-settings");
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    registerSettings(app);
  });
  afterEach(() => vi.restoreAllMocks());
  afterAll(() => {
    if (previous === undefined) delete process.env.USE_PG_SETTINGS;
    else process.env.USE_PG_SETTINGS = previous;
  });

  it("persists a bounded strict patch with step-up authority", async () => {
    const update = vi.spyOn(settingsRepository, "updateProctoring").mockResolvedValue({ noiseThreshold: 80 });
    const response = await request(app).patch("/api/settings")
      .set("Cookie", [authCookieFor(testUsers.admin), stepUpCookieFor(testUsers.admin)])
      .send({ noiseThreshold: 80 });
    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith({ actorId: testUsers.admin.id, patch: { noiseThreshold: 80 } });
  });

  it("rejects unknown or empty settings patches", async () => {
    const update = vi.spyOn(settingsRepository, "updateProctoring");
    const response = await request(app).patch("/api/settings")
      .set("Cookie", [authCookieFor(testUsers.admin), stepUpCookieFor(testUsers.admin)])
      .send({ arbitrary: true });
    expect(response.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });
});
