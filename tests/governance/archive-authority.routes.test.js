import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { authCookieFor, stepUpCookieFor, testUsers } from "../helpers/auth.js";
import { archiveAuthorityRepository } from "../../backend/src/repositories/archive-authority.repository.pg.js";

describe("relational governance archive routes", () => {
  const previousCourses = process.env.USE_PG_COURSES;
  const previousIdentity = process.env.USE_PG_IDENTITY;
  let app;

  beforeAll(async () => {
    process.env.USE_PG_COURSES = "1";
    process.env.USE_PG_IDENTITY = "0";
    const { registerGovernance } = await import("../../backend/src/modules/governance/governance.routes.js?phase33-archives");
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    registerGovernance(app);
  });
  afterEach(() => vi.restoreAllMocks());
  afterAll(() => {
    if (previousCourses === undefined) delete process.env.USE_PG_COURSES;
    else process.env.USE_PG_COURSES = previousCourses;
    if (previousIdentity === undefined) delete process.env.USE_PG_IDENTITY;
    else process.env.USE_PG_IDENTITY = previousIdentity;
  });

  it("lists course and assessment archives through the relational authority", async () => {
    const list = vi.spyOn(archiveAuthorityRepository, "listArchives").mockResolvedValue([
      { id: "ARCH-1", entityType: "Course", entityId: "CRS-1", deletedAt: "2026-11-06T00:00:00.000Z" },
    ]);
    const response = await request(app)
      .get("/api/archive")
      .set("Cookie", authCookieFor(testUsers.superAdmin));

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(list).toHaveBeenCalledWith({ entityTypes: ["Course", "Assessment"] });
  });

  it("restores relational authoring content only with step-up and review-gates it", async () => {
    vi.spyOn(archiveAuthorityRepository, "findArchiveById").mockResolvedValue({
      id: "ARCH-1", entityType: "Course", entityId: "CRS-1",
    });
    const restore = vi.spyOn(archiveAuthorityRepository, "restoreAuthoringArchive").mockResolvedValue({
      entityType: "Course", entityId: "CRS-1",
    });
    const response = await request(app)
      .post("/api/archive/ARCH-1/restore")
      .set("Cookie", [authCookieFor(testUsers.superAdmin), stepUpCookieFor(testUsers.superAdmin)]);

    expect(response.status).toBe(200);
    expect(response.body.message).toContain("inactive draft");
    expect(restore).toHaveBeenCalledWith({ archiveId: "ARCH-1", actor: expect.objectContaining({ id: testUsers.superAdmin.id }) });
  });
});
