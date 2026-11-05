import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerEnrollmentsPgRoutes } from "../../backend/src/modules/enrollments/enrollments.pg.routes.js";
import {
  AssignmentAuthorityError,
  assignmentAuthorityRepository,
} from "../../backend/src/repositories/assignment-authority.repository.pg.js";
import { authCookieFor, testUsers } from "../helpers/auth.js";

describe("PostgreSQL assignment routes", () => {
  let app;
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    registerEnrollmentsPgRoutes(app);
  });
  afterEach(() => vi.restoreAllMocks());

  it("rejects an unbounded assignment batch", async () => {
    const assign = vi.spyOn(assignmentAuthorityRepository, "assignCourse");
    const response = await request(app).post("/api/assignments")
      .set("Cookie", authCookieFor(testUsers.manager))
      .send({ courseId: "CRS-1", userIds: [] });
    expect(response.status).toBe(400);
    expect(assign).not.toHaveBeenCalled();
  });

  it("deduplicates assignees and delegates one transactional batch", async () => {
    vi.spyOn(assignmentAuthorityRepository, "assignCourse").mockResolvedValue([
      { id: "ENR-1", courseId: "CRS-1", userId: "USR-1" },
    ]);
    const response = await request(app).post("/api/assignments")
      .set("Cookie", authCookieFor(testUsers.manager))
      .send({ courseId: "CRS-1", userIds: ["USR-1", "USR-1"], dueAt: "2026-12-01", priority: "High", mandatory: true });

    expect(response.status).toBe(201);
    expect(assignmentAuthorityRepository.assignCourse).toHaveBeenCalledWith(expect.objectContaining({
      courseId: "CRS-1",
      actor: expect.objectContaining({ id: testUsers.manager.id }),
      dueAt: "2026-12-01",
      priority: "High",
      mandatory: true,
      assignees: [expect.objectContaining({ userId: "USR-1" })],
    }));
  });

  it("maps assignee scope failures to a stable 403 contract", async () => {
    vi.spyOn(assignmentAuthorityRepository, "assignCourse").mockRejectedValue(
      new AssignmentAuthorityError("ASSIGNEE_FORBIDDEN", "Outside permitted scope", { userIds: ["USR-X"] }),
    );
    const response = await request(app).post("/api/assignments")
      .set("Cookie", authCookieFor(testUsers.manager))
      .send({ courseId: "CRS-1", userIds: ["USR-X"] });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: "Outside permitted scope", code: "ASSIGNEE_FORBIDDEN", details: { userIds: ["USR-X"] },
    });
  });
});
