import fs from "node:fs";
import { describe, expect, it } from "vitest";

const migration = fs.readFileSync("database/migrations/0021_workplace_authority.sql", "utf8");

describe("workplace authority migration", () => {
  it("creates concurrency-safe normalized workplace stores", () => {
    expect(migration).toContain("CREATE TABLE IF NOT EXISTS attendance_records");
    expect(migration).toContain("CONSTRAINT uq_attendance_user_date UNIQUE");
    expect(migration).toContain("CREATE TABLE IF NOT EXISTS performance_reviews");
    expect(migration).toContain("CREATE TABLE IF NOT EXISTS workplace_communications");
    expect(migration).toContain("idx_workplace_communications_recipient");
    expect(migration).toContain("idx_workplace_communications_sender");
  });

  it("fails closed around active privacy work and advances coverage", () => {
    expect(migration).toContain("status = 'Processing'");
    expect(migration).toContain("RAISE EXCEPTION");
    expect(migration).toContain("coverage_version = 'normalized-v2'");
    expect(migration).toContain("ALTER COLUMN coverage_version SET DEFAULT 'normalized-v2'");
  });
});
