import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("course authority readiness interlock", () => {
  const previous = process.env.USE_PG_COURSES;
  const previousCoverage = process.env.COURSE_AUTHORITY_COVERAGE_ACK;
  let app;

  beforeAll(async () => {
    process.env.USE_PG_COURSES = "1";
    delete process.env.COURSE_AUTHORITY_COVERAGE_ACK;
    ({ app } = await import("../../backend/server.js?course-readiness"));
  }, 30_000);

  afterAll(() => {
    if (previous === undefined) delete process.env.USE_PG_COURSES;
    else process.env.USE_PG_COURSES = previous;
    if (previousCoverage === undefined) delete process.env.COURSE_AUTHORITY_COVERAGE_ACK;
    else process.env.COURSE_AUTHORITY_COVERAGE_ACK = previousCoverage;
  });

  it("returns 503 until the versioned course coverage is explicitly acknowledged", async () => {
    const response = await request(app).get("/api/ready");
    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({
      ok: false,
      checks: {
        skills: { mode: "normalized" },
        identity: { mode: "normalized" },
        privacy: { mode: "normalized" },
        payments: { mode: "normalized" },
        settings: { mode: "normalized" },
        audit: { mode: "normalized", dependencies: "complete" },
        attempts: { mode: "normalized" },
        certificates: { mode: "normalized" },
        candidateAssessments: { mode: "normalized" },
        workplace: { mode: "normalized" },
        courses: { ok: false, mode: "normalized", coverage: "unacknowledged" },
      },
    });
  });
});
