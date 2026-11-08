import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { users } from "../../backend/src/core.js";
import { signToken } from "../../backend/src/domain.js";
import { assessmentAuthorityRepository } from "../../backend/src/repositories/assessment-authority.repository.pg.js";
import { identityRepository } from "../../backend/src/repositories/identity.repository.pg.js";

describe("assessment relational cutover selection", () => {
  const previous = process.env.USE_PG_COURSES;
  let app;

  beforeAll(async () => {
    process.env.USE_PG_COURSES = "1";
    const { registerAssessments } = await import(
      "../../backend/src/modules/assessments/assessments.routes.js?phase14-cutover"
    );
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    registerAssessments(app);
  });

  afterEach(() => vi.restoreAllMocks());

  afterAll(() => {
    if (previous === undefined) delete process.env.USE_PG_COURSES;
    else process.env.USE_PG_COURSES = previous;
  });

  it("registers the relational assessment listing instead of the process-local handler", async () => {
    const employee = users.find((user) => user.role === "Employee");
    vi.spyOn(identityRepository, "findUserById").mockResolvedValue(employee);
    vi.spyOn(assessmentAuthorityRepository, "listVisible").mockResolvedValue([
      { id: "ASM-RELATIONAL", title: "Relational assessment", questions: [] },
    ]);
    const response = await request(app)
      .get("/api/assessments")
      .set("Cookie", `token=${signToken(employee)}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ data: [{ id: "ASM-RELATIONAL" }], total: 1 });
    expect(assessmentAuthorityRepository.listVisible).toHaveBeenCalledWith(expect.objectContaining({
      actor: expect.objectContaining({ id: employee.id }),
    }));
  });
});
