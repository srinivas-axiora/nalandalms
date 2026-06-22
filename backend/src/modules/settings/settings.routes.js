// Module: Settings (proctoring configuration).
// Note: the original handler reassigned the module-scoped `settings` object
// (`settings = {...settings, ...}`). To keep the shared reference valid across
// modules and the persistence snapshot, this mutates in place with Object.assign
// — content-identical behavior, stable reference.
import { z } from "zod";

export function registerSettings(app, ctx) {
  const { authenticate, requireRole, requireStepUp, audit, settings } = ctx;

  app.get("/api/settings", authenticate, requireRole("Admin"), (_req, res) => {
    res.json({ data: settings });
  });

  app.patch("/api/settings", authenticate, requireRole("Admin"), requireStepUp, (req, res) => {
    const schema = z.object({ fullscreenRequired: z.boolean().optional(), cameraRequired: z.boolean().optional(), microphoneRequired: z.boolean().optional(), tabSwitchAutoSubmit: z.boolean().optional(), noiseThreshold: z.number().min(1).max(100).optional(), maxAssessmentFlags: z.number().min(0).optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    Object.assign(settings, parsed.data);
    audit(req.user.id, "UPDATE_SETTINGS", "SETTINGS", "proctoring", parsed.data);
    res.json({ data: settings });
  });
}
