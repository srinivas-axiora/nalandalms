import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  deleteObject,
  deleteObjectCompletely,
  objectExists,
  objectVersionCount,
  uploadBuffer,
} from "../../backend/src/storage/object-store.js";

describe("object-store existence probe", () => {
  it("tracks a local verification object across upload and deletion", async () => {
    const key = `verification/object-existence/${crypto.randomUUID()}.bin`;
    try {
      expect(await objectExists(key)).toBe(false);
      await uploadBuffer(key, Buffer.from("object existence probe"));
      expect(await objectExists(key)).toBe(true);
      expect(await objectVersionCount(key)).toBe(1);
      expect(await deleteObjectCompletely(key)).toBe(true);
      expect(await objectExists(key)).toBe(false);
      expect(await objectVersionCount(key)).toBe(0);
    } finally {
      await deleteObject(key).catch(() => {});
    }
  });
});
