// Cryptographic Certificate Signing & Tamper-Proof Verification Engine
import crypto from "node:crypto";

const SIGNING_SECRET = process.env.CERTIFICATE_SIGNING_SECRET || process.env.JWT_SECRET || "nalanda-enterprise-credential-root-secret-key-2026";

export function canonicalizePayload(cert) {
  return [
    cert.id || cert.certificateId,
    cert.employeeId || cert.recipientId,
    (cert.recipientName || "").trim().toLowerCase(),
    cert.courseId,
    (cert.courseTitle || "").trim().toLowerCase(),
    cert.issuedAt ? new Date(cert.issuedAt).toISOString().slice(0, 10) : "",
    cert.proctoringVerified ? "VERIFIED" : "UNVERIFIED",
  ].join("|");
}

export function signCertificatePayload(cert) {
  const canonical = canonicalizePayload(cert);
  const hmac = crypto.createHmac("sha256", SIGNING_SECRET);
  hmac.update(canonical);
  return hmac.digest("hex");
}

export function verifyCertificateSignature(cert) {
  if (!cert || !cert.signature) return false;
  const expected = signCertificatePayload(cert);
  try {
    const a = Buffer.from(cert.signature, "hex");
    const b = Buffer.from(expected, "hex");
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function buildLinkedInShareUrl({ certificateId, recipientName, courseTitle, issuedAt, certUrl }) {
  const issueDate = issuedAt ? new Date(issuedAt) : new Date();
  const year = issueDate.getFullYear();
  const month = issueDate.getMonth() + 1;

  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: courseTitle || "Certified Specialist",
    organizationName: "Nalanda Institute",
    issueYear: String(year),
    issueMonth: String(month),
    certUrl: certUrl || `https://nalanda.edu/verify/${certificateId}`,
    certId: certificateId,
  });

  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

