import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerCoursesPgRoutes } from "../../backend/src/modules/courses/courses.pg.routes.js";
import {
  CourseAuthorityError,
  courseAuthorityRepository,
} from "../../backend/src/repositories/courses-authority.repository.pg.js";
import { authCookieFor, stepUpCookieFor, testUsers } from "../helpers/auth.js";

describe("PostgreSQL course authority routes", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    registerCoursesPgRoutes(app);
  });

  afterEach(() => vi.restoreAllMocks());

  it("serves only the repository's approved catalog projection", async () => {
    vi.spyOn(courseAuthorityRepository, "listCatalog").mockResolvedValue([
      { id: "CRS-1", title: "Secure systems", chapterCount: 3 },
    ]);
    const response = await request(app).get("/api/catalog?search=secure");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ total: 1, data: [{ id: "CRS-1" }] });
    expect(courseAuthorityRepository.listCatalog).toHaveBeenCalledWith(
      expect.objectContaining({ search: "secure" })
    );
  });

  it("creates metadata through the transactional repository", async () => {
    vi.spyOn(courseAuthorityRepository, "createCourse").mockImplementation(async ({ course }) => ({
      ...course, ownerId: testUsers.manager.id, approval: "Pending", version: 1,
    }));
    const response = await request(app)
      .post("/api/courses")
      .set("Cookie", authCookieFor(testUsers.manager))
      .send({
        title: "Secure systems",
        description: "Production security engineering",
        skill: "Security",
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({ approval: "Pending", version: 1 });
    expect(courseAuthorityRepository.createCourse).toHaveBeenCalledWith(expect.objectContaining({
      actor: expect.objectContaining({ id: testUsers.manager.id }),
      course: expect.objectContaining({ title: "Secure systems" }),
    }));
  });

  it("maps an optimistic write conflict without leaking SQL details", async () => {
    vi.spyOn(courseAuthorityRepository, "updateCourse").mockRejectedValue(
      new CourseAuthorityError("VERSION_CONFLICT", "Course changed since it was loaded", { currentVersion: 4 })
    );
    const response = await request(app)
      .put("/api/courses/CRS-1")
      .set("Cookie", authCookieFor(testUsers.manager))
      .send({ version: 3, title: "Updated secure systems" });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: "Course changed since it was loaded",
      code: "VERSION_CONFLICT",
      details: { currentVersion: 4 },
    });
    expect(courseAuthorityRepository.updateCourse).toHaveBeenCalledWith(expect.objectContaining({
      updates: { title: "Updated secure systems" },
    }));
  });

  it("requires recent step-up before course approval", async () => {
    const review = vi.spyOn(courseAuthorityRepository, "reviewCourse");
    const response = await request(app)
      .patch("/api/courses/CRS-1/approval")
      .set("Cookie", authCookieFor(testUsers.admin))
      .send({ version: 1, approval: "Approved", reason: "Reviewed against publishing policy" });

    expect(response.status).toBe(412);
    expect(review).not.toHaveBeenCalled();
  });

  it("fails closed when deletion would destroy retained history", async () => {
    vi.spyOn(courseAuthorityRepository, "archiveAndDelete").mockRejectedValue(
      new CourseAuthorityError("COURSE_HAS_HISTORY", "Course has retained learner, payment or credential history", {
        enrollments: 2,
      })
    );
    const response = await request(app)
      .delete("/api/courses/CRS-1")
      .set("Cookie", [authCookieFor(testUsers.manager), stepUpCookieFor(testUsers.manager)])
      .send({ version: 1, deletionComment: "Retire this obsolete course safely" });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      code: "COURSE_HAS_HISTORY",
      details: { enrollments: 2 },
    });
  });
});
