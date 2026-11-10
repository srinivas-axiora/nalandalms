import fs from "node:fs";
import path from "node:path";

const outputDirectory = path.resolve("frontend", "dist", "assets");
const maximumChunkBytes = 500 * 1024;

if (!fs.existsSync(outputDirectory)) {
  throw new Error("Frontend build assets are missing; run the production build first");
}

const chunks = fs.readdirSync(outputDirectory)
  .filter((file) => file.endsWith(".js"))
  .map((file) => ({ file, bytes: fs.statSync(path.join(outputDirectory, file)).size }))
  .sort((left, right) => right.bytes - left.bytes);

if (!chunks.length) throw new Error("Frontend build emitted no JavaScript chunks");

const oversized = chunks.filter((chunk) => chunk.bytes > maximumChunkBytes);
if (oversized.length) {
  throw new Error(`Frontend JavaScript chunk budget exceeded: ${oversized.map((chunk) => `${chunk.file}=${chunk.bytes}`).join(", ")}`);
}

console.log(
  `Frontend bundle budget valid: ${chunks.length} JavaScript chunks; largest ${chunks[0].file} ${(chunks[0].bytes / 1024).toFixed(2)} KiB.`,
);
