// L6 — Controller: HTTP handlers for certificates and public verification.
import { issueCertificateSchema } from "./certificates.schema.js";

export function createCertificatesController(service) {
  const list = async (req, res) => {
    const data = await service.listForUser(req.user);
    res.json({ data, total: data.length });
  };

  const authorizeCreate = async (req, res, next) => {
    const parsed = issueCertificateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const result = await service.authorizeIssue(req.user, parsed.data);
    if (result.error) return res.status(result.status).json({ error: result.error });
    req.certificateIssueData = parsed.data;
    return next();
  };

  const create = async (req, res) => {
    const parsed = req.certificateIssueData
      ? { success: true, data: req.certificateIssueData }
      : issueCertificateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const result = await service.issue(req.user, parsed.data);
    if (result.error) return res.status(result.status).json({ error: result.error });
    return res.status(result.status).json({ data: result.data });
  };

  const verify = async (req, res) => {
    const result = await service.verify(req.params.certificateId);
    if (result.error) return res.status(result.status).json({ error: result.error });
    return res.status(result.status).json(result.data);
  };

  const revoke = async (req, res) => {
    const reason = String(req.body?.reason || "").trim();
    if (reason.length < 10) return res.status(400).json({ error: "Revocation reason must be at least 10 characters" });
    const result = await service.revoke(req.user, req.params.certificateId, reason);
    if (result.error) return res.status(result.status).json({ error: result.error });
    return res.status(result.status).json({ data: result.data });
  };

  return { list, authorizeCreate, create, verify, revoke };
}
