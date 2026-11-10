import jwt from "jsonwebtoken";
import { DeleteMessageCommand, ReceiveMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { z } from "zod";
import {
  getPasswordResetQueueUrl,
  JWT_AUDIENCE,
  JWT_ISSUER,
  JWT_SECRET,
} from "../config.js";
import { identityRepository } from "../repositories/identity.repository.pg.js";
import { sendPasswordResetEmail } from "../notifications/password-reset-delivery.js";
import { logger } from "../logging/logger.js";
import { users, sessionVersions, saveDb } from "../core.js";
import { audit } from "../domain.js";
import { relationalIdentityEnabled } from "../runtime-modes.js";

const requestSchema = z.object({
  version: z.literal(1),
  requestId: z.string().uuid(),
  email: z.string().trim().email().max(320),
  requestedAt: z.string().datetime(),
}).strict();

const awsRegion = () => String(process.env.AWS_REGION || process.env.S3_REGION || "").trim();
const DEFAULT_WAIT_SECONDS = 10;
const MAX_REQUEST_AGE_MS = 15 * 60 * 1000;

const snapshotIdentityAuthority = {
  findUserByIdentifier: async (email) => {
    const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase());
    return user ? { ...user, sessionVersion: Number(sessionVersions[user.id] || 0) } : null;
  },
  recordUserAudit: async ({ actorId, action, userId }) => {
    audit(actorId, action, "USER", userId);
    await saveDb();
  },
};

const buildResetToken = (user, request) => {
  const issuedAt = Math.floor(new Date(request.requestedAt).getTime() / 1000);
  return jwt.sign({
    sub: user.id,
    email: user.email,
    purpose: "password-reset",
    sv: Number(user.sessionVersion || 0),
    jti: request.requestId,
    iat: issuedAt,
    exp: issuedAt + 15 * 60,
  }, JWT_SECRET, {
    algorithm: "HS256",
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    noTimestamp: true,
  });
};

export async function runPasswordResetDeliveryBatch({
  client = new SQSClient({ region: awsRegion() }),
  queueUrl = getPasswordResetQueueUrl(),
  repository = relationalIdentityEnabled() ? identityRepository : snapshotIdentityAuthority,
  sendEmail = sendPasswordResetEmail,
  waitTimeSeconds = DEFAULT_WAIT_SECONDS,
  now = () => Date.now(),
} = {}) {
  const result = { received: 0, delivered: 0, ignored: 0, failed: 0 };
  const response = await client.send(new ReceiveMessageCommand({
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: waitTimeSeconds,
    VisibilityTimeout: 60,
    AttributeNames: ["ApproximateReceiveCount"],
  }));

  for (const message of response.Messages || []) {
    result.received += 1;
    let request;
    try {
      request = requestSchema.parse(JSON.parse(message.Body || ""));
      const requestedAt = new Date(request.requestedAt).getTime();
      if (requestedAt > now() + 60_000 || now() - requestedAt >= MAX_REQUEST_AGE_MS) {
        throw Object.assign(new Error("stale reset request"), { permanent: true });
      }

      const candidate = await repository.findUserByIdentifier(request.email.toLowerCase());
      const user = candidate?.status === "Active" ? candidate : null;
      if (!user) {
        result.ignored += 1;
      } else {
        const token = buildResetToken(user, request);
        await sendEmail({ recipient: user.email, token });
        try {
          await repository.recordUserAudit({
            actorId: user.id,
            action: "DELIVER_PASSWORD_RESET",
            userId: user.id,
          });
        } catch {
          // Do not send the same email again only because secondary audit
          // persistence failed after SES accepted it.
          logger.error("PASSWORD_RESET_AUDIT_FAILED", { errorCode: "AUDIT_WRITE_FAILED" });
        }
        result.delivered += 1;
      }

      await client.send(new DeleteMessageCommand({ QueueUrl: queueUrl, ReceiptHandle: message.ReceiptHandle }));
    } catch (error) {
      const permanent = error?.permanent || error instanceof SyntaxError || error?.name === "ZodError";
      if (permanent) {
        await client.send(new DeleteMessageCommand({ QueueUrl: queueUrl, ReceiptHandle: message.ReceiptHandle }));
        result.ignored += 1;
        logger.warn("PASSWORD_RESET_MESSAGE_REJECTED", { errorCode: "INVALID_OR_STALE_MESSAGE" });
      } else {
        result.failed += 1;
        logger.error("PASSWORD_RESET_DELIVERY_FAILED", {
          errorCode: "DELIVERY_FAILED",
          receiveCount: Number(message.Attributes?.ApproximateReceiveCount || 1),
        });
      }
    }
  }

  if (result.received > 0) logger.info("PASSWORD_RESET_BATCH_COMPLETED", result);
  return result;
}

export function startPasswordResetDeliveryDaemon(options = {}) {
  let stopped = false;
  const client = options.client || new SQSClient({ region: awsRegion() });
  const loop = async () => {
    while (!stopped) {
      try {
        await runPasswordResetDeliveryBatch({ ...options, client });
      } catch (error) {
        if (stopped) break;
        logger.error("PASSWORD_RESET_QUEUE_POLL_FAILED", { errorCode: "QUEUE_POLL_FAILED" });
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  };
  const done = loop();
  return {
    done,
    stop: () => {
      stopped = true;
      client.destroy();
    },
  };
}
