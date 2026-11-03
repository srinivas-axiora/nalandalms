// Enterprise Structured JSON Logger with Correlation IDs
import crypto from "node:crypto";
import { safeRequestPath } from "../security/request-path.js";

export const LOG_LEVELS = {
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40,
  FATAL: 50,
};

const CURRENT_LEVEL = process.env.LOG_LEVEL === "debug" ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;

function log(levelName, message, context = {}) {
  const levelNum = LOG_LEVELS[levelName] || LOG_LEVELS.INFO;
  if (levelNum < CURRENT_LEVEL) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level: levelName,
    message,
    ...context,
  };

  // Structured single-line JSON log output
  const json = JSON.stringify(entry);
  if (levelNum >= LOG_LEVELS.ERROR) {
    process.stderr.write(json + "\n");
  } else {
    process.stdout.write(json + "\n");
  }
}

export const logger = {
  debug: (msg, ctx) => log("DEBUG", msg, ctx),
  info: (msg, ctx) => log("INFO", msg, ctx),
  warn: (msg, ctx) => log("WARN", msg, ctx),
  error: (msg, ctx) => log("ERROR", msg, ctx),
  fatal: (msg, ctx) => log("FATAL", msg, ctx),
};

export function requestCorrelationMiddleware(req, res, next) {
  const reqId = req.headers["x-request-id"] || `REQ-${crypto.randomBytes(8).toString("hex")}`;
  req.id = reqId;
  res.setHeader("x-request-id", reqId);

  const start = Date.now();
  res.on("finish", () => {
    const durationMs = Date.now() - start;
    logger.info("HTTP_REQUEST", {
      requestId: reqId,
      method: req.method,
      path: safeRequestPath(req.originalUrl || req.path),
      statusCode: res.statusCode,
      durationMs,
      ip: req.ip,
      userId: req.user?.id || null,
      userAgent: req.headers["user-agent"] || null,
    });
  });

  next();
}

