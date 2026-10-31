// L6 — Controller: HTTP handlers for certificates and public verification.
import { issueCertificateSchema } from "./certificates.schema.js";

export function createCertificatesController(service) {
  const list = (req, res) => {
    const data = service.listForUser(req.user);
    res.json({ data, total: data.length });
  };

  const create = (req, res) => {
    const parsed = issueCertificateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const result = service.issue(req.user, parsed.data);
    if (result.error) return res.status(result.status).json({ error: result.error });
    return res.status(result.status).json({ data: result.data });
  };

  const verify = (req, res) => {
    const result = service.verify(req.params.certificateId);
    if (result.error) return res.status(result.status).json({ error: result.error });
    return res.status(result.status).json(result.data);
  };

  return { list, create, verify };
}
