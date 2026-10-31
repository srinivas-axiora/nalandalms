// Pluggable Object Storage Adapter (S3, Cloudflare R2, MinIO, or Local Disk).
import fs from "node:fs";
import path from "node:path";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const LOCAL_UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
  fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
}

const isS3Configured = Boolean(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  (process.env.S3_BUCKET || process.env.R2_BUCKET)
);

let s3Client = null;
const bucketName = process.env.S3_BUCKET || process.env.R2_BUCKET || "nalanda-media";

if (isS3Configured) {
  const clientConfig = {
    region: process.env.S3_REGION || "auto",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  };
  // Cloudflare R2 or MinIO endpoint
  if (process.env.S3_ENDPOINT) {
    clientConfig.endpoint = process.env.S3_ENDPOINT;
  }
  s3Client = new S3Client(clientConfig);
}

export const storageMode = isS3Configured ? "s3" : "local";

export async function uploadBuffer(key, buffer, contentType = "application/octet-stream") {
  if (isS3Configured && s3Client) {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );
    return { key, mode: "s3" };
  }

  // Local disk fallback
  const targetPath = path.resolve(LOCAL_UPLOADS_DIR, key);
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  fs.writeFileSync(targetPath, buffer);
  return { key, path: `/uploads/${key}`, mode: "local" };
}

export async function getPresignedUploadUrl(key, contentType = "application/octet-stream", expiresInSeconds = 900) {
  if (isS3Configured && s3Client) {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
    return { uploadUrl: url, key, mode: "s3" };
  }

  // Local mode upload endpoint
  return {
    uploadUrl: `/api/uploads/direct?key=${encodeURIComponent(key)}`,
    key,
    mode: "local",
  };
}

export async function getPresignedDownloadUrl(key, expiresInSeconds = 3600) {
  if (isS3Configured && s3Client) {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
    return { downloadUrl: url, mode: "s3" };
  }

  // Local mode download
  return {
    downloadUrl: `/uploads/${key}`,
    mode: "local",
  };
}

export async function deleteObject(key) {
  if (isS3Configured && s3Client) {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );
    return true;
  }

  const targetPath = path.resolve(LOCAL_UPLOADS_DIR, key);
  if (fs.existsSync(targetPath)) {
    fs.unlinkSync(targetPath);
    return true;
  }
  return false;
}

