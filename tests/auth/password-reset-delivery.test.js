import jwt from "jsonwebtoken";
import { describe, expect, it, vi } from "vitest";
import {
  buildPasswordResetUrl,
  enqueuePasswordResetRequest,
  passwordResetDeliveryHealth,
  sendPasswordResetEmail,
} from "../../backend/src/notifications/password-reset-delivery.js";
import { runPasswordResetDeliveryBatch } from "../../backend/src/workers/password-reset-delivery.js";
import { JWT_AUDIENCE, JWT_ISSUER, JWT_SECRET } from "../../backend/src/config.js";

const requestId = "11111111-1111-4111-8111-111111111111";

describe("password reset delivery", () => {
  it("places the token only in a fragment-based reset URL", () => {
    const url = buildPasswordResetUrl("signed.token/value", "https://learn.example.com/app");
    const parsed = new URL(url);
    expect(parsed.search).toBe("");
    expect(parsed.hash).toBe("#reset-password?token=signed.token%2Fvalue");
  });

  it("queues every reset request as a versioned durable message", async () => {
    const send = vi.fn().mockResolvedValue({ MessageId: "MSG-1" });
    const result = await enqueuePasswordResetRequest("learner@example.com", {
      client: { send },
      queueUrl: "https://sqs.ap-south-1.amazonaws.com/123/reset",
      requestId,
      requestedAt: "2026-11-10T08:00:00.000Z",
    });

    expect(result).toEqual({ requestId, messageId: "MSG-1" });
    const input = send.mock.calls[0][0].input;
    expect(input.QueueUrl).toContain("/reset");
    expect(JSON.parse(input.MessageBody)).toEqual({
      version: 1,
      requestId,
      email: "learner@example.com",
      requestedAt: "2026-11-10T08:00:00.000Z",
    });
  });

  it("sends a bounded reset email without putting the token in a query", async () => {
    const send = vi.fn().mockResolvedValue({ MessageId: "SES-1" });
    await sendPasswordResetEmail({ recipient: "learner@example.com", token: "signed.token" }, {
      client: { send },
      fromEmail: "security@example.com",
      baseUrl: "https://learn.example.com",
    });

    const input = send.mock.calls[0][0].input;
    expect(input.FromEmailAddress).toBe("security@example.com");
    expect(input.Destination.ToAddresses).toEqual(["learner@example.com"]);
    expect(input.Content.Simple.Body.Text.Data).toContain("#reset-password?token=signed.token");
    expect(input.Content.Simple.Body.Text.Data).not.toContain("?token=signed.token#");
  });

  it("requires encrypted redrive queue attributes and SES production access", async () => {
    const queue = { send: vi.fn().mockResolvedValue({ Attributes: {
      QueueArn: "arn:aws:sqs:ap-south-1:123:reset",
      KmsMasterKeyId: "alias/aws/sqs",
      RedrivePolicy: "{}",
    } }) };
    const email = { send: vi.fn().mockResolvedValue({ SendingEnabled: true, ProductionAccessEnabled: true }) };
    await expect(passwordResetDeliveryHealth({ queue, email, queueUrl: "https://sqs.example/reset" }))
      .resolves.toMatchObject({ ok: true, queueReady: true, emailReady: true });
  });

  it("resolves an active account in the worker, delivers once and deletes the message", async () => {
    const requestedAt = "2026-11-10T08:00:00.000Z";
    const body = JSON.stringify({ version: 1, requestId, email: "learner@example.com", requestedAt });
    const send = vi.fn()
      .mockResolvedValueOnce({ Messages: [{ Body: body, ReceiptHandle: "receipt", Attributes: { ApproximateReceiveCount: "1" } }] })
      .mockResolvedValueOnce({});
    const repository = {
      findUserByIdentifier: vi.fn().mockResolvedValue({
        id: "LRN-1",
        email: "learner@example.com",
        status: "Active",
        sessionVersion: 3,
      }),
      recordUserAudit: vi.fn().mockResolvedValue(undefined),
    };
    const sendEmail = vi.fn().mockResolvedValue({ messageId: "SES-1" });

    const result = await runPasswordResetDeliveryBatch({
      client: { send },
      queueUrl: "https://sqs.example/reset",
      repository,
      sendEmail,
      waitTimeSeconds: 0,
      now: () => new Date(requestedAt).getTime() + 1000,
    });

    expect(result).toEqual({ received: 1, delivered: 1, ignored: 0, failed: 0 });
    expect(sendEmail).toHaveBeenCalledOnce();
    const payload = jwt.verify(sendEmail.mock.calls[0][0].token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      clockTimestamp: Math.floor(new Date(requestedAt).getTime() / 1000) + 1,
    });
    expect(payload).toMatchObject({ sub: "LRN-1", sv: 3, jti: requestId, purpose: "password-reset" });
    expect(send.mock.calls[1][0].input.ReceiptHandle).toBe("receipt");
  });

  it("deletes unknown-account messages without sending email", async () => {
    const requestedAt = "2026-11-10T08:00:00.000Z";
    const send = vi.fn()
      .mockResolvedValueOnce({ Messages: [{
        Body: JSON.stringify({ version: 1, requestId, email: "unknown@example.com", requestedAt }),
        ReceiptHandle: "receipt",
      }] })
      .mockResolvedValueOnce({});
    const sendEmail = vi.fn();

    const result = await runPasswordResetDeliveryBatch({
      client: { send },
      queueUrl: "https://sqs.example/reset",
      repository: { findUserByIdentifier: vi.fn().mockResolvedValue(null) },
      sendEmail,
      waitTimeSeconds: 0,
      now: () => new Date(requestedAt).getTime() + 1000,
    });

    expect(result).toEqual({ received: 1, delivered: 0, ignored: 1, failed: 0 });
    expect(sendEmail).not.toHaveBeenCalled();
    expect(send).toHaveBeenCalledTimes(2);
  });

  it("leaves transient delivery failures for SQS redrive", async () => {
    const requestedAt = "2026-11-10T08:00:00.000Z";
    const send = vi.fn().mockResolvedValue({ Messages: [{
      Body: JSON.stringify({ version: 1, requestId, email: "learner@example.com", requestedAt }),
      ReceiptHandle: "receipt",
      Attributes: { ApproximateReceiveCount: "2" },
    }] });

    const result = await runPasswordResetDeliveryBatch({
      client: { send },
      queueUrl: "https://sqs.example/reset",
      repository: { findUserByIdentifier: vi.fn().mockResolvedValue({
        id: "LRN-1",
        email: "learner@example.com",
        status: "Active",
        sessionVersion: 0,
      }) },
      sendEmail: vi.fn().mockRejectedValue(new Error("SES unavailable")),
      waitTimeSeconds: 0,
      now: () => new Date(requestedAt).getTime() + 1000,
    });

    expect(result).toEqual({ received: 1, delivered: 0, ignored: 0, failed: 1 });
    expect(send).toHaveBeenCalledOnce();
  });
});
