import assert from "node:assert/strict";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { closePool, query, withTransaction } from "../db/pool.js";

const [mode, runId, ...args] = process.argv.slice(2);
if (!new Set(["setup", "worker", "assert", "cleanup"]).has(mode)) {
  throw new Error("Usage: verify-http-soak.mjs <setup|worker|assert|cleanup> LS-<run-id> [mode arguments]");
}
if (!/^LS-[A-F0-9]{24,64}$/.test(runId || "")) {
  throw new Error("HTTP soak run ID must match LS- followed by 24-64 uppercase hexadecimal characters");
}
if (!process.env.DATABASE_URL && !process.env.PGHOST) {
  throw new Error("PostgreSQL configuration is required for HTTP soak verification");
}

const prefix = `VERIFY-SOAK-${runId}`;
const ids = {
  owner: `${prefix}-OWNER`,
  course: `${prefix}-COURSE`,
  chapter: `${prefix}-CHAPTER`,
  enrollment: (slot) => `${prefix}-ENROLLMENT-${slot}`,
  learner: (slot) => `${prefix}-LEARNER-${slot}`,
};
const entityType = "VERIFY_HTTP_SOAK";
const workerAction = "VERIFY_HTTP_SOAK_WORKER";
assert.ok(String(process.env.JWT_SECRET || "").length >= 32,
  "JWT_SECRET is required to derive the ephemeral synthetic credential");
const password = `${crypto.createHmac("sha256", process.env.JWT_SECRET)
  .update(`verify-http-soak:${runId}`)
  .digest("base64url")
  .slice(0, 32)}!Aa1`;
const emailFor = (slot) => `${ids.learner(slot).toLowerCase()}@example.invalid`;
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const requireRevision = (value) => {
  assert.match(value || "", /^[0-9a-f]{40}$/, "a full 40-character source revision is required");
  return value;
};

const boundedInteger = (value, name, minimum, maximum) => {
  const parsed = Number(value);
  assert.ok(Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum,
    `${name} must be an integer from ${minimum} through ${maximum}`);
  return parsed;
};

const boundedNumber = (value, name, minimum, maximum) => {
  const parsed = Number(value);
  assert.ok(Number.isFinite(parsed) && parsed >= minimum && parsed <= maximum,
    `${name} must be from ${minimum} through ${maximum}`);
  return parsed;
};

const percentile = (values, ratio) => {
  assert.ok(values.length > 0, "percentile requires at least one value");
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)];
};

const taskIdentity = async () => {
  const metadataUri = process.env.ECS_CONTAINER_METADATA_URI_V4;
  assert.ok(metadataUri, "ECS task metadata is required for an unambiguous load result");
  const response = await fetch(`${metadataUri}/task`, { signal: AbortSignal.timeout(5_000) });
  assert.equal(response.ok, true, "ECS task metadata is unavailable");
  const metadata = await response.json();
  const taskArn = String(metadata.TaskARN || "");
  assert.ok(taskArn, "ECS task ARN is unavailable");
  return taskArn.split("/").at(-1);
};

class CookieJar {
  #values = new Map();

  capture(response) {
    const values = typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : [response.headers.get("set-cookie")].filter(Boolean);
    for (const raw of values) {
      const pair = String(raw).split(";", 1)[0];
      const separator = pair.indexOf("=");
      if (separator > 0) this.#values.set(pair.slice(0, separator), pair.slice(separator + 1));
    }
  }

  get(name) {
    return this.#values.get(name) || "";
  }

  header() {
    return [...this.#values.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
  }
}

const assertPrivateTarget = (value) => {
  const url = new URL(value);
  const octets = url.hostname.split(".").map(Number);
  const privateAddress = octets.length === 4 && octets.every((item) => Number.isInteger(item) && item >= 0 && item <= 255)
    && (octets[0] === 10
      || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31)
      || (octets[0] === 192 && octets[1] === 168));
  assert.equal(url.protocol, "http:", "the per-task target must use private HTTP inside the VPC");
  assert.equal(url.port, "8080", "the per-task target must use the application container port");
  assert.equal(url.pathname, "/", "the per-task target must not contain a path");
  assert.equal(privateAddress, true, "the per-task target must use a private IPv4 address");
  return url.origin;
};

