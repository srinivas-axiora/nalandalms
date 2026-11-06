const SENSITIVE_KEY = /^(?:password|passwordHash|currentPassword|newPassword|resetToken|accessToken|refreshToken|authorization|cookie|secret|apiKey|privateKey)$/i;
const AUDIT_SENSITIVE_KEY = /^(?:password|passwordHash|currentPassword|newPassword|resetToken|accessToken|refreshToken|authorization|cookie|secret|apiKey|privateKey|email|name|candidateEmail|candidateName)$/i;

const redactByKey = (value, blockedKey, seen = new WeakSet()) => {
  if (value === null || value === undefined || typeof value !== "object") return value;
  if (seen.has(value)) return undefined;
  seen.add(value);

  if (Array.isArray(value)) return value.map((entry) => redactByKey(entry, blockedKey, seen));

  const safe = {};
  for (const [key, entry] of Object.entries(value)) {
    if (blockedKey.test(key)) continue;
    const redacted = redactByKey(entry, blockedKey, seen);
    if (redacted !== undefined) safe[key] = redacted;
  }
  return safe;
};

export const redactSensitive = (value) => redactByKey(value, SENSITIVE_KEY);

export const redactAuditMetadata = (value) => redactByKey(value, AUDIT_SENSITIVE_KEY);

export function containsCredentialMaterial(value) {
  if (value === null || value === undefined || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(containsCredentialMaterial);
  return Object.entries(value).some(([key, entry]) => (
    SENSITIVE_KEY.test(key) || containsCredentialMaterial(entry)
  ));
}
