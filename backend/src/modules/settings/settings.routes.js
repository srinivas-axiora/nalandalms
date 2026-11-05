// Module: Settings (proctoring configuration).
// Note: the original handler reassigned the module-scoped `settings` object
// (`settings = {...settings, ...}`). To keep the shared reference valid across
// modules and the persistence snapshot, this mutates in place with Object.assign
// — content-identical behavior, stable reference.
import { z } from "zod";
import { settings } from "../../core.js";
import { audit } from "../../domain.js";
import { authenticate, requireRole, requireStepUp } from "../../middleware.js";
import { settingsRepository } from "../../repositories/settings.repository.pg.js";

const USE_PG_SETTINGS = process.env.USE_PG_SETTINGS === "1";

export function registerSettings(app) {
  app.get("/api/settings", authenticate, requireRole("Admin"), async (_req, res) => {
    res.json({ data: USE_PG_SETTINGS ? await settingsRepository.getProctoring() : settings });
  });

  app.patch("/api/settings", authenticate, requireRole("Admin"), requireStepUp, async (req, res) => {
    const schema = z.object({ fullscreenRequired: z.boolean().optional(), cameraRequired: z.boolean().optional(), microphoneRequired: z.boolean().optional(), tabSwitchAutoSubmit: z.boolean().optional(), noiseThreshold: z.number().int().min(1).max(100).optional(), maxAssessmentFlags: z.number().int().min(0).max(100).optional() }).strict().refine((value) => Object.keys(value).length > 0, "At least one setting is required");
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    if (USE_PG_SETTINGS) {
      const updated = await settingsRepository.updateProctoring({ actorId: req.user.id, patch: parsed.data });
      return res.json({ data: updated });
    }
    Object.assign(settings, parsed.data);
    audit(req.user.id, "UPDATE_SETTINGS", "SETTINGS", "proctoring", parsed.data);
    res.json({ data: settings });
  });
}
