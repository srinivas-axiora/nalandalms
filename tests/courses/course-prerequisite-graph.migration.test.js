import fs from "node:fs";
import { describe, expect, it } from "vitest";

const sql = fs.readFileSync(
  new URL("../../database/migrations/0024_course_prerequisite_graph.sql", import.meta.url),
  "utf8",
);

describe("course prerequisite graph migration", () => {
  it("serializes graph mutations and rejects invalid graph state", () => {
    expect(sql).toContain("pg_advisory_xact_lock");
    expect(sql).toContain("course_prerequisite_exists");
    expect(sql).toContain("course_prerequisite_cycle");
    expect(sql).toContain("course_prerequisite_unavailable");
    expect(sql).toContain("course_prerequisite_in_use");
  });

  it("validates historical rows through the trigger", () => {
    expect(sql).toContain("UPDATE courses SET prerequisites = prerequisites");
    expect(sql).toContain("BEFORE INSERT OR UPDATE OF prerequisites, status, approval OR DELETE");
  });
});
