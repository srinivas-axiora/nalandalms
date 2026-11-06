import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("archive authority readiness interlock", () => {
  const previous = process.env.USE_PG_IDENTITY;
  let app;

  beforeAll(async () => {
    process.env.USE_PG_IDENTITY = "1";
    ({ app } = await import("../../backend/server.js?phase33-archive-readiness"));
  }, 30_000);

  afterAll(() => {
    if (previous === undefined) delete process.env.USE_PG_IDENTITY;
    else process.env.USE_PG_IDENTITY = previous;
  });

  it("returns 503 when relational archive controls cannot be proven", async () => {
    const response = await request(app).get("/api/ready");
    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({
      ok: false,
      checks: { archives: { ok: false, mode: "normalized" } },
    });
  });
});
