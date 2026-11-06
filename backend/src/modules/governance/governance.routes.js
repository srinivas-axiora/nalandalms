import { auditLogs, securityEvents, archives, users, courses, chapters, assessments, assignments, sessionVersions } from "../../core.js";
import { audit } from "../../domain.js";
import { authenticate, requireRole, requireStepUp } from "../../middleware.js";
import { redactSensitive } from "../../security/redaction.js";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { identityRepository } from "../../repositories/identity.repository.pg.js";
import { upsertIdentityProjection } from "../../identity-projection.js";
import { securityEvidenceRepository } from "../../repositories/security-evidence.repository.pg.js";
import {
  archiveAuthorityRepository,
  ArchiveAuthorityError,
} from "../../repositories/archive-authority.repository.pg.js";

const USE_PG_IDENTITY = process.env.USE_PG_IDENTITY === "1";
const USE_PG_COURSES = process.env.USE_PG_COURSES === "1";
const USE_PG_AUDIT = process.env.USE_PG_AUDIT === "1";
// Module: Governance (audit logs, security events, archive + restore).
// Handlers moved verbatim from server.js; shared deps injected via ctx.
export function registerGovernance(app) {
  app.get("/api/archive", authenticate, requireRole("Super Admin"), async (req, res) => {
    const relationalTypes = [
      ...(USE_PG_IDENTITY ? ["User"] : []),
      ...(USE_PG_COURSES ? ["Course", "Assessment"] : []),
    ];
    if (relationalTypes.length) {
      const relationalArchives = await archiveAuthorityRepository.listArchives({ entityTypes: relationalTypes });
      const snapshotArchives = archives.filter((item) => !relationalTypes.includes(item.entityType));
      const data = [...relationalArchives, ...snapshotArchives]
        .sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());
      return res.json({ data: redactSensitive(data), total: data.length });
    }
    return res.json({ data: redactSensitive(archives), total: archives.length });
  });

  app.post("/api/archive/:id/restore", authenticate, requireRole("Super Admin"), requireStepUp, async (req, res) => {
    if (USE_PG_IDENTITY || USE_PG_COURSES) {
      const archive = await archiveAuthorityRepository.findArchiveById(req.params.id);
      if (archive?.entityType === "User" && USE_PG_IDENTITY) {
        const restored = await identityRepository.restoreUserArchive({
          archiveId: req.params.id,
          actorId: req.user.id,
          replacementPasswordHash: bcrypt.hashSync(crypto.randomBytes(32).toString("hex"), 10),
        });
        if (restored) {
          upsertIdentityProjection(restored);
          return res.json({
            success: true,
            message: "User restored as inactive; an administrator must set a new password before activation",
          });
        }
      }
      if (["Course", "Assessment"].includes(archive?.entityType) && USE_PG_COURSES) {
        try {
          const restored = await archiveAuthorityRepository.restoreAuthoringArchive({
            archiveId: req.params.id,
            actor: req.user,
          });
          if (restored) {
            return res.json({
              success: true,
              message: `${restored.entityType} restored as inactive draft for review`,
            });
          }
        } catch (error) {
          if (error instanceof ArchiveAuthorityError) {
            const status = ["ARCHIVE_CONFLICT", "ARCHIVE_INCOMPLETE", "ARCHIVE_PARENT_MISSING"]
              .includes(error.code) ? 409 : 400;
            return res.status(status).json({ error: error.message, code: error.code, details: error.details });
          }
          throw error;
        }
      }
    }
    const idx = archives.findIndex((item) => item.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Archived record not found" });

    const record = archives[idx];
    if (record.entityType === "User") {
      const restoredUser = {
        ...redactSensitive(record.entityData),
        status: "Inactive",
        passwordHash: bcrypt.hashSync(crypto.randomBytes(32).toString("hex"), 10),
      };
      users.unshift(restoredUser);
      sessionVersions[restoredUser.id] = (sessionVersions[restoredUser.id] || 0) + 1;
    } else if (record.entityType === "Course") {
      courses.unshift(record.entityData);
      if (record.relatedData?.chapters) chapters.unshift(...record.relatedData.chapters);
      if (record.relatedData?.assessments) assessments.unshift(...record.relatedData.assessments);
      if (record.relatedData?.enrollments) assignments.unshift(...record.relatedData.enrollments);
    } else if (record.entityType === "Assessment") {
      assessments.unshift(record.entityData);
    }

    archives.splice(idx, 1);
    await audit(req.user.id, "RESTORE_ARCHIVE", record.entityType.toUpperCase(), record.entityId);
    res.json({ success: true, message: `${record.entityType} restored` });
  });

  app.get("/api/audit-logs", authenticate, requireRole("Admin"), async (req, res) => {
    const limit = Number(req.query.limit || 50);
    if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
      return res.status(400).json({ error: "limit must be an integer between 1 and 200" });
    }
    if (USE_PG_AUDIT) return res.json(await securityEvidenceRepository.listAudit({ limit }));
    return res.json({ data: redactSensitive(auditLogs.slice(0, limit)), total: auditLogs.length });
  });

  app.get("/api/security-events", authenticate, requireRole("Admin"), async (req, res) => {
    const limit = Number(req.query.limit || 100);
    if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
      return res.status(400).json({ error: "limit must be an integer between 1 and 500" });
    }
    if (USE_PG_AUDIT) return res.json(await securityEvidenceRepository.listSecurityEvents({ limit }));
    return res.json({ data: redactSensitive(securityEvents.slice(0, limit)), total: securityEvents.length });
  });
}
