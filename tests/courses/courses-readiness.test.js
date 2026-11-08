import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("experimental course authority readiness interlock", () => {
  const previous = process.env.USE_PG_COURSES;
  let app;

  beforeAll(async () => {
    process.env.USE_PG_COURSES = "1";
    ({ app } = await import("../../backend/server.js?course-readiness"));
  }, 30_000);

  afterAll(() => {
    if (previous === undefined) delete process.env.USE_PG_COURSES;
    else process.env.USE_PG_COURSES = previous;
  });

  it("returns 503 so an incomplete course-only cutover cannot receive ALB traffic", async () => {
    const response = await request(app).get("/api/ready");
    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({
      ok: false,
      checks: {
        attempts: { mode: "normalized" },
        certificates: { mode: "normalized" },
        courses: { ok: false, mode: "experimental-learning-secondary-consumers" },
      },
    });
  });
});
