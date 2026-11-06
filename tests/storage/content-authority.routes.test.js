import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerUploads } from "../../backend/src/modules/uploads/uploads.routes.js";
import { LearningAuthorityError } from "../../backend/src/repositories/learning-authority.repository.pg.js";
import { authCookieFor, testUsers } from "../helpers/auth.js";

describe("relational upload and content authorization routes", () => {
  let app;
  let authority;

  beforeEach(() => {
    authority = {
      authorizeCourseUpload: vi.fn(),
      authorizeContentDownload: vi.fn(),
    };
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    registerUploads(app, { usePgCourses: true, learningAuthorityRepository: authority });
  });

  afterEach(() => vi.restoreAllMocks());

  it("requires an explicit course scope before issuing an upload grant", async () => {
    const response = await request(app)
      .post("/api/uploads/presign")
      .set("Cookie", authCookieFor(testUsers.manager))
      .send({ filename: "chapter.pdf", contentType: "application/pdf", category: "chapter_pdf" });

    expect(response.status).toBe(400);
    expect(authority.authorizeCourseUpload).not.toHaveBeenCalled();
  });

  it("uses PostgreSQL course ownership before issuing a course-scoped upload grant", async () => {
    authority.authorizeCourseUpload.mockResolvedValue({ courseId: "CRS-1", courseVersion: 4 });
    const response = await request(app)
      .post("/api/uploads/presign")
      .set("Cookie", authCookieFor(testUsers.manager))
      .send({
        courseId: "CRS-1",
        filename: "chapter.pdf",
        contentType: "application/pdf",
        category: "chapter_pdf",
      });

    expect(response.status).toBe(200);
    expect(authority.authorizeCourseUpload).toHaveBeenCalledWith({
      courseId: "CRS-1",
      actor: expect.objectContaining({ id: testUsers.manager.id }),
    });
    expect(response.body.key).toMatch(/^chapter_pdf\/CRS-1\//);
  });

  it("maps a foreign-manager ownership denial without creating a grant", async () => {
    authority.authorizeCourseUpload.mockRejectedValue(
      new LearningAuthorityError("FORBIDDEN", "You cannot upload content for this course"),
    );
    const response = await request(app)
      .post("/api/uploads/presign")
      .set("Cookie", authCookieFor(testUsers.manager))
      .send({ courseId: "CRS-2", filename: "chapter.pdf", contentType: "application/pdf" });

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({ code: "FORBIDDEN" });
    expect(response.body).not.toHaveProperty("uploadUrl");
  });

  it("denies a locked relational chapter before signing a content URL", async () => {
    authority.authorizeContentDownload.mockRejectedValue(
      new LearningAuthorityError("CHAPTER_LOCKED", "Prerequisite chapter incomplete", {
        requiredChapterId: "CH-1",
      }),
    );
    const response = await request(app)
      .get("/api/content/CRS-1/CH-2/url")
      .set("Cookie", authCookieFor(testUsers.employee));

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({
      code: "CHAPTER_LOCKED",
      details: { requiredChapterId: "CH-1" },
    });
    expect(response.body).not.toHaveProperty("url");
  });

  it("signs only the object key returned by relational chapter authority", async () => {
    authority.authorizeContentDownload.mockResolvedValue({
      courseId: "CRS-1",
      chapter: {
        id: "CH-2",
        contentType: "PDF",
        url: "chapter_pdf/CRS-1/controlled.pdf",
        fileName: "controlled.pdf",
      },
    });
    const response = await request(app)
      .get("/api/content/CRS-1/CH-2/url")
      .set("Cookie", authCookieFor(testUsers.employee));

    expect(response.status).toBe(200);
    expect(response.body.url).toMatch(/^\/api\/uploads\/download\?token=/);
    expect(authority.authorizeContentDownload).toHaveBeenCalledWith({
      courseId: "CRS-1",
      chapterId: "CH-2",
      actor: expect.objectContaining({ id: testUsers.employee.id }),
    });
  });

  it("keeps content quarantined when malware scanning is not clean", async () => {
    authority.authorizeContentDownload.mockResolvedValue({
      courseId: "CRS-1",
      chapter: {
        id: "CH-2",
        contentType: "PDF",
        url: "chapter_pdf/CRS-1/pending.pdf",
        fileName: "pending.pdf",
      },
    });
    const scanError = Object.assign(new Error("pending"), { code: "OBJECT_SCAN_PENDING" });
    const isolatedApp = express();
    isolatedApp.use(express.json());
    isolatedApp.use(cookieParser());
    registerUploads(isolatedApp, {
      usePgCourses: true,
      learningAuthorityRepository: authority,
      getPresignedDownloadUrl: vi.fn().mockRejectedValue(scanError),
    });

    const response = await request(isolatedApp)
      .get("/api/content/CRS-1/CH-2/url")
      .set("Cookie", authCookieFor(testUsers.employee));

    expect(response.status).toBe(423);
    expect(response.body).toMatchObject({ code: "OBJECT_SCAN_PENDING" });
    expect(response.body).not.toHaveProperty("url");
  });
});
