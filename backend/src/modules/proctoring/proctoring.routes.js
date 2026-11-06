// Module: WebRTC Proctoring, Continuous Video Chunk Recording, Edge Vision Anomaly Engine & Mobile Companion Pairing.
import { z } from "zod";
import multer from "multer";
import { v4 as uuid } from "uuid";
import { attempts, proctoringLogs, assessments, settings, now, isAdmin } from "../../core.js";
import { audit, addAssessmentTime } from "../../domain.js";
import { authenticate } from "../../middleware.js";
import { requireAttemptPermission } from "../../security/authorization.js";
import { uploadBuffer } from "../../storage/object-store.js";
import { postSignal, getSignals } from "./signaling.js";
import { authorizeCompanionToken, createPairingToken, verifyAndPairCompanion, updateCompanionHeartbeat } from "./pairing.js";
import { attemptsRepository, AttemptRepositoryError } from "../../repositories/attempts.repository.pg.js";
import { upsertAttemptProjection } from "../../attempt-projection.js";
import { settingsRepository } from "../../repositories/settings.repository.pg.js";
import { relationalAttemptsEnabled } from "../../runtime-modes.js";

const USE_RELATIONAL_ATTEMPTS = relationalAttemptsEnabled();
const USE_PG_SETTINGS = process.env.USE_PG_SETTINGS === "1";
const attemptErrorStatus = (error) => {
  if (!(error instanceof AttemptRepositoryError)) return error.status || 400;
  if (error.code === "ATTEMPT_NOT_FOUND") return 404;
  if (["ATTEMPT_CONFLICT", "ATTEMPT_CLOSED"].includes(error.code)) return 409;
  return 500;
};

// In-memory multer storage for video chunks to stream directly into object storage
const chunkUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max per chunk
});

export const PROCTORING_EVENT_TYPES = [
  "FACE_ABSENT",
  "MULTIPLE_FACES",
  "GAZE_AWAY",
  "DEVICE_DETECTED",
  "TAB_SWITCH",
  "FULLSCREEN_EXIT",
  "AUDIO_SPIKE",
  "CAMERA_OFF",
  "MIC_OFF",
  "COMPANION_DISCONNECTED",
  "FACE_MISMATCH",
  "NOISE",
];

