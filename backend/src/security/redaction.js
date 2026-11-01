const SENSITIVE_KEY = /^(?:password|passwordHash|currentPassword|newPassword|resetToken|accessToken|refreshToken|authorization|cookie|secret|apiKey|privateKey)$/i;

export function redactSensitive(value, seen = new WeakSet()) {
  if (value === null || value === undefined || typeof value !== "object") return value;
  if (seen.has(value)) return undefined;
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((entry) => redactSensitive(entry, seen));
  }

  const safe = {};
  for (const [key, entry] of Object.entries(value)) {
    if (SENSITIVE_KEY.test(key)) continue;
    const redacted = redactSensitive(entry, seen);
    if (redacted !== undefined) safe[key] = redacted;
  }
  return safe;
}

export function containsCredentialMaterial(value) {
  if (value === null || value === undefined || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(containsCredentialMaterial);
  return Object.entries(value).some(([key, entry]) => (
    SENSITIVE_KEY.test(key) || containsCredentialMaterial(entry)
  ));
}
