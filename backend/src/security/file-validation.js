import path from "node:path";

export const MAX_COURSE_UPLOAD_BYTES = 15 * 1024 * 1024;
export const MAX_PROCTOR_CAPTURE_BYTES = 5 * 1024 * 1024;

const EXTENSIONS_BY_TYPE = Object.freeze({
  "application/pdf": new Set([".pdf"]),
  "video/mp4": new Set([".mp4"]),
  "video/webm": new Set([".webm"]),
  "image/png": new Set([".png"]),
  "image/jpeg": new Set([".jpg", ".jpeg"]),
  "image/webp": new Set([".webp"]),
  "image/gif": new Set([".gif"]),
});

export const allowedUploadMimeTypes = new Set(Object.keys(EXTENSIONS_BY_TYPE));

export const uploadMetadataIsAllowed = (filename, contentType) => {
  if (typeof filename !== "string" || filename.length < 1 || filename.length > 200) return false;
  if (filename !== path.basename(filename) || /[\0-\x1f\x7f]/.test(filename)) return false;
  const allowedExtensions = EXTENSIONS_BY_TYPE[contentType];
  return Boolean(allowedExtensions?.has(path.extname(filename).toLowerCase()));
};

const startsWith = (buffer, signature, offset = 0) =>
  buffer.length >= offset + signature.length && signature.every((byte, index) => buffer[offset + index] === byte);

export const bufferMatchesContentType = (buffer, contentType) => {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) return false;
  switch (contentType) {
    case "application/pdf": return startsWith(buffer, [0x25, 0x50, 0x44, 0x46, 0x2d]);
    case "image/png": return startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "image/jpeg": return startsWith(buffer, [0xff, 0xd8, 0xff]);
    case "image/gif": return buffer.subarray(0, 6).toString("ascii") === "GIF87a" || buffer.subarray(0, 6).toString("ascii") === "GIF89a";
    case "image/webp": return buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
    case "video/mp4": return buffer.subarray(4, 8).toString("ascii") === "ftyp";
    case "video/webm": return startsWith(buffer, [0x1a, 0x45, 0xdf, 0xa3]);
    default: return false;
  }
};

export const decodeBase64Strict = (value) => {
  if (typeof value !== "string" || !value || value.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(value)) return null;
  const buffer = Buffer.from(value, "base64");
  return buffer.toString("base64").replace(/=+$/, "") === value.replace(/=+$/, "") ? buffer : null;
};
