// Private upload grants, safe local fallback delivery, and proctor capture ingestion.
import express from "express";
import path from "node:path";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { authenticate, requireRole } from "../../middleware.js";
import { courses, chapters, assignments, isAdmin } from "../../core.js";
import { audit } from "../../domain.js";
import {
  LearningAuthorityError,
  learningAuthorityRepository,
} from "../../repositories/learning-authority.repository.pg.js";
import { requireAttemptPermission } from "../../security/authorization.js";
import {
  MAX_COURSE_UPLOAD_BYTES,
  MAX_PROCTOR_CAPTURE_BYTES,
  allowedUploadMimeTypes,
  bufferMatchesContentType,
  decodeBase64Strict,
  uploadMetadataIsAllowed,
} from "../../security/file-validation.js";
import {
  getPresignedUploadUrl,
  getPresignedDownloadUrl,
  readLocalObject,
  uploadBuffer,
  verifyLocalGrant,
} from "../../storage/object-store.js";

const consumedLocalUploadGrants = new Set();
const safeFilename = (value) => {
  const extension = path.extname(value).toLowerCase();
  const base = path.basename(value, path.extname(value)).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 100) || "file";
  return `${base}${extension}`;
};

const resourceId = z.string().trim().min(1).max(200).regex(/^[A-Za-z0-9._:-]+$/);

const learningErrorStatus = (error) => {
  if (!(error instanceof LearningAuthorityError)) return null;
  if (["COURSE_NOT_FOUND", "CHAPTER_NOT_FOUND"].includes(error.code)) return 404;
  if (["FORBIDDEN", "ENROLLMENT_REQUIRED", "CHAPTER_LOCKED"].includes(error.code)) return 403;
  return 500;
};

