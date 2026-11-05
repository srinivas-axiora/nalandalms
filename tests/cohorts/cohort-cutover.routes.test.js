import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cohortAuthorityRepository } from "../../backend/src/repositories/cohort-authority.repository.pg.js";
import { authCookieFor, testUsers } from "../helpers/auth.js";

describe("cohort relational cutover selection", () => {
  const previous = process.env.USE_PG_COURSES;
  let app;

  beforeAll(async () => {
    process.env.USE_PG_COURSES = "1";
    const { registerCohorts } = await import(
      "../../backend/src/modules/cohorts/cohorts.routes.js?phase17-cutover"
    );
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    registerCohorts(app);
  });

  afterEach(() => vi.restoreAllMocks());
  afterAll(() => {
    if (previous === undefined) delete process.env.USE_PG_COURSES;
    else process.env.USE_PG_COURSES = previous;
  });

  it("registers the relational cohort listing instead of reading process-local state", async () => {
    vi.spyOn(cohortAuthorityRepository, "listCohorts").mockResolvedValue([
      { id: "COH-RELATIONAL", name: "Relational cohort", courseId: "CRS-1", memberCount: 1 },
    ]);
    const response = await request(app).get("/api/cohorts")
      .set("Cookie", authCookieFor(testUsers.manager));

    expect(response.status).toBe(200);
    expect(response.body.data[0].id).toBe("COH-RELATIONAL");
    expect(cohortAuthorityRepository.listCohorts).toHaveBeenCalledOnce();
  });
});
