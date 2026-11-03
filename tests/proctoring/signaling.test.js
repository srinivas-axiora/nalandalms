import { describe, expect, it } from "vitest";
import {
  clearSignals,
  getSignals,
  postSignal,
} from "../../backend/src/modules/proctoring/signaling.js";

describe("distributed proctor signaling contract", () => {
  it("bounds, filters and clears an attempt signal stream", async () => {
    const attemptId = `SIGNAL-TEST-${Date.now()}`;
    await clearSignals(attemptId);

    const first = await postSignal(attemptId, {
      senderId: "candidate-1",
      targetRole: "proctor",
      type: "offer",
      data: { sdp: "synthetic" },
    });
    await postSignal(attemptId, {
      senderId: "proctor-1",
      targetRole: "candidate",
      type: "answer",
      data: { sdp: "synthetic-answer" },
    });

    const proctorSignals = await getSignals(attemptId, {
      targetRole: "proctor",
      sinceTimestamp: first.timestamp - 1,
    });
    expect(proctorSignals).toHaveLength(1);
    expect(proctorSignals[0]).toMatchObject({ targetRole: "proctor", type: "offer" });

    await clearSignals(attemptId);
    await expect(getSignals(attemptId, {})).resolves.toEqual([]);
  });
});
