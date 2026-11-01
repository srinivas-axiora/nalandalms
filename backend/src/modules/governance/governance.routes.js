import { auditLogs, securityEvents, archives, users, courses, chapters, assessments, assignments, sessionVersions } from "../../core.js";
import { audit } from "../../domain.js";
import { authenticate, requireRole, requireStepUp } from "../../middleware.js";
import { redactSensitive } from "../../security/redaction.js";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
// Module: Governance (audit logs, security events, archive + restore).
// Handlers moved verbatim from server.js; shared deps injected via ctx.
export function registerGovernance(app) {
  app.get("/api/archive", authenticate, requireRole("Super Admin"), (req, res) => {
    res.json({ data: redactSensitive(archives), total: archives.length });
  });

  app.post("/api/archive/:id/restore", authenticate, requireRole("Super Admin"), requireStepUp, (req, res) => {
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
    audit(req.user.id, "RESTORE_ARCHIVE", record.entityType.toUpperCase(), record.entityId);
    res.json({ success: true, message: `${record.entityType} restored` });
  });

  app.get("/api/audit-logs", authenticate, requireRole("Admin"), (req, res) => {
    const limit = Math.min(Number(req.query.limit || 50), 200);
    res.json({ data: redactSensitive(auditLogs.slice(0, limit)), total: auditLogs.length });
  });

  app.get("/api/security-events", authenticate, requireRole("Admin"), (req, res) => {
    const limit = Math.min(Number(req.query.limit || 100), 500);
    res.json({ data: redactSensitive(securityEvents.slice(0, limit)), total: securityEvents.length });
  });
}
