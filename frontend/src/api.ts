export const API_URL = "/api";

let csrfToken: string | null = null;
let reauthInFlight: Promise<boolean> | null = null;

export async function getCsrf() {
  const res = await fetch(`${API_URL}/csrf-token`, { credentials: "include" });
  if (res.ok) {
    const data = await res.json();
    csrfToken = data.csrfToken;
  }
}

async function requestReauth() {
  if (reauthInFlight) return reauthInFlight;
  reauthInFlight = (async () => {
    const password = window.prompt("For your security, confirm your password to continue.");
    if (!password) return false;
    if (!csrfToken) await getCsrf();
    const res = await fetch(`${API_URL}/auth/reauth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
      },
      credentials: "include",
      body: JSON.stringify({ password }),
    });
    return res.ok;
  })().finally(() => {
    reauthInFlight = null;
  });
  return reauthInFlight;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}, retryingAfterReauth = false): Promise<Response> {
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

  if (res.status === 412 && !retryingAfterReauth) {
    try {
      const data = await res.clone().json();
      if (data?.code === "STEP_UP_REQUIRED" && await requestReauth()) {
        return apiFetch(endpoint, options, true);
      }
    } catch {
      // Fall through to original 412 response.
    }
  }

  return res;
}
