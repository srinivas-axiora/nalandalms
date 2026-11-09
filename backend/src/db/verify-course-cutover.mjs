import assert from "node:assert/strict";
import { spawn } from "node:child_process";

if (!process.env.DATABASE_URL && !process.env.PGHOST) {
  throw new Error("DATABASE_URL or PGHOST is required for the course cutover canary");
}

const port = String(process.env.COURSE_CUTOVER_CANARY_PORT || "8091");
const baseUrl = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ["backend/server.js"], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: "production",
    PORT: port,
    USE_PG_COURSES: "1",
    COURSE_AUTHORITY_COVERAGE_ACK: "normalized-v1",
    ENABLE_PRIVACY_ERASURE_WORKER: "1",
    PRIVACY_COVERAGE_ACK: "normalized-v2",
    ENABLE_REPORT_EXPORT_WORKER: "1",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let output = "";
let errors = "";
child.stdout.on("data", (chunk) => { output += chunk.toString(); });
child.stderr.on("data", (chunk) => { errors += chunk.toString(); });

const childExit = new Promise((resolve) => child.once("exit", (code, signal) => resolve({ code, signal })));
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const deadline = Date.now() + 90_000;
let readiness = null;
let verificationError = null;
let shutdownResult = null;

try {
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Course cutover canary exited before readiness (exit ${child.exitCode}).\n${errors || output}`);
    }
    try {
      const response = await fetch(`${baseUrl}/api/ready`, { signal: AbortSignal.timeout(5_000) });
      readiness = await response.json();
      if (response.ok && readiness?.ok) break;
    } catch {
      // Startup is still in progress; retry until the bounded deadline.
    }
    await delay(2_000);
  }

  assert.equal(readiness?.ok, true, `Course cutover readiness failed: ${JSON.stringify(readiness)}`);
  assert.deepEqual(readiness.checks.courses, {
    ok: true,
    mode: "normalized",
    coverage: "normalized-v1",
  });
  for (const [name, check] of Object.entries(readiness.checks)) {
    assert.equal(check.ok, true, `${name} readiness must pass during the course cutover canary`);
  }
  console.log("ok - production-mode course authority readiness passed");
  console.log(`Course cutover canary passed (${Object.keys(readiness.checks).length} authority checks).`);
} catch (error) {
  verificationError = error;
} finally {
  if (child.exitCode === null) child.kill("SIGTERM");
  shutdownResult = await Promise.race([
    childExit,
    delay(20_000).then(() => ({ code: null, signal: "TIMEOUT" })),
  ]);
  if (shutdownResult.signal === "TIMEOUT" && child.exitCode === null) child.kill("SIGKILL");
  if (output) process.stdout.write(output);
  if (errors) process.stderr.write(errors);
}

if (verificationError) throw verificationError;
assert.notEqual(shutdownResult?.signal, "TIMEOUT", "Course cutover canary did not stop within 20 seconds");
assert.equal(shutdownResult?.code, 0, `Course cutover canary stopped unexpectedly: ${JSON.stringify(shutdownResult)}`);