export function registerUploads(app, options = {}) {
  const usePgCourses = options.usePgCourses ?? process.env.USE_PG_COURSES === "1";
  const authority = options.learningAuthorityRepository || learningAuthorityRepository;

  app.post("/api/uploads/presign", authenticate, requireRole("Admin", "Manager"), async (req, res, next) => {
    const schema = z.object({
      courseId: resourceId,
      filename: z.string().min(1).max(200),
      contentType: z.string().min(1).max(100),
      category: z.enum(["course_media", "chapter_pdf"]).default("course_media"),
    }).strict();
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    if (!allowedUploadMimeTypes.has(parsed.data.contentType)) {
      return res.status(415).json({ error: "Unsupported MIME type" });
    }
    if (!uploadMetadataIsAllowed(parsed.data.filename, parsed.data.contentType)) {
      return res.status(415).json({ error: "File extension does not match the declared content type" });
    }

    try {
      if (usePgCourses) {
        await authority.authorizeCourseUpload({ courseId: parsed.data.courseId, actor: req.user });
      } else {
        const course = courses.find((item) => item.id === parsed.data.courseId);
        if (!course) return res.status(404).json({ error: "Course not found" });
        if (!isAdmin(req.user.role) && course.ownerId !== req.user.id) {
          return res.status(403).json({ error: "You cannot upload content for this course" });
        }
      }
    } catch (error) {
      const status = learningErrorStatus(error);
      if (status) return res.status(status).json({ error: error.message, code: error.code });
      return next(error);
    }

    const filename = safeFilename(parsed.data.filename);
    const key = `${parsed.data.category}/${parsed.data.courseId}/${Date.now()}-${uuid()}-${filename}`;
    try {
      const presigned = await getPresignedUploadUrl(
        key,
        parsed.data.contentType,
        600,
        req.user.id,
        MAX_COURSE_UPLOAD_BYTES,
      );
      const download = await getPresignedDownloadUrl(key, 900, req.user.id, {
        filename,
        contentType: parsed.data.contentType,
      });
      return res.json({
        uploadUrl: presigned.uploadUrl,
        key,
        downloadUrl: download.downloadUrl,
        mode: presigned.mode,
        expiresInSeconds: 600,
        maxBytes: MAX_COURSE_UPLOAD_BYTES,
      });
    } catch (error) {
      return next(error);
    }
  });

  app.put(
    "/api/uploads/direct",
    authenticate,
    requireRole("Admin", "Manager"),
    express.raw({ type: () => true, limit: MAX_COURSE_UPLOAD_BYTES }),
    async (req, res) => {
      const token = typeof req.query.token === "string" ? req.query.token : "";
      if (!token) return res.status(400).json({ error: "A scoped upload grant is required" });
      const grant = verifyLocalGrant({ token, purpose: "local-upload", subjectId: req.user.id });
      if (!grant) return res.status(403).json({ error: "Invalid or expired upload grant" });
      if (consumedLocalUploadGrants.has(grant.jti)) return res.status(409).json({ error: "Upload grant has already been used" });

      const contentType = String(req.headers["content-type"] || "").split(";", 1)[0].trim().toLowerCase();
      if (contentType !== grant.contentType) return res.status(415).json({ error: "Content type does not match the upload grant" });
      if (!Buffer.isBuffer(req.body) || req.body.length === 0 || req.body.length > Number(grant.maxBytes || 0)) {
        return res.status(400).json({ error: "Upload payload is empty or exceeds its grant" });
      }
      if (!bufferMatchesContentType(req.body, contentType)) {
        return res.status(415).json({ error: "File signature does not match the declared content type" });
      }

      try {
        const result = await uploadBuffer(grant.key, req.body, contentType);
        consumedLocalUploadGrants.add(grant.jti);
        audit(req.user.id, "UPLOAD_STORED", "OBJECT", result.key, { contentType, sizeBytes: req.body.length });
        return res.json({ ok: true, key: result.key, mode: result.mode });
      } catch (error) {
        if (error?.code === "EEXIST") return res.status(409).json({ error: "Object already exists" });
        return res.status(500).json({ error: "Upload failed" });
      }
    },
  );

  app.get("/api/uploads/download", authenticate, (req, res) => {
    const token = typeof req.query.token === "string" ? req.query.token : "";
    const grant = verifyLocalGrant({ token, purpose: "local-download", subjectId: req.user.id });
    if (!grant) return res.status(403).json({ error: "Invalid or expired download grant" });
    const object = readLocalObject(grant.key);
    if (!object) return res.status(404).json({ error: "Object not found" });

    const filename = String(grant.filename || path.posix.basename(grant.key)).replace(/[\r\n"\\]/g, "_");
    res.set({
      "Content-Type": String(grant.contentType || "application/octet-stream"),
      "Content-Disposition": `attachment; filename="${filename}"`,
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox; default-src 'none'",
      "Cache-Control": "private, no-store",
    });
    return res.sendFile(object.target);
  });

  app.get("/api/content/:courseId/:chapterId/url", authenticate, async (req, res, next) => {
    const { courseId, chapterId } = req.params;
    let chapter;
    try {
      if (usePgCourses) {
        ({ chapter } = await authority.authorizeContentDownload({ courseId, chapterId, actor: req.user }));
      } else {
        const course = courses.find((item) => item.id === courseId);
        const privileged = course && (isAdmin(req.user.role) || course.ownerId === req.user.id);
        if (!course || (!privileged && (course.status !== "Active" || course.approval !== "Approved"))) {
          return res.status(404).json({ error: "Course not found" });
        }
        const enrollment = assignments.find((item) => item.courseId === courseId && item.userId === req.user.id);
        if (!privileged && !enrollment) return res.status(403).json({ error: "Enrollment required to access this content" });
        const ordered = chapters
          .filter((item) => item.courseId === courseId)
          .sort((left, right) => Number(left.sequence || 0) - Number(right.sequence || 0));
        chapter = ordered.find((item) => item.id === chapterId);
        if (!chapter) return res.status(404).json({ error: "Chapter not found" });
        if (!privileged) {
          const chapterIndex = ordered.findIndex((item) => item.id === chapterId);
          const completed = enrollment.completedChapters || [];
          const locked = ordered.slice(0, chapterIndex).find((item) => !completed.includes(item.id));
          if (locked) return res.status(403).json({ error: "Prerequisite chapter incomplete", code: "CHAPTER_LOCKED" });
        }
      }
    } catch (error) {
      const status = learningErrorStatus(error);
      if (status) return res.status(status).json({ error: error.message, code: error.code, ...(Object.keys(error.details || {}).length ? { details: error.details } : {}) });
      return next(error);
    }
    const objectKey = chapter.url || chapter.fileName;
    if (!objectKey) return res.status(404).json({ error: "No media file associated with this chapter" });
    const allowedPrefixes = [`course_media/${courseId}/`, `chapter_pdf/${courseId}/`];
    const keySegmentsAreSafe = String(objectKey).split("/").every((segment) => segment && segment !== "." && segment !== "..");
    if (!keySegmentsAreSafe || !allowedPrefixes.some((prefix) => String(objectKey).startsWith(prefix))) {
      return res.status(404).json({ error: "No managed media file associated with this chapter" });
    }

    const contentType = chapter.contentType === "PDF" ? "application/pdf" : "application/octet-stream";
    try {
      const download = await getPresignedDownloadUrl(objectKey, 900, req.user.id, {
        filename: chapter.fileName || `${chapter.id}.bin`,
        contentType,
      });
      return res.json({ url: download.downloadUrl, expiresInSeconds: 900 });
    } catch (error) {
      return next(error);
    }
  });

  app.post(
    "/api/proctoring/captures",
    authenticate,
    requireAttemptPermission("view"),
    async (req, res) => {
      const schema = z.object({
        attemptId: z.string().min(1).max(200),
        questionId: z.string().max(200).optional(),
        imageData: z.string().min(1).max(Math.ceil(MAX_PROCTOR_CAPTURE_BYTES * 4 / 3) + 64),
      }).strict();
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

      const match = /^data:image\/jpeg;base64,([A-Za-z0-9+/]*={0,2})$/.exec(parsed.data.imageData);
      const buffer = decodeBase64Strict(match ? match[1] : parsed.data.imageData);
      if (!buffer || buffer.length > MAX_PROCTOR_CAPTURE_BYTES || !bufferMatchesContentType(buffer, "image/jpeg")) {
        return res.status(415).json({ error: "A valid JPEG capture is required" });
      }

      const captureId = uuid();
      const key = `proctoring/${req.authorizedAttempt.id}/${captureId}.jpg`;
      try {
        const saved = await uploadBuffer(key, buffer, "image/jpeg");
        const capture = {
          id: captureId,
          attemptId: req.authorizedAttempt.id,
          questionId: parsed.data.questionId || null,
          key: saved.key,
          sizeBytes: buffer.length,
          createdAt: new Date().toISOString(),
        };
        req.authorizedAttempt.proctorCaptures = req.authorizedAttempt.proctorCaptures || [];
        req.authorizedAttempt.proctorCaptures.push(capture);
        audit(req.user.id, "PROCTOR_CAPTURE_STORED", "ATTEMPT", req.authorizedAttempt.id, { captureId, sizeBytes: buffer.length });
        return res.status(201).json(capture);
      } catch {
        return res.status(500).json({ error: "Capture upload failed" });
      }
    },
  );
}
