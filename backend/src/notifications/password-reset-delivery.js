import crypto from "node:crypto";
import { GetQueueAttributesCommand, SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { GetAccountCommand, SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import {
  getPasswordResetBaseUrl,
  getPasswordResetFromEmail,
  getPasswordResetQueueUrl,
} from "../config.js";

const awsRegion = () => String(process.env.SES_REGION || process.env.AWS_REGION || process.env.S3_REGION || "").trim();
let queueClient;
let emailClient;

const sqs = () => {
  if (!queueClient) queueClient = new SQSClient({ region: awsRegion() });
  return queueClient;
};

const ses = () => {
  if (!emailClient) emailClient = new SESv2Client({ region: awsRegion() });
  return emailClient;
};

export const buildPasswordResetUrl = (token, baseUrl = getPasswordResetBaseUrl()) => {
  const base = new URL(baseUrl);
  base.search = "";
  base.hash = "";
  return `${base.toString().replace(/\/$/, "")}#reset-password?token=${encodeURIComponent(token)}`;
};

export async function enqueuePasswordResetRequest(email, {
  client = sqs(),
  queueUrl = getPasswordResetQueueUrl(),
  requestId = crypto.randomUUID(),
  requestedAt = new Date().toISOString(),
} = {}) {
  const message = { version: 1, requestId, email, requestedAt };
  const result = await client.send(new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(message),
  }));
  return { requestId, messageId: result.MessageId };
}

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

export async function sendPasswordResetEmail({ recipient, token }, {
  client = ses(),
  fromEmail = getPasswordResetFromEmail(),
  baseUrl = getPasswordResetBaseUrl(),
} = {}) {
  const resetUrl = buildPasswordResetUrl(token, baseUrl);
  const safeUrl = escapeHtml(resetUrl);
  const result = await client.send(new SendEmailCommand({
    FromEmailAddress: fromEmail,
    Destination: { ToAddresses: [recipient] },
    Content: {
      Simple: {
        Subject: { Data: "Reset your Nalanda password", Charset: "UTF-8" },
        Body: {
          Text: {
            Charset: "UTF-8",
            Data: `A password reset was requested for your Nalanda account.\n\nOpen this link within 15 minutes:\n${resetUrl}\n\nIf you did not request this, you can ignore this message.`,
          },
          Html: {
            Charset: "UTF-8",
            Data: `<p>A password reset was requested for your Nalanda account.</p><p><a href="${safeUrl}">Reset your password</a>. This link expires in 15 minutes.</p><p>If you did not request this, you can ignore this message.</p>`,
          },
        },
      },
    },
  }));
  return { messageId: result.MessageId };
}

export async function passwordResetDeliveryHealth({
  queue = sqs(),
  email = ses(),
  queueUrl = getPasswordResetQueueUrl(),
} = {}) {
  try {
    const [queueResult, emailResult] = await Promise.all([
      queue.send(new GetQueueAttributesCommand({
        QueueUrl: queueUrl,
        AttributeNames: ["QueueArn", "KmsMasterKeyId", "RedrivePolicy"],
      })),
      email.send(new GetAccountCommand({})),
    ]);
    const queueReady = Boolean(
      queueResult.Attributes?.QueueArn
      && queueResult.Attributes?.KmsMasterKeyId
      && queueResult.Attributes?.RedrivePolicy
    );
    const emailReady = emailResult.SendingEnabled === true && emailResult.ProductionAccessEnabled === true;
    return { ok: queueReady && emailReady, mode: "sqs-ses", queueReady, emailReady };
  } catch {
    return { ok: false, mode: "sqs-ses", queueReady: false, emailReady: false };
  }
}
