import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock("../../backend/src/db/pool.js", () => db);

import { listChapterMetadata } from "../../backend/src/repositories/chapters.repository.pg.js";

describe("chapter metadata projection", () => {
  beforeEach(() => db.query.mockReset());

  it("selects only non-content fields for a scoped course", async () => {
    db.query.mockResolvedValueOnce({ rows: [{
      id: "CH-1",
      course_id: "CRS-1",
      sequence: 1,
      title: "Trust boundaries",
      description: "Metadata only",
      duration_minutes: 20,
      minimum_time_minutes: 2,
      version: 3,
    }] });

    const result = await listChapterMetadata("CRS-1");
    const [sql, params] = db.query.mock.calls[0];

    expect(sql).toContain("WHERE course_id = $1");
    expect(sql).not.toMatch(/\bbody\b|\burl\b|file_name/i);
    expect(params).toEqual(["CRS-1"]);
    expect(result).toEqual([{
      id: "CH-1",
      courseId: "CRS-1",
      sequence: 1,
      title: "Trust boundaries",
      description: "Metadata only",
      durationMinutes: 20,
      minimumTimeMinutes: 2,
      version: 3,
    }]);
  });

  it("does not allow an unscoped metadata scan", async () => {
    await expect(listChapterMetadata()).resolves.toEqual([]);
    expect(db.query).not.toHaveBeenCalled();
  });
});
