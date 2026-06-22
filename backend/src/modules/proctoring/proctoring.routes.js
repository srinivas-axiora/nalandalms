// Module: Proctoring events (with tab-switch auto-submit).
// Handler moved verbatim from server.js; shared deps injected via ctx.
import { z } from "zod";
import { v4 as uuid } from "uuid";

export function registerProctoring(app, ctx) {
  const { authenticate, attempts, proctoringLogs, assessments, settings, audit, now, addAssessmentTime } = ctx;

  app.post("/api/proctoring/events", authenticate, (req, res) => {
    const schema = z.object({ attemptId: z.string(), eventType: z.enum(["FULLSCREEN_EXIT", "TAB_SWITCH", "NOISE", "CAMERA_OFF", "MIC_OFF", "FACE_MISMATCH"]), severity: z.enum(["low", "medium", "high"]), metadata: z.record(z.string(), z.any()).optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const attempt = attempts.find((item) => item.id === parsed.data.attemptId);
    if (!attempt || attempt.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const event = { id: uuid(), userId: req.user.id, ...parsed.data, createdAt: now() };
    proctoringLogs.unshift(event);
    if (proctoringLogs.length > 5000) proctoringLogs.length = 5000;
    attempt.flags = attempt.flags || [];
    attempt.flags.push(event);
    if (settings.tabSwitchAutoSubmit && parsed.data.eventType === "TAB_SWITCH" && !attempt.submittedAt) {
      const assessment = assessments.find((item) => item.id === attempt.assessmentId);
      const submittedAt = now();
      const timeSpentSeconds = Math.max(1, Math.round((new Date(submittedAt).getTime() - new Date(attempt.startedAt).getTime()) / 1000));
      Object.assign(attempt, { status: "AutoSubmitted", submittedAt, autoSubmittedReason: "TAB_SWITCH", timeSpentSeconds });
      addAssessmentTime({ attempt, assessment, seconds: timeSpentSeconds });
    }
    audit(req.user.id, "PROCTORING_EVENT", "PROCTORING_LOG", event.id, { eventType: event.eventType });
    res.status(201).json({ data: event, autoSubmitted: attempt?.status === "AutoSubmitted" });
  });
}
