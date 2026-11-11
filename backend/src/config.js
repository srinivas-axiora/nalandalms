// Foundation layer: environment loading, secrets, cookie policy, CORS, uploads.
import crypto from "node:crypto";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { USER_ROLES } from "./roles.js";
import { allowedUploadMimeTypes, uploadMetadataIsAllowed, MAX_COURSE_UPLOAD_BYTES } from "./security/file-validation.js";
import {
  COURSE_AUTHORITY_COVERAGE_VERSION,
  courseAuthorityCoverageAcknowledged,
} from "./runtime-modes.js";

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
export const STANDALONE_MODE = process.env.STANDALONE_MODE === "1"
  || process.env.DEPLOYMENT_TARGET === "standalone"
  || process.env.DEPLOYMENT_TARGET === "oci";
export const PORT = process.env.PORT || 8080;

const passwordResetEmailSchema = z.string().trim().email().max(320);
const validatePasswordResetBaseUrl = (value) => {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new Error("PASSWORD_RESET_BASE_URL must be an HTTPS URL without credentials, query or fragment");
  }
  return url.toString().replace(/\/$/, "");
};
const validatePasswordResetQueueUrl = (value) => {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new Error("PASSWORD_RESET_QUEUE_URL must be an HTTPS URL without credentials, query or fragment");
  }
  return url.toString();
};

if (IS_PRODUCTION && !process.env.DATABASE_URL && !process.env.PGHOST) {
  console.error("FATAL: DATABASE_URL or PGHOST is required in production. Refusing to use local JSON-file persistence.");
  process.exit(1);
}

if (IS_PRODUCTION && !STANDALONE_MODE) {
  const required = [
    "REDIS_URL",
    "S3_BUCKET",
    "S3_REGION",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "RAZORPAY_WEBHOOK_SECRET",
    "CERTIFICATE_ISSUANCE_APPROVAL_ROLE",
    "PASSWORD_RESET_FROM_EMAIL",
    "PASSWORD_RESET_BASE_URL",
    "PASSWORD_RESET_QUEUE_URL",
  ];
  const missing = required.filter((name) => !String(process.env[name] || "").trim());
  if (missing.length) {
    console.error(`FATAL: missing required production configuration: ${missing.join(", ")}`);
    process.exit(1);
  }
  if (process.env.PGSSL !== "require") {
    console.error("FATAL: PGSSL=require is mandatory in production.");
    process.exit(1);
  }
  try {
    passwordResetEmailSchema.parse(process.env.PASSWORD_RESET_FROM_EMAIL);
    validatePasswordResetBaseUrl(process.env.PASSWORD_RESET_BASE_URL);
    validatePasswordResetQueueUrl(process.env.PASSWORD_RESET_QUEUE_URL);
  } catch (error) {
    console.error(`FATAL: invalid password-reset delivery configuration: ${error?.message || error}`);
    process.exit(1);
  }
  if (process.env.ENABLE_PASSWORD_RESET_WORKER !== "1") {
    console.error("FATAL: ENABLE_PASSWORD_RESET_WORKER=1 is mandatory in production.");
    process.exit(1);
  }
  if (process.env.ENABLE_PRIVACY_ERASURE_WORKER === "1"
    && String(process.env.PRIVACY_PSEUDONYM_SECRET || "").trim().length < 32) {
    console.error("FATAL: PRIVACY_PSEUDONYM_SECRET must be at least 32 characters when privacy erasure is enabled.");
    process.exit(1);
  }
  if (process.env.USE_PG_COURSES === "1" && !courseAuthorityCoverageAcknowledged()) {
    console.error(
      `FATAL: USE_PG_COURSES requires COURSE_AUTHORITY_COVERAGE_ACK=${COURSE_AUTHORITY_COVERAGE_VERSION} in production.`
    );
    process.exit(1);
  }
} else if (IS_PRODUCTION && STANDALONE_MODE) {
  const standaloneRequired = [
    "REDIS_URL",
    "JWT_SECRET",
  ];
  const missing = standaloneRequired.filter((name) => !String(process.env[name] || "").trim());
  if (missing.length) {
    console.error(`FATAL: missing required standalone configuration: ${missing.join(", ")}`);
    process.exit(1);
  }
}

