// Privacy, GDPR & DPDPA Compliance (Data Export & Right to Be Forgotten)
import { z } from "zod";
import {
  users,
  assignments,
  attempts,
  proctoringLogs,
  issuedCertificates,
  chapterFeedbacks,
  skillRatings,
  attendanceLogs,
  performanceReviews,
  now,
} from "../../core.js";
import { audit } from "../../domain.js";
import { authenticate, requireStepUp } from "../../middleware.js";
import { registerPrivacyPgRoutes } from "./privacy.pg.routes.js";

const deletionQueue = new Map(); // userId -> { requestedAt, gracePeriodEndsAt, email, reason }
const USE_PG_PRIVACY = process.env.USE_PG_PRIVACY === "1";

export function registerPrivacyCompliance(app) {
  if (USE_PG_PRIVACY) return registerPrivacyPgRoutes(app);
  // ── GDPR Article 20: Data Portability (Complete Personal Data Archive) ──
  app.get("/api/users/me/data-export", authenticate, requireStepUp, (req, res) => {
    const userId = req.user.id;
    const user = users.find((u) => u.id === userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const userEnrollments = assignments.filter((a) => a.userId === userId);
    const userAttempts = attempts.filter((a) => a.userId === userId);
    const userCertificates = issuedCertificates.filter((c) => c.employeeId === userId);
    const userFeedbacks = chapterFeedbacks.filter((f) => f.userId === userId);
    const userRatings = skillRatings.filter((r) => r.userId === userId);
    const userAttendance = attendanceLogs.filter((l) => l.userId === userId);
    const userReviews = performanceReviews.filter((r) => r.userId === userId);
    const userProctoringEvents = proctoringLogs.filter((p) => p.userId === userId);

    const exportPackage = {
      exportMetadata: {
        exportedAt: now(),
        platform: "Nalanda LMS",
        formatVersion: "1.0-GDPR",
        userId,
      },
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
        createdAt: user.createdAt,
      },
      learning: {
        enrollmentsCount: userEnrollments.length,
        enrollments: userEnrollments,
        examAttemptsCount: userAttempts.length,
        examAttempts: userAttempts,
        certificatesCount: userCertificates.length,
        certificates: userCertificates,
      },
      integrity: {
        proctoringRecordsCount: userProctoringEvents.length,
        proctoringEvents: userProctoringEvents,
      },
      interactions: {
        feedbacks: userFeedbacks,
        skillRatings: userRatings,
        attendance: userAttendance,
        performanceReviews: userReviews,
      },
    };

    audit(userId, "GDPR_DATA_EXPORT", "USER", userId);

    res.setHeader("Content-Disposition", `attachment; filename="nalanda-data-export-${userId}.json"`);
    res.json(exportPackage);
  });

  // ── GDPR Article 17 / DPDPA: Right to Erasure (Queue Account Deletion) ──
  app.post("/api/users/me/delete-request", authenticate, requireStepUp, (req, res) => {
    const schema = z.object({
      confirmEmail: z.string().email(),
      reason: z.string().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const user = users.find((u) => u.id === req.user.id);
    if (!user || user.email.toLowerCase() !== parsed.data.confirmEmail.toLowerCase()) {
      return res.status(400).json({ error: "Provided confirmation email does not match account" });
    }

    const graceDays = 30;
    const requestedAt = now();
    const gracePeriodEndsAt = new Date(Date.now() + graceDays * 24 * 60 * 60 * 1000).toISOString();

    deletionQueue.set(user.id, {
      userId: user.id,
      email: user.email,
      requestedAt,
      gracePeriodEndsAt,
      reason: parsed.data.reason || "User requested deletion",
    });

    user.deletionRequestedAt = requestedAt;
    user.deletionScheduledAt = gracePeriodEndsAt;

    audit(user.id, "GDPR_DELETION_REQUESTED", "USER", user.id, { gracePeriodEndsAt });

    res.json({
      ok: true,
      message: `Account deletion scheduled with a ${graceDays}-day grace period. You may cancel this request before the deadline.`,
      scheduledDeletionDate: gracePeriodEndsAt,
    });
  });

  // ── Cancel Deletion Request ──
  app.post("/api/users/me/cancel-delete", authenticate, requireStepUp, (req, res) => {
    const user = users.find((u) => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    deletionQueue.delete(user.id);
    delete user.deletionRequestedAt;
    delete user.deletionScheduledAt;

    audit(user.id, "GDPR_DELETION_CANCELLED", "USER", user.id);

    res.json({ ok: true, message: "Account deletion request successfully cancelled" });
  });
}

