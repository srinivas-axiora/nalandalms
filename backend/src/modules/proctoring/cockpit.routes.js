// Module: Live Proctoring Cockpit, Real-Time Remote Interventions & Incident Timeline Replay.
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { attempts, assessments, courses, users, assignments, now, isAdmin } from "../../core.js";
import { audit } from "../../domain.js";
import { authenticate, requireRole } from "../../middleware.js";
import { getExamClock } from "../assessments/exam.service.js";
import { postSignal } from "./signaling.js";
import { ENROLLMENT_STATUS } from "../enrollments/progress.service.js";

export function registerCockpit(app) {
  // ── Live Active Exam Sessions Grid ──
  app.get("/api/proctoring/cockpit/active", authenticate, requireRole("Admin", "Manager", "Instructor"), (req, res) => {
    let activeAttempts = attempts.filter((a) => a.status === "InProgress" || a.status === "Paused");

    // Scope for instructor
    if (req.user.role === "Instructor") {
      const ownedCourseIds = new Set(courses.filter((c) => c.ownerId === req.user.id).map((c) => c.id));
      activeAttempts = activeAttempts.filter((a) => ownedCourseIds.has(a.courseId));
    }

    const sessionGrid = activeAttempts.map((attempt) => {
      const user = users.find((u) => u.id === attempt.userId);
      const assessment = assessments.find((asm) => asm.id === attempt.assessmentId);
      const course = courses.find((c) => c.id === attempt.courseId);

      const clock = assessment ? getExamClock(attempt, assessment) : { durationSeconds: 0, timeRemainingSeconds: 0 };
      const flags = attempt.flags || [];
      const trustScore = attempt.trustScore ?? 100;

      // Classify risk level
      const riskLevel = trustScore < 50 ? "high" : trustScore < 80 ? "medium" : "low";

      // Stream availability
      const chunks = attempt.videoChunks || [];
      const hasPrimaryStream = chunks.some((c) => c.streamRole === "primary");
      const hasCompanionStream = chunks.some((c) => c.streamRole === "companion") || !!attempt.companion?.paired;

      return {
        attemptId: attempt.id,
        candidateId: attempt.userId,
        candidateName: user?.name || "Unknown Candidate",
        candidateEmail: user?.email || "",
        courseId: attempt.courseId,
        courseTitle: course?.title || "Unknown Course",
        assessmentId: attempt.assessmentId,
        assessmentTitle: assessment?.title || "Exam",
        startedAt: attempt.startedAt,
        status: attempt.status,
        isPaused: !!attempt.isPaused,
        timeSpentSeconds: clock.elapsedSeconds || 0,
        timeRemainingSeconds: clock.timeRemainingSeconds || 0,
        trustScore,
        riskLevel,
        flagsCount: flags.length,
        recentFlags: flags.slice(-3).reverse(),
        hasPrimaryStream,
        hasCompanionStream,
        companionDevice: attempt.companion?.deviceName || null,
        activeWarningsCount: (attempt.warnings || []).length,
      };
    });

    // Auto-sort by risk severity: high risk first, then medium, then low
    const riskRank = { high: 0, medium: 1, low: 2 };
    sessionGrid.sort((a, b) => riskRank[a.riskLevel] - riskRank[b.riskLevel] || a.trustScore - b.trustScore);

    res.json({ data: sessionGrid, total: sessionGrid.length });
  });

  // ── Remote Candidate Warning Overlay ──
  app.post("/api/proctoring/attempts/:attemptId/warn", authenticate, requireRole("Admin", "Manager", "Instructor"), (req, res) => {
    const schema = z.object({
      message: z.string().min(3),
      severity: z.enum(["low", "medium", "critical"]).default("medium"),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const attempt = attempts.find((a) => a.id === req.params.attemptId);
    if (!attempt) return res.status(404).json({ error: "Exam attempt not found" });

    const warning = {
      id: `WARN-${uuid().slice(0, 8)}`,
      attemptId: attempt.id,
      message: parsed.data.message,
      severity: parsed.data.severity,
      sentBy: req.user.id,
      sentByName: req.user.name || "Chief Proctor",
      sentAt: now(),
      acknowledged: false,
    };

    attempt.warnings = attempt.warnings || [];
    attempt.warnings.push(warning);

    // Also deduct trust score for critical warnings
    if (parsed.data.severity === "critical") {
      attempt.trustScore = Math.max(0, (attempt.trustScore ?? 100) - 10);
    }

    // Push notification to candidate via signaling broker
    postSignal(attempt.id, {
      senderId: req.user.id,
      targetRole: "candidate",
      type: "ping",
      data: { type: "REMOTE_WARNING", warning },
    });

    audit(req.user.id, "PROCTOR_WARN_CANDIDATE", "ASSESSMENT_ATTEMPT", attempt.id, {
      warningId: warning.id,
      message: warning.message,
    });

    res.status(201).json({ ok: true, data: warning });
  });

  // ── Candidate Warning Polling & Acknowledgement ──
  app.get("/api/assessments/attempts/:attemptId/warnings", authenticate, (req, res) => {
    const attempt = attempts.find((a) => a.id === req.params.attemptId);
    if (!attempt) return res.status(404).json({ error: "Exam attempt not found" });

    if (attempt.userId !== req.user.id && !isAdmin(req.user.role) && req.user.role !== "Instructor") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const unacknowledged = (attempt.warnings || []).filter((w) => !w.acknowledged);
    res.json({ data: unacknowledged, total: unacknowledged.length });
  });

  app.post("/api/assessments/attempts/:attemptId/warnings/:warningId/ack", authenticate, (req, res) => {
    const attempt = attempts.find((a) => a.id === req.params.attemptId);
    if (!attempt) return res.status(404).json({ error: "Exam attempt not found" });

    const warning = (attempt.warnings || []).find((w) => w.id === req.params.warningId);
    if (!warning) return res.status(404).json({ error: "Warning not found" });

    warning.acknowledged = true;
    warning.acknowledgedAt = now();

    res.json({ ok: true, data: warning });
  });

  // ── Remote Clock Pause & Resume ──
  app.post("/api/proctoring/attempts/:attemptId/pause", authenticate, requireRole("Admin", "Manager", "Instructor"), (req, res) => {
    const attempt = attempts.find((a) => a.id === req.params.attemptId);
    if (!attempt) return res.status(404).json({ error: "Exam attempt not found" });
    if (attempt.status !== "InProgress") return res.status(400).json({ error: "Can only pause in-progress attempts" });

    attempt.isPaused = true;
    attempt.status = "Paused";
    attempt.pausedAt = now();

    audit(req.user.id, "PROCTOR_PAUSE_EXAM", "ASSESSMENT_ATTEMPT", attempt.id);
    res.json({ ok: true, message: "Exam session paused", status: attempt.status });
  });

  app.post("/api/proctoring/attempts/:attemptId/resume", authenticate, requireRole("Admin", "Manager", "Instructor"), (req, res) => {
    const attempt = attempts.find((a) => a.id === req.params.attemptId);
    if (!attempt) return res.status(404).json({ error: "Exam attempt not found" });
    if (!attempt.isPaused && attempt.status !== "Paused") return res.status(400).json({ error: "Attempt is not paused" });

    const pausedMs = attempt.pausedAt ? Date.now() - new Date(attempt.pausedAt).getTime() : 0;
    if (attempt.expiresAt && pausedMs > 0) {
      // Extend expiration by the paused duration
      attempt.expiresAt = new Date(new Date(attempt.expiresAt).getTime() + pausedMs).toISOString();
    }

    attempt.isPaused = false;
    attempt.status = "InProgress";
    attempt.resumedAt = now();

    audit(req.user.id, "PROCTOR_RESUME_EXAM", "ASSESSMENT_ATTEMPT", attempt.id, { pausedSeconds: Math.round(pausedMs / 1000) });
    res.json({ ok: true, message: "Exam session resumed", status: attempt.status, expiresAt: attempt.expiresAt });
  });

  // ── Remote Candidate Disqualification & Immediate Termination ──
  app.post("/api/proctoring/attempts/:attemptId/terminate", authenticate, requireRole("Admin", "Manager", "Instructor"), (req, res) => {
    const schema = z.object({
      reason: z.string().min(5),
      evidenceSummary: z.string().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const attempt = attempts.find((a) => a.id === req.params.attemptId);
    if (!attempt) return res.status(404).json({ error: "Exam attempt not found" });
    if (attempt.submittedAt && attempt.status !== "InProgress" && attempt.status !== "Paused") {
      return res.status(409).json({ error: "Attempt has already been finalized" });
    }

    const terminatedAt = now();
    attempt.status = "Terminated";
    attempt.submittedAt = terminatedAt;
    attempt.autoSubmittedReason = "PROCTOR_DISQUALIFIED";
    attempt.terminatedReason = parsed.data.reason;
    attempt.terminatedBy = req.user.id;
    attempt.terminatedAt = terminatedAt;
    attempt.score = 0;
    attempt.feedback = `Disqualified by proctor: ${parsed.data.reason}`;

    // Mark enrollment as Failed
    const assignment = assignments.find((a) => a.courseId === attempt.courseId && a.userId === attempt.userId);
    if (assignment) {
      assignment.status = ENROLLMENT_STATUS.FAILED;
    }

    audit(req.user.id, "PROCTOR_TERMINATE_EXAM", "ASSESSMENT_ATTEMPT", attempt.id, {
      reason: parsed.data.reason,
      evidenceSummary: parsed.data.evidenceSummary || "",
    });

    res.json({
      ok: true,
      message: "Candidate disqualified and exam terminated immediately",
      data: {
        attemptId: attempt.id,
        status: attempt.status,
        score: attempt.score,
        reason: attempt.terminatedReason,
      },
    });
  });

  // ── Chronological Incident Timeline & Session Replay ──
  app.get("/api/proctoring/attempts/:attemptId/timeline", authenticate, requireRole("Admin", "Manager", "Instructor"), (req, res) => {
    const attempt = attempts.find((a) => a.id === req.params.attemptId);
    if (!attempt) return res.status(404).json({ error: "Exam attempt not found" });

    const user = users.find((u) => u.id === attempt.userId);
    const assessment = assessments.find((asm) => asm.id === attempt.assessmentId);

    const timeline = [];

    // 1. Start event
    timeline.push({
      timestamp: attempt.startedAt,
      type: "EXAM_STARTED",
      severity: "info",
      title: "Exam Attempt Commenced",
      details: { maxScore: attempt.maxScore },
    });

    // 2. Mobile Companion Paired
    if (attempt.companion?.paired) {
      timeline.push({
        timestamp: attempt.companion.pairedAt,
        type: "COMPANION_PAIRED",
        severity: "info",
        title: "Mobile Companion Camera Connected",
        details: { deviceName: attempt.companion.deviceName },
      });
    }

    // 3. Proctoring Anomaly Flags
    for (const flag of attempt.flags || []) {
      timeline.push({
        timestamp: flag.createdAt,
        type: flag.eventType,
        severity: flag.severity,
        title: `Anomaly: ${flag.eventType.replace(/_/g, " ")}`,
        details: {
          confidence: flag.confidence,
          metadata: flag.metadata,
          trustScoreAfter: flag.trustScoreAfter,
        },
      });
    }

    // 4. Warnings Issued
    for (const warn of attempt.warnings || []) {
      timeline.push({
        timestamp: warn.sentAt,
        type: "PROCTOR_WARNING",
        severity: warn.severity === "critical" ? "high" : "medium",
        title: `Remote Proctor Warning Issued`,
        details: {
          message: warn.message,
          sentByName: warn.sentByName,
          acknowledged: warn.acknowledged,
          acknowledgedAt: warn.acknowledgedAt,
        },
      });
    }

    // 5. Completion or Termination
    if (attempt.submittedAt) {
      timeline.push({
        timestamp: attempt.submittedAt,
        type: attempt.status === "Terminated" ? "EXAM_TERMINATED" : "EXAM_SUBMITTED",
        severity: attempt.status === "Terminated" ? "high" : "info",
        title: attempt.status === "Terminated" ? "Disqualified & Terminated" : "Exam Attempt Submitted",
        details: {
          status: attempt.status,
          score: attempt.score,
          autoSubmittedReason: attempt.autoSubmittedReason,
          terminatedReason: attempt.terminatedReason,
        },
      });
    }

    // Sort chronologically
    timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    res.json({
      data: {
        attemptId: attempt.id,
        candidateName: user?.name || "Unknown Candidate",
        assessmentTitle: assessment?.title || "Exam",
        finalTrustScore: attempt.trustScore ?? 100,
        status: attempt.status,
        timeline,
      },
    });
  });
}

