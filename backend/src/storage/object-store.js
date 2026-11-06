// Pluggable private object storage adapter (S3/R2/MinIO or local development disk).
import fs from "node:fs";
import path from "node:path";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  GetObjectTaggingCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { JWT_SECRET } from "../config.js";

const LOCAL_UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
const MAX_INTERNAL_OBJECT_BYTES = 25 * 1024 * 1024;
if (!fs.existsSync(LOCAL_UPLOADS_DIR)) fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });

const isS3Configured = Boolean(process.env.S3_BUCKET || process.env.R2_BUCKET);

let s3Client = null;
const bucketName = process.env.S3_BUCKET || process.env.R2_BUCKET || "nalanda-media";

if (isS3Configured) {
  const clientConfig = {
    region: process.env.S3_REGION || "auto",
  };
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    clientConfig.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
  }
  if (process.env.S3_ENDPOINT) clientConfig.endpoint = process.env.S3_ENDPOINT;
  s3Client = new S3Client(clientConfig);
}

export const storageMode = isS3Configured ? "s3" : "local";

export const MALWARE_SCAN_TAG = "GuardDutyMalwareScanStatus";
export const CLEAN_MALWARE_SCAN_STATUS = "NO_THREATS_FOUND";
const malwareProtectedPrefixes = ["course_media/", "chapter_pdf/", "proctoring/"];

export class ObjectScanError extends Error {
  constructor(status = "PENDING") {
    super("Object is unavailable until malware scanning completes successfully");
    this.name = "ObjectScanError";
    this.code = status === "PENDING"
      ? "OBJECT_SCAN_PENDING"
      : status === "THREATS_FOUND"
        ? "OBJECT_QUARANTINED"
        : "OBJECT_SCAN_REJECTED";
    this.scanStatus = status;
  }
}

export const objectRequiresMalwareScan = (keyValue) => {
  const key = normalizeObjectKey(keyValue);
  return malwareProtectedPrefixes.some((prefix) => key.startsWith(prefix));
};

export const malwareScanStatusFromTags = (tagSet = []) => {
  const tag = Array.isArray(tagSet) ? tagSet.find((item) => item?.Key === MALWARE_SCAN_TAG) : null;
  return typeof tag?.Value === "string" && tag.Value ? tag.Value : "PENDING";
};

export async function requireCleanObject(keyValue) {
  const key = normalizeObjectKey(keyValue);
  if (!objectRequiresMalwareScan(key) || !isS3Configured || !s3Client) {
    return { required: objectRequiresMalwareScan(key), status: "LOCAL_VALIDATED" };
  }
  const result = await s3Client.send(new GetObjectTaggingCommand({ Bucket: bucketName, Key: key }));
  const status = malwareScanStatusFromTags(result.TagSet);
  if (status !== CLEAN_MALWARE_SCAN_STATUS) throw new ObjectScanError(status);
  return { required: true, status };
}

export async function objectStoreHealth() {
  if (!isS3Configured || !s3Client) {
    return { ok: process.env.NODE_ENV !== "production", mode: "local" };
  }
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    return { ok: true, mode: "s3" };
  } catch (err) {
    return { ok: false, mode: "s3", error: err?.message || "S3 check failed" };
  }
}

export const normalizeObjectKey = (value) => {
  if (typeof value !== "string" || !value || value.length > 700 || value.includes("\0") || value.includes("\\")) {
    throw new TypeError("Invalid object key");
  }
  if (path.isAbsolute(value) || /^[A-Za-z]:/.test(value) || value.startsWith("/")) throw new TypeError("Invalid object key");
  const segments = value.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) throw new TypeError("Invalid object key");
  const normalized = path.posix.normalize(value);
  if (normalized !== value || normalized.startsWith("../")) throw new TypeError("Invalid object key");
  return normalized;
};

const localPathForKey = (value) => {
  const key = normalizeObjectKey(value);
  const target = path.resolve(LOCAL_UPLOADS_DIR, ...key.split("/"));
  const relative = path.relative(LOCAL_UPLOADS_DIR, target);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) throw new TypeError("Invalid object key");
  return { key, target };
};

const signLocalGrant = ({ purpose, key, subjectId, contentType, filename, maxBytes, expiresInSeconds }) => {
  if (!subjectId) throw new TypeError("A local object grant requires a subject");
  return jwt.sign(
    { purpose, key: normalizeObjectKey(key), contentType, filename, maxBytes },
    JWT_SECRET,
    { subject: subjectId, expiresIn: expiresInSeconds, jwtid: uuid(), issuer: "nalanda", audience: "nalanda-object-store" },
  );
};

export const verifyLocalGrant = ({ token, purpose, subjectId }) => {
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      issuer: "nalanda",
      audience: "nalanda-object-store",
      subject: subjectId,
    });
    if (payload.purpose !== purpose || !payload.jti) return null;
    return { ...payload, key: normalizeObjectKey(payload.key) };
  } catch {
    return null;
  }
};

export async function uploadBuffer(keyValue, buffer, contentType = "application/octet-stream") {
  const key = normalizeObjectKey(keyValue);
  if (!Buffer.isBuffer(buffer) || buffer.length > MAX_INTERNAL_OBJECT_BYTES) throw new TypeError("Invalid object payload");
  if (isS3Configured && s3Client) {
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ContentLength: buffer.length,
      ServerSideEncryption: "AES256",
      IfNoneMatch: "*",
    }));
    return { key, mode: "s3" };
  }

  const { target } = localPathForKey(key);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, buffer, { flag: "wx" });
  return { key, mode: "local" };
}

export async function getPresignedUploadUrl(keyValue, contentType, expiresInSeconds = 900, subjectId = null, maxBytes = null) {
  const key = normalizeObjectKey(keyValue);
  // Uploads always pass through the authenticated API so claimed MIME, file
  // signature and size are verified before local or S3 persistence.
  const token = signLocalGrant({
    purpose: "local-upload",
    key,
    subjectId,
    contentType,
    maxBytes,
    expiresInSeconds,
  });
  return { uploadUrl: `/api/uploads/direct?token=${encodeURIComponent(token)}`, key, mode: storageMode };
}

export async function getPresignedDownloadUrl(keyValue, expiresInSeconds = 900, subjectId = null, options = {}) {
  const key = normalizeObjectKey(keyValue);
  const filename = String(options.filename || path.posix.basename(key)).replace(/[\r\n"\\]/g, "_");
  const contentType = String(options.contentType || "application/octet-stream");
  if (isS3Configured && s3Client) {
    await requireCleanObject(key);
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${filename}"`,
      ResponseContentType: contentType,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
    return { downloadUrl: url, mode: "s3" };
  }

  const token = signLocalGrant({
    purpose: "local-download",
    key,
    subjectId,
    contentType,
    filename,
    expiresInSeconds,
  });
  return { downloadUrl: `/api/uploads/download?token=${encodeURIComponent(token)}`, mode: "local" };
}

export const readLocalObject = (keyValue) => {
  if (isS3Configured) throw new TypeError("Local object reads are disabled in S3 mode");
  const { key, target } = localPathForKey(keyValue);
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) return null;
  return { key, target };
};

export async function deleteObject(keyValue) {
  const key = normalizeObjectKey(keyValue);
  if (isS3Configured && s3Client) {
    await s3Client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }));
    return true;
  }

  const { target } = localPathForKey(key);
  if (!fs.existsSync(target)) return false;
  fs.unlinkSync(target);
  return true;
}