const assertPublicTarget = (value) => {
  const url = new URL(value);
  assert.equal(url.protocol, "https:", "the edge target must use HTTPS");
  assert.equal(url.username || url.password, "", "the edge target must not embed credentials");
  return url.origin;
};

const cleanup = async () => {
  const learners = [ids.learner(1), ids.learner(2)];
  await withTransaction(async (client) => {
    await client.query(
      `DELETE FROM audit_logs
       WHERE (entity_type = $1 AND entity_id = $2)
          OR actor_id = ANY($3::text[])
          OR entity_id = ANY($4::text[])`,
      [entityType, runId, [ids.owner, ...learners], [ids.course, ids.chapter, ...learners]],
    );
    await client.query("DELETE FROM learning_time_events WHERE user_id = ANY($1::text[])", [learners]);
    await client.query("DELETE FROM chapter_time_totals WHERE user_id = ANY($1::text[])", [learners]);
    await client.query("DELETE FROM enrollments WHERE course_id = $1", [ids.course]);
    await client.query("DELETE FROM chapters WHERE course_id = $1", [ids.course]);
    await client.query("DELETE FROM course_versions WHERE course_id = $1", [ids.course]);
    await client.query("DELETE FROM courses WHERE id = $1", [ids.course]);
    await client.query("DELETE FROM users WHERE id = ANY($1::text[])", [[...learners, ids.owner]]);
  });
};

const setup = async () => {
  const sourceRevision = requireRevision(args[0]);
  const passwordHash = bcrypt.hashSync(password, 10);
  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO users (id, name, email, password_hash, role, team, designation, status)
       VALUES
         ($1, 'HTTP soak owner', $2, $3, 'Manager', 'Synthetic', 'Manager', 'Active'),
         ($4, 'HTTP soak learner one', $5, $3, 'Learner', 'Synthetic', 'Learner', 'Active'),
         ($6, 'HTTP soak learner two', $7, $3, 'Learner', 'Synthetic', 'Learner', 'Active')`,
      [
        ids.owner, `${ids.owner.toLowerCase()}@example.invalid`, passwordHash,
        ids.learner(1), emailFor(1), ids.learner(2), emailFor(2),
      ],
    );
    await client.query(
      `INSERT INTO courses (
         id, title, description, skill, status, approval, owner_id, current_version
       ) VALUES ($1, 'HTTP soak verification', $2, 'Security', 'Active', 'Approved', $3, 1)`,
      [ids.course, `Synthetic source-bound load fixture ${sourceRevision}`, ids.owner],
    );
    await client.query(
      `INSERT INTO course_versions (course_id, version, title, description, change_note, created_by)
       VALUES ($1, 1, 'HTTP soak verification', $2, 'Synthetic load setup', $3)`,
      [ids.course, `Synthetic source-bound load fixture ${sourceRevision}`, ids.owner],
    );
    await client.query(
      `INSERT INTO chapters (
         id, course_id, sequence, title, description, body, duration_minutes,
         minimum_time_minutes, version
       ) VALUES ($1, $2, 1, 'HTTP soak chapter', 'Synthetic load chapter',
         '<p>Synthetic load content</p>', 30, 30, 1)`,
      [ids.chapter, ids.course],
    );
    for (const slot of [1, 2]) {
      await client.query(
        `INSERT INTO enrollments (id, course_id, user_id, assigned_by, status)
         VALUES ($1, $2, $3, $4, 'Enrolled')`,
        [ids.enrollment(slot), ids.course, ids.learner(slot), ids.owner],
      );
    }
    await client.query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata, ingest_key)
       VALUES ($1, 'VERIFY_HTTP_SOAK_SETUP', $2, $3, $4::jsonb, $5)`,
      [ids.owner, entityType, runId, JSON.stringify({ sourceRevision }), `verify-http-soak:${runId}:setup`],
    );
  });
  console.log(`HTTP soak fixture prepared: ${runId}`);
};