export function registerProctoring(app) {
  const authorizeAttemptOrCompanion = async (req, res, next) => {
    const companionToken = req.headers["x-companion-token"];
    if (typeof companionToken === "string") {
      const authorized = await authorizeCompanionToken(companionToken, req.params.attemptId);
      if (!authorized) return res.status(401).json({ error: "Invalid, expired, or revoked companion token" });
      req.authorizedAttempt = authorized.attempt;
      req.companionAuthenticated = true;
      return next();
    }
    return authenticate(req, res, () => requireAttemptPermission("view")(req, res, next));
  };

  // ── Record Proctoring Anomaly Event (with Real-Time Trust Score Calculation) ──
  const recordEvent = async (req, res, attemptId) => {
    const schema = z.object({
      attemptId: z.string().optional(),
      eventType: z.enum(PROCTORING_EVENT_TYPES),
      severity: z.enum(["low", "medium", "high"]),
      confidence: z.number().min(0).max(1).optional(),
      captureKey: z.string().optional(),
      metadata: z.record(z.string(), z.any()).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const targetAttemptId = attemptId || parsed.data.attemptId;
    if (!targetAttemptId) return res.status(400).json({ error: "attemptId is required" });

    const attempt = req.authorizedAttempt;
    // Resolve policy before mutating the attempt projection so an authority
    // outage cannot leave an uncommitted flag/trust-score side effect behind.
    const proctoringSettings = USE_PG_SETTINGS
      ? await settingsRepository.getProctoring()
      : settings;

    // Initialize trust score if not present
    if (attempt.trustScore === undefined) {
      attempt.trustScore = 100;
    }

    // Deduct trust points based on severity
    const penalty = parsed.data.severity === "high" ? 15 : parsed.data.severity === "medium" ? 5 : 2;
    attempt.trustScore = Math.max(0, attempt.trustScore - penalty);

    const event = {
      id: uuid(),
      attemptId: attempt.id,
      userId: attempt.userId,
      eventType: parsed.data.eventType,
      severity: parsed.data.severity,
      confidence: parsed.data.confidence ?? 1.0,
      captureKey: parsed.data.captureKey || null,
      metadata: parsed.data.metadata || {},
      trustScoreAfter: attempt.trustScore,
      createdAt: now(),
    };

    attempt.flags = attempt.flags || [];
    attempt.flags.push(event);

    // Auto-submit on tab switch if strict policy is enabled
    if (proctoringSettings.tabSwitchAutoSubmit && parsed.data.eventType === "TAB_SWITCH" && !attempt.submittedAt) {
      const submittedAt = now();
      const timeSpentSeconds = Math.max(
        1,
        Math.round((new Date(submittedAt).getTime() - new Date(attempt.startedAt).getTime()) / 1000)
      );
      Object.assign(attempt, {
        status: "AutoSubmitted",
        submittedAt,
        autoSubmittedReason: "TAB_SWITCH",
        timeSpentSeconds,
      });
      if (!USE_RELATIONAL_ATTEMPTS) {
        const assessment = assessments.find((item) => item.id === attempt.assessmentId);
        addAssessmentTime({ attempt, assessment, seconds: timeSpentSeconds });
      }
    }

    if (USE_RELATIONAL_ATTEMPTS) {
      try {
        const committed = await attemptsRepository.recordProctorEvent({
          attempt,
          event,
          expectedVersion: attempt.version,
          actorId: req.user.id,
          enrollment: attempt.status === "AutoSubmitted"
            ? { addTimeSeconds: attempt.timeSpentSeconds || 0 }
            : null,
        });
        upsertAttemptProjection(committed.attempt);
      } catch (error) {
        return res.status(attemptErrorStatus(error)).json({ error: error.message });
      }
    } else {
      proctoringLogs.unshift(event);
      if (proctoringLogs.length > 5000) proctoringLogs.length = 5000;
      audit(req.user.id, "PROCTORING_EVENT", "PROCTORING_LOG", event.id, {
        eventType: event.eventType,
        severity: event.severity,
        trustScore: attempt.trustScore,
      });
    }

    res.status(201).json({
      data: event,
      trustScore: attempt.trustScore,
      totalFlags: attempt.flags.length,
      autoSubmitted: attempt.status === "AutoSubmitted",
    });
  };

  // Modern scoped route
  app.post("/api/proctoring/attempts/:attemptId/events", authenticate, requireAttemptPermission("view"), async (req, res) => {
    await recordEvent(req, res, req.params.attemptId);
  });

  // Backward compatible route
  app.post("/api/proctoring/events", authenticate, requireAttemptPermission("view"), async (req, res) => {
    await recordEvent(req, res, req.body.attemptId);
  });

  // ── Retrieve Exam Attempt Proctoring Log & Trust Score ──
  app.get("/api/proctoring/attempts/:attemptId/events", authenticate, requireAttemptPermission("view"), (req, res) => {
    const attempt = req.authorizedAttempt;

    res.json({
      data: {
        attemptId: attempt.id,
        trustScore: attempt.trustScore ?? 100,
        flags: attempt.flags || [],
        totalEvents: (attempt.flags || []).length,
        status: attempt.status,
      },
    });
  });

  // ── Continuous Video Chunk Recording Pipeline ──
  app.post(
    "/api/proctoring/attempts/:attemptId/chunks",
    authorizeAttemptOrCompanion,
    chunkUpload.single("chunk"),
    async (req, res) => {
      const attempt = req.authorizedAttempt;

      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ error: "No video chunk binary received" });
      }

      const chunkIndex = parseInt(req.body.chunkIndex, 10) || 0;
      const streamRole = req.body.streamRole === "companion" ? "companion" : "primary";
      if (req.companionAuthenticated && streamRole !== "companion") {
        return res.status(403).json({ error: "Companion tokens may only upload companion media" });
      }
      const durationSeconds = parseFloat(req.body.durationSeconds) || 10;

      const storageKey = `proctoring/${attempt.id}/${streamRole}_chunk_${String(chunkIndex).padStart(4, "0")}.webm`;

      try {
        const stored = await uploadBuffer(storageKey, req.file.buffer, "video/webm");

        attempt.videoChunks = attempt.videoChunks || [];
        const chunkMeta = {
          chunkIndex,
          streamRole,
          key: stored.key,
          sizeBytes: req.file.size,
          durationSeconds,
          recordedAt: now(),
        };

        let totalChunks;
        if (USE_RELATIONAL_ATTEMPTS) {
          const saved = await attemptsRepository.appendVideoChunk({
            attemptId: attempt.id,
            chunk: chunkMeta,
            actorId: req.user?.id || attempt.userId,
          });
          upsertAttemptProjection(saved);
          totalChunks = saved.videoChunks.length;
        } else {
          attempt.videoChunks.push(chunkMeta);
          totalChunks = attempt.videoChunks.length;
        }

        res.status(201).json({
          ok: true,
          data: chunkMeta,
          totalChunks,
        });
      } catch (err) {
        res.status(500).json({ error: `Failed to persist video chunk: ${err.message}` });
      }
    }
  );

  // ── Video Chunk Manifest for Review ──
  app.get("/api/proctoring/attempts/:attemptId/chunks", authenticate, requireAttemptPermission("view"), (req, res) => {
    const attempt = req.authorizedAttempt;

    const chunks = attempt.videoChunks || [];
    const primaryChunks = chunks.filter((c) => c.streamRole === "primary");
    const companionChunks = chunks.filter((c) => c.streamRole === "companion");

    res.json({
      data: {
        attemptId: attempt.id,
        totalChunks: chunks.length,
        primaryCount: primaryChunks.length,
        companionCount: companionChunks.length,
        chunks,
      },
    });
  });

  // ── WebRTC Signaling Broker (Offer, Answer, ICE Candidates) ──
  app.post("/api/proctoring/attempts/:attemptId/signal", authenticate, requireAttemptPermission("view"), async (req, res) => {
    const schema = z.object({
      targetRole: z.enum(["candidate", "proctor", "companion", "all"]),
      type: z.enum(["offer", "answer", "ice-candidate", "ping"]),
      streamRole: z.enum(["primary", "companion"]).default("primary"),
      data: z.any(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const attempt = req.authorizedAttempt;

    const signal = await postSignal(attempt.id, {
      senderId: req.user.id,
      targetRole: parsed.data.targetRole,
      type: parsed.data.type,
      streamRole: parsed.data.streamRole,
      data: parsed.data.data,
    });

    res.status(201).json({ ok: true, data: signal });
  });

  app.get("/api/proctoring/attempts/:attemptId/signals", authenticate, requireAttemptPermission("view"), async (req, res) => {
    const attempt = req.authorizedAttempt;

    const since = parseInt(req.query.since, 10) || 0;
    const targetRole = req.query.targetRole || null;

    const signals = await getSignals(attempt.id, { targetRole, sinceTimestamp: since });
    res.json({ data: signals, count: signals.length });
  });

  // ── Mobile Companion Camera Pairing via QR Code ──
  app.post("/api/proctoring/attempts/:attemptId/companion/token", authenticate, requireAttemptPermission("view"), async (req, res) => {
    const attempt = req.authorizedAttempt;

    if (attempt.userId !== req.user.id && !isAdmin(req.user.role)) {
      return res.status(403).json({ error: "Only the candidate or an administrator can create a companion token" });
    }

    const tokenData = await createPairingToken(attempt.id, attempt.userId);
    res.json({ data: tokenData });
  });

  app.post("/api/proctoring/companion/pair", async (req, res) => {
    const schema = z.object({
      pairingToken: z.string().min(10),
      deviceName: z.string().optional(),
      userAgent: z.string().optional(),
      batteryLevel: z.number().min(0).max(100).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    try {
      const result = await verifyAndPairCompanion(parsed.data.pairingToken, {
        deviceName: parsed.data.deviceName,
        userAgent: parsed.data.userAgent,
        batteryLevel: parsed.data.batteryLevel,
      });

      res.status(200).json({
        ok: true,
        message: "Mobile companion camera successfully paired",
        data: result,
      });
    } catch (err) {
      res.status(err.status || 400).json({ error: err.message });
    }
  });

  app.post("/api/proctoring/attempts/:attemptId/companion/ping", async (req, res) => {
    const companionToken = req.headers["x-companion-token"];
    if (typeof companionToken !== "string") return res.status(401).json({ error: "Companion token required" });
    const updated = await updateCompanionHeartbeat(companionToken, req.params.attemptId, {
      batteryLevel: req.body.batteryLevel,
    });
    if (!updated) return res.status(401).json({ error: "Invalid, expired, or revoked companion token" });
    res.json({ ok: true, timestamp: now() });
  });

  app.get("/api/proctoring/attempts/:attemptId/companion/status", authenticate, requireAttemptPermission("view"), (req, res) => {
    const attempt = req.authorizedAttempt;

    res.json({
      data: {
        attemptId: attempt.id,
        isPaired: !!attempt.companion?.paired,
        companion: attempt.companion || null,
      },
    });
  });
}
