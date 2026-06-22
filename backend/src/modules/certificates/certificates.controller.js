// L6 — Controller: HTTP handlers; translate requests to service calls and shape responses.
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

  return { list, create };
}
