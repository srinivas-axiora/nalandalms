export const API_URL = "/api";

let csrfToken: string | null = null;

export async function getCsrf() {
  const res = await fetch(`${API_URL}/csrf-token`, { credentials: "include" });
  if (res.ok) {
    const data = await res.json();
    csrfToken = data.csrfToken;
  }
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(options.method?.toUpperCase() || "") && !csrfToken) {
    await getCsrf();
  }
  
  const headers = new Headers(options.headers || {});
  if (csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
  }
  if (!headers.has("Content-Type") && options.body instanceof URLSearchParams === false && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include" // REQUIRED FOR COOKIES
  });

  return res;
}
