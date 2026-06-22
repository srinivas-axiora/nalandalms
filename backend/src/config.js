// Foundation layer: environment loading, secrets, cookie policy, CORS, uploads.
import crypto from "node:crypto";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
  loadEnvFile();
} catch {
  // Local .env is optional in deployed environments where variables are injected.
}

// Manual .env loader (fallback) — resolves project-root .env from this module's
// location (backend/src) as well as the process cwd.
export const loadLocalEnv = () => {
  const envPaths = [path.resolve(process.cwd(), ".env"), path.resolve(__dirname, "..", "..", ".env")];
  for (const envPath of envPaths) {
    if (!fs.existsSync(envPath)) continue;
    const envText = fs.readFileSync(envPath, "utf8");
    for (const line of envText.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const [key, ...valueParts] = trimmed.split("=");
      if (!process.env[key]) process.env[key] = valueParts.join("=").replace(/^["']|["']$/g, "");
    }
  }
};
loadLocalEnv();

export const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const PORT = process.env.PORT || 8080;

if (IS_PRODUCTION && !process.env.DATABASE_URL) {
  console.error("FATAL: DATABASE_URL is required in production. Refusing to use local JSON-file persistence.");
  process.exit(1);
}

// File uploads are buffered in memory, so cap size aggressively and validate type.
export const ALLOWED_UPLOAD_MIME = new Set([
  "application/pdf", "video/mp4", "video/webm",
  "image/png", "image/jpeg", "image/webp", "image/gif",
]);
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_UPLOAD_MIME.has(file.mimetype)) return cb(null, true);
    return cb(new Error("Unsupported file type"));
  },
});

// ── Secrets & cookie policy ──
const DEFAULT_DEV_SECRET = "dev-only-change-me";
const resolveJwtSecret = () => {
  const fromEnv = process.env.JWT_SECRET;
  if (IS_PRODUCTION) {
    if (!fromEnv || fromEnv === DEFAULT_DEV_SECRET || fromEnv.length < 32) {
      console.error("FATAL: JWT_SECRET must be set to a strong (>= 32 chars), non-default value in production.");
      process.exit(1);
    }
    return fromEnv;
  }
  if (!fromEnv || fromEnv === DEFAULT_DEV_SECRET) {
    console.warn("[security] JWT_SECRET is missing or default — using an ephemeral development secret. Set a strong JWT_SECRET for stable sessions.");
    return crypto.randomBytes(48).toString("hex");
  }
  return fromEnv;
};
export const JWT_SECRET = resolveJwtSecret();
export const COOKIE_SECURE = IS_PRODUCTION;
export const COOKIE_SAMESITE = "lax";
export const CSRF_COOKIE = "csrfToken";
export const STEP_UP_COOKIE = "stepUpToken";

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
export const getGeminiApiKey = () => {
  if (!process.env.GEMINI_API_KEY) loadLocalEnv();
  return (process.env.GEMINI_API_KEY || "").trim();
};

// ── CORS allow-list ──
// In production the SPA is served from the same origin, so cross-origin
// requests are denied unless explicitly allow-listed via ALLOWED_ORIGINS.
export const ALLOWED_ORIGINS = String(process.env.ALLOWED_ORIGINS || "")
  .split(",").map((o) => o.trim()).filter(Boolean);
export const DEV_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8080"];
export const corsOrigin = (origin, cb) => {
  if (!origin) return cb(null, true); // same-origin / non-browser clients
  const allow = ALLOWED_ORIGINS.length ? ALLOWED_ORIGINS : (IS_PRODUCTION ? [] : DEV_ORIGINS);
  if (allow.includes(origin)) return cb(null, true);
  return cb(new Error("Origin not allowed by CORS"));
};