const worker = async () => {
  const sourceRevision = requireRevision(args[0]);
  const slot = boundedInteger(args[1], "worker slot", 1, 2);
  const targetId = String(args[2] || "");
  assert.match(targetId, /^[a-f0-9]{32}$/, "target task ID must be a 32-character lowercase hexadecimal value");
  const privateOrigin = assertPrivateTarget(args[3]);
  const publicOrigin = assertPublicTarget(args[4]);
  const durationSeconds = boundedInteger(args[5], "duration", 120, 3_600);
  const requestsPerSecond = boundedNumber(args[6], "requests per second", 0.5, 5);
  const workerId = await taskIdentity();
  const jar = new CookieJar();

  const csrfResponse = await fetch(`${privateOrigin}/api/csrf-token`, {
    signal: AbortSignal.timeout(5_000),
    headers: { "cache-control": "no-store" },
  });
  jar.capture(csrfResponse);
  assert.equal(csrfResponse.status, 200, "CSRF bootstrap failed");
  const csrfToken = jar.get("csrfToken");
  assert.ok(csrfToken, "CSRF cookie is unavailable");

  const loginResponse = await fetch(`${privateOrigin}/api/auth/login`, {
    method: "POST",
    signal: AbortSignal.timeout(5_000),
    headers: {
      "content-type": "application/json",
      "x-csrf-token": csrfToken,
      cookie: jar.header(),
    },
    body: JSON.stringify({ email: emailFor(slot), password }),
  });
  jar.capture(loginResponse);
  await loginResponse.arrayBuffer();
  assert.equal(loginResponse.status, 200, "synthetic learner login failed");
  assert.ok(jar.get("token"), "authenticated session cookie is unavailable");

  const scenarios = [
    { name: "direct-auth", url: `${privateOrigin}/api/auth/me` },
    { name: "direct-courses", url: `${privateOrigin}/api/courses` },
    { name: "direct-chapters", url: `${privateOrigin}/api/courses/${ids.course}/chapters` },
    { name: "direct-analytics", url: `${privateOrigin}/api/analytics/me` },
    { name: "direct-progress", url: `${privateOrigin}/api/courses/${ids.course}/chapters/${ids.chapter}/progress` },
    { name: "direct-heartbeat", url: `${privateOrigin}/api/courses/${ids.course}/chapters/${ids.chapter}/heartbeat`, method: "POST" },
    { name: "direct-ready", url: `${privateOrigin}/api/ready`, anonymous: true },
    { name: "edge-ready", url: `${publicOrigin}/api/ready`, anonymous: true },
  ];
  const routeStats = Object.fromEntries(scenarios.map(({ name }) => [name, {
    requestCount: 0,
    errorCount: 0,
    latenciesMs: [],
    statusCounts: {},
  }]));
  const allLatencies = [];
  const startedAt = Date.now();
  const deadline = startedAt + durationSeconds * 1_000;
  const intervalMs = 1_000 / requestsPerSecond;
  let requestIndex = 0;

  while (Date.now() < deadline) {
    const scheduledAt = startedAt + requestIndex * intervalMs;
    const waitMs = scheduledAt - Date.now();
    if (waitMs > 0) await delay(waitMs);
    if (Date.now() >= deadline) break;

    const scenario = scenarios[requestIndex % scenarios.length];
    const headers = { "cache-control": "no-store" };
    if (!scenario.anonymous) headers.cookie = jar.header();
    let body;
    if (scenario.method === "POST") {
      headers["content-type"] = "application/json";
      headers["x-csrf-token"] = csrfToken;
      headers["idempotency-key"] = `soak:${runId}:${slot}:${requestIndex}`;
      body = JSON.stringify({ incrementSeconds: 1, currentPositionSeconds: requestIndex });
    }

    const requestStarted = performance.now();
    let status = 0;
    try {
      const response = await fetch(scenario.url, {
        method: scenario.method || "GET",
        headers,
        body,
        signal: AbortSignal.timeout(5_000),
      });
      status = response.status;
      await response.arrayBuffer();
    } catch {
      status = 0;
    }
    const latencyMs = Math.max(0, Math.round(performance.now() - requestStarted));
    const stats = routeStats[scenario.name];
    stats.requestCount += 1;
    stats.latenciesMs.push(latencyMs);
    stats.statusCounts[status] = Number(stats.statusCounts[status] || 0) + 1;
    if (status !== 200) stats.errorCount += 1;
    allLatencies.push(latencyMs);
    requestIndex += 1;
  }

  const finishedAt = Date.now();
  const errorCount = Object.values(routeStats).reduce((sum, item) => sum + item.errorCount, 0);
  const summary = {
    sourceRevision,
    workerId,
    targetId,
    slot,
    startedAt: new Date(startedAt).toISOString(),
    finishedAt: new Date(finishedAt).toISOString(),
    durationMilliseconds: finishedAt - startedAt,
    requestedRatePerSecond: requestsPerSecond,
    requestCount: requestIndex,
    errorCount,
    p95Milliseconds: percentile(allLatencies, 0.95),
    p99Milliseconds: percentile(allLatencies, 0.99),
    routeStats,
  };
  await query(
    `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata, ingest_key)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6)
     ON CONFLICT (ingest_key) WHERE ingest_key IS NOT NULL DO NOTHING`,
    [
      ids.learner(slot), workerAction, entityType, runId, JSON.stringify(summary),
      `verify-http-soak:${runId}:worker:${workerId}`,
    ],
  );
  console.log(`HTTP_SOAK_WORKER:${runId} ${JSON.stringify({
    workerId, targetId, requestCount: requestIndex, errorCount,
    p95Milliseconds: summary.p95Milliseconds, p99Milliseconds: summary.p99Milliseconds,
  })}`);
};

