import cookieParser from "cookie-parser";
import express from "express";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { certificatesPgRepository } from "../../backend/src/repositories/certificates.repository.pg.js";
import { authCookieFor, testUsers } from "../helpers/auth.js";

describe("course cutover certificate authority", () => {
  const previousCourses = process.env.USE_PG_COURSES;
  const previousCertificates = process.env.USE_PG_CERTIFICATES;
  let app;

  beforeAll(async () => {
    process.env.USE_PG_COURSES = "1";
    process.env.USE_PG_CERTIFICATES = "0";
    vi.spyOn(certificatesPgRepository, "listForUser").mockResolvedValue([{
      id: "CERT-REL-COURSE-CUTOVER",
      employeeId: testUsers.employee.id,
      courseId: "CRS-REL",
      status: "Active",
    }]);
    const { registerCertificates } = await import(
      "../../backend/src/modules/certificates/certificates.routes.js?phase39-course-cutover"
    );
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    registerCertificates(app);
  });

  afterAll(() => {
    vi.restoreAllMocks();
    if (previousCourses === undefined) delete process.env.USE_PG_COURSES;
    else process.env.USE_PG_COURSES = previousCourses;
    if (previousCertificates === undefined) delete process.env.USE_PG_CERTIFICATES;
    else process.env.USE_PG_CERTIFICATES = previousCertificates;
  });

  it("selects relational certificate projections from the course flag alone", async () => {
    const response = await request(app)
      .get("/api/certificates")
      .set("Cookie", authCookieFor(testUsers.employee));

    expect(response.status).toBe(200);
    expect(certificatesPgRepository.listForUser).toHaveBeenCalledWith(
      expect.objectContaining({ id: testUsers.employee.id })
    );
    expect(response.body.data).toEqual([
      expect.objectContaining({ id: "CERT-REL-COURSE-CUTOVER" }),
    ]);
  });
});
