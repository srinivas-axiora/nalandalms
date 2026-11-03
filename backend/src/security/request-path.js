const SENSITIVE_QUERY_KEY = /token|signature|secret|credential|code/i;

export const safeRequestPath = (value) => {
  const raw = String(value || "");
  try {
    const parsed = new URL(raw, "http://nalanda.invalid");
    for (const key of parsed.searchParams.keys()) {
      if (SENSITIVE_QUERY_KEY.test(key)) parsed.searchParams.set(key, "[REDACTED]");
    }
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return raw.split("?", 1)[0];
  }
};
