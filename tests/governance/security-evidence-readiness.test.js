import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("security evidence transactional readiness interlock", () => {
  const previous = process.env.USE_PG_AUDIT;
  let app;

  beforeAll(async () => {
    process.env.USE_PG_AUDIT = "1";
    ({ app } = await import("../../backend/server.js?phase32-audit-readiness"));
  }, 30_000);

  afterAll(() => {
    if (previous === undefined) delete process.env.USE_PG_AUDIT;
    else process.env.USE_PG_AUDIT = previous;
  });

  it("returns 503 while evidence and business mutations cannot share authority", async () => {
    const response = await request(app).get("/api/ready");
    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({
      ok: false,
      checks: {
        audit: { ok: false, mode: "normalized", dependencies: "incomplete" },
      },
    });
  });
});