const assertResults = async () => {
  const sourceRevision = requireRevision(args[0]);
  const workerCount = boundedInteger(args[1], "worker count", 2, 2);
  const durationSeconds = boundedInteger(args[2], "duration", 120, 3_600);
  const requestsPerSecond = boundedNumber(args[3], "requests per second", 0.5, 5);
  const p95ThresholdMs = boundedInteger(args[4], "p95 threshold", 50, 5_000);
  const p99ThresholdMs = boundedInteger(args[5], "p99 threshold", p95ThresholdMs, 10_000);
  const maximumErrorRate = boundedNumber(args[6], "maximum error rate", 0, 0.01);
  const result = await query(
    `SELECT metadata FROM audit_logs
     WHERE action = $1 AND entity_type = $2 AND entity_id = $3
       AND metadata->>'sourceRevision' = $4
     ORDER BY created_at, id`,
    [workerAction, entityType, runId, sourceRevision],
  );
  const summaries = result.rows.map((row) => row.metadata);
  assert.equal(summaries.length, workerCount, "one source-bound summary is required from each load worker");
  assert.equal(new Set(summaries.map((item) => item.workerId)).size, workerCount,
    "load evidence must come from distinct ECS worker tasks");
  assert.equal(new Set(summaries.map((item) => item.targetId)).size, workerCount,
    "each load worker must target a distinct ECS service task");
  assert.deepEqual(summaries.map((item) => Number(item.slot)).sort(), [1, 2],
    "the two isolated learner workloads are required");

  const minimumRequestsPerWorker = Math.floor(durationSeconds * requestsPerSecond * 0.9);
  const expectedRoutes = [
    "direct-auth", "direct-courses", "direct-chapters", "direct-analytics",
    "direct-progress", "direct-heartbeat", "direct-ready", "edge-ready",
  ];
  const allLatencies = [];
  const routeLatencies = Object.fromEntries(expectedRoutes.map((name) => [name, []]));
  const statusCounts = {};
  let requestCount = 0;
  let errorCount = 0;

  for (const summary of summaries) {
    assert.ok(Number(summary.requestCount) >= minimumRequestsPerWorker,
      "a worker did not sustain at least 90% of its requested throughput");
    assert.ok(Number(summary.durationMilliseconds) >= durationSeconds * 900,
      "a worker did not sustain the load for at least 90% of the requested duration");
    requestCount += Number(summary.requestCount);
    errorCount += Number(summary.errorCount);
    for (const routeName of expectedRoutes) {
      const route = summary.routeStats?.[routeName];
      assert.ok(route, `worker summary is missing route ${routeName}`);
      routeLatencies[routeName].push(...route.latenciesMs.map(Number));
      allLatencies.push(...route.latenciesMs.map(Number));
      for (const [status, count] of Object.entries(route.statusCounts || {})) {
        statusCounts[status] = Number(statusCounts[status] || 0) + Number(count);
      }
    }
  }

  const errorRate = requestCount > 0 ? errorCount / requestCount : 1;
  assert.ok(errorRate <= maximumErrorRate,
    `HTTP soak error rate ${errorRate} exceeded ${maximumErrorRate}`);
  assert.equal(Number(statusCounts["429"] || 0), 0, "the load profile triggered request throttling");
  assert.equal(Number(statusCounts["401"] || 0) + Number(statusCounts["403"] || 0), 0,
    "authenticated load requests lost authorization");
  const serverErrors = Object.entries(statusCounts)
    .filter(([status]) => Number(status) >= 500)
    .reduce((sum, [, count]) => sum + Number(count), 0);
  assert.equal(serverErrors, 0, "the load profile produced server errors");

  const routeMetrics = {};
  for (const [routeName, latencies] of Object.entries(routeLatencies)) {
    assert.ok(latencies.length >= Math.floor((minimumRequestsPerWorker * workerCount / expectedRoutes.length) * 0.75),
      `${routeName} did not receive enough samples`);
    const p95Milliseconds = percentile(latencies, 0.95);
    const p99Milliseconds = percentile(latencies, 0.99);
    assert.ok(p95Milliseconds < p95ThresholdMs,
      `${routeName} p95 ${p95Milliseconds}ms did not meet the <${p95ThresholdMs}ms objective`);
    assert.ok(p99Milliseconds <= p99ThresholdMs,
      `${routeName} p99 ${p99Milliseconds}ms exceeded ${p99ThresholdMs}ms`);
    routeMetrics[routeName] = { samples: latencies.length, p95Milliseconds, p99Milliseconds };
  }

  const aggregate = {
    sourceRevision,
    workerCount,
    distinctTargets: new Set(summaries.map((item) => item.targetId)).size,
    durationSeconds,
    requestedRatePerSecondPerWorker: requestsPerSecond,
    requestCount,
    errorCount,
    errorRate,
    statusCounts,
    p95Milliseconds: percentile(allLatencies, 0.95),
    p99Milliseconds: percentile(allLatencies, 0.99),
    routeMetrics,
  };
  console.log(`HTTP_SOAK_ASSERT:${runId} ${JSON.stringify(aggregate)}`);
};

try {
  if (mode === "setup") await setup();
  if (mode === "worker") await worker();
  if (mode === "assert") await assertResults();
  if (mode === "cleanup") {
    await cleanup();
    console.log(`HTTP soak fixture removed: ${runId}`);
  }
} finally {
  await closePool();
}
