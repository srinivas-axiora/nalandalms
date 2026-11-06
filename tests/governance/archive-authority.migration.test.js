import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const migration = fs.readFileSync(path.join(root, "database", "migrations", "0019_archive_authority.sql"), "utf8");
const schema = fs.readFileSync(path.join(root, "database", "schema.sql"), "utf8");
const backfill = fs.readFileSync(path.join(root, "backend", "src", "db", "backfill.js"), "utf8");

describe("archive authority migration", () => {
  it("enforces JSON shape, bounded metadata and idempotent backfill keys", () => {
    for (const sql of [migration, schema]) {
      expect(sql).toContain("deleted_archives_json_shape");
      expect(sql).toContain("uq_deleted_archives_source_key");
      expect(sql).toContain("idx_deleted_archives_order");
      expect(sql).toContain("jsonb_typeof(entity_data) = 'object'");
      expect(sql).toContain("jsonb_typeof(related_data) = 'object'");
    }
  });

  it("backfills legacy archives without credential derivatives", () => {
    expect(backfill).toContain("data.archives || []");
    expect(backfill).toContain("redactSensitive(entityData)");
    expect(backfill).toContain("ON CONFLICT (source_key) WHERE source_key IS NOT NULL DO NOTHING");
  });
});
