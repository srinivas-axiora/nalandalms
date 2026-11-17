export const API_URL = import.meta.env.VITE_API_URL || "/api";

let csrfToken: string | null = null;
let reauthInFlight: Promise<boolean> | null = null;

export function clearCsrfToken() {
  csrfToken = null;
}
export const clearCsrf = clearCsrfToken;

export async function getCsrf(): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/csrf-token`, { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      csrfToken = data.csrfToken;
      return csrfToken;
    }
  } catch (err) {
    console.warn("[csrf] Token acquisition failed:", err);
  }
  return null;
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

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  retryingAfterReauth = false,
  retryingAfterCsrf = false
): Promise<Response> {
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

  if (endpoint === "/auth/logout") {
    clearCsrfToken();
  }

  // Automatically refresh CSRF token and retry once if CSRF validation failed
  if (res.status === 403 && !retryingAfterCsrf) {
    try {
      const data = await res.clone().json();
      if (data?.error === "Invalid CSRF token" || (typeof data?.error === "string" && data.error.toLowerCase().includes("csrf"))) {
        clearCsrfToken();
        await getCsrf();
        return apiFetch(endpoint, options, retryingAfterReauth, true);
      }
    } catch {
      // Fall through to original 403 response.
    }
  }

  if (res.status === 412 && !retryingAfterReauth) {
    try {
      const data = await res.clone().json();
      if (data?.code === "STEP_UP_REQUIRED" && await requestReauth()) {
        return apiFetch(endpoint, options, true, retryingAfterCsrf);
      }
    } catch {
      // Fall through to original 412 response.
    }
  }

  return res;
}

export async function uploadCourseFile(file: File): Promise<string> {
  const grantResponse = await apiFetch("/uploads/presign", {
    method: "POST",
    body: JSON.stringify({ fileName: file.name, contentType: file.type }),
  });

  if (!grantResponse.ok) {
    const errorBody = await grantResponse.json().catch(() => ({}));
    throw new Error(errorBody.error || "File upload grant rejected by server policy");
  }

  const grant = await grantResponse.json();
  const uploadEndpoint = grant.uploadUrl || `/uploads/${grant.uploadId}`;

  const uploadResponse = await apiFetch(uploadEndpoint, {
    method: grant.method || "PUT",
    headers: grant.headers || { "Content-Type": file.type },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("File upload failed to store in object storage");
  }

  return grant.publicUrl || grant.fileUrl || `/content/${grant.uploadId}`;
}
