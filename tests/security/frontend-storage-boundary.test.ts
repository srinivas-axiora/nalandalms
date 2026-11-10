import { describe, expect, it, vi } from "vitest";
import { readAppState, writeAppState } from "../../frontend/src/app-state-storage";

describe("production browser state boundary", () => {
  it("removes legacy application data and never reads it in production mode", () => {
    const storage = {
      getItem: vi.fn().mockReturnValue(JSON.stringify({ secret: "stale" })),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    const initial = { users: [] };

    expect(readAppState(storage, "nalanda-v3", initial, false)).toBe(initial);
    expect(storage.removeItem).toHaveBeenCalledWith("nalanda-v3");
    expect(storage.getItem).not.toHaveBeenCalled();
  });

  it("does not write production application data to persistent browser storage", () => {
    const storage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    writeAppState(storage, "nalanda-v3", { users: [{ email: "private@example.com" }] }, false);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.removeItem).toHaveBeenCalledWith("nalanda-v3");
  });

  it("retains explicit development-only fixture persistence", () => {
    const storage = {
      getItem: vi.fn().mockReturnValue(JSON.stringify({ users: ["fixture"] })),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    expect(readAppState(storage, "nalanda-v3", { users: [] }, true)).toEqual({ users: ["fixture"] });
    writeAppState(storage, "nalanda-v3", { users: ["fixture"] }, true);
    expect(storage.setItem).toHaveBeenCalledOnce();
  });
});