// File uploads are buffered in memory, so cap size aggressively and validate type.
export const ALLOWED_UPLOAD_MIME = allowedUploadMimeTypes;
export const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      const uploadsDir = path.resolve(process.cwd(), "uploads");
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
      cb(null, `${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}-${safeBase}${ext}`);
    },
  }),
  limits: { fileSize: MAX_COURSE_UPLOAD_BYTES, files: 5 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_UPLOAD_MIME.has(file.mimetype) && uploadMetadataIsAllowed(file.originalname, file.mimetype)) return cb(null, true);
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
export const JWT_ISSUER = process.env.JWT_ISSUER || "nalanda-api";
export const JWT_AUDIENCE = process.env.JWT_AUDIENCE || "nalanda-web";
const resolveCertificateSigningSecret = () => {
  const fromEnv = String(process.env.CERTIFICATE_SIGNING_SECRET || "").trim();
  if (IS_PRODUCTION && fromEnv.length < 32) {
    console.error("FATAL: CERTIFICATE_SIGNING_SECRET must be set to a strong (>= 32 chars) value in production.");
    process.exit(1);
  }
  if (!fromEnv) {
    console.warn("[security] CERTIFICATE_SIGNING_SECRET is missing — using an ephemeral development key.");
    return crypto.randomBytes(48).toString("hex");
  }
  return fromEnv;
};
export const CERTIFICATE_SIGNING_SECRET = resolveCertificateSigningSecret();
export const COOKIE_SECURE = IS_PRODUCTION;
export const COOKIE_SAMESITE = "lax";
export const CSRF_COOKIE = "csrfToken";
export const STEP_UP_COOKIE = "stepUpToken";

const trustProxySchema = z.union([
  z.literal("false").transform(() => false),
  z.literal("loopback"),
  z.literal("linklocal"),
  z.literal("uniquelocal"),
  z.coerce.number().int().min(0).max(10),
]);
export const TRUST_PROXY = trustProxySchema.parse(process.env.TRUST_PROXY ?? "false");

const certificateApprovalRoleSchema = z.enum(USER_ROLES);
export const getCertificateIssuanceApprovalRole = () => {
  const configured = String(process.env.CERTIFICATE_ISSUANCE_APPROVAL_ROLE || "").trim();
  if (!configured) return null;
  return certificateApprovalRoleSchema.parse(configured);
};

const companionTokenTtlSchema = z.coerce.number().int().min(60).max(3600);
export const COMPANION_TOKEN_TTL_SECONDS = companionTokenTtlSchema.parse(
  process.env.COMPANION_TOKEN_TTL_SECONDS ?? "900"
);

const paymentOrderTtlSchema = z.coerce.number().int().min(300).max(86400);
export const PAYMENT_ORDER_TTL_SECONDS = paymentOrderTtlSchema.parse(
  process.env.PAYMENT_ORDER_TTL_SECONDS ?? "1800"
);
export const getRazorpayKeyId = () => String(process.env.RAZORPAY_KEY_ID || "").trim();
export const getRazorpayKeySecret = () => String(process.env.RAZORPAY_KEY_SECRET || "").trim();
export const getRazorpayWebhookSecret = () => String(process.env.RAZORPAY_WEBHOOK_SECRET || "").trim();
export const getPasswordResetFromEmail = () => passwordResetEmailSchema.parse(
  String(process.env.PASSWORD_RESET_FROM_EMAIL || "").trim()
);
export const getPasswordResetBaseUrl = () => validatePasswordResetBaseUrl(
  String(process.env.PASSWORD_RESET_BASE_URL || "").trim()
);
export const getPasswordResetQueueUrl = () => validatePasswordResetQueueUrl(
  String(process.env.PASSWORD_RESET_QUEUE_URL || "").trim()
);

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
