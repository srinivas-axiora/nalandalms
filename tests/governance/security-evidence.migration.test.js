import fs from "node:fs";
import { describe, expect, it } from "vitest";

const migration = fs.readFileSync("database/migrations/0018_security_evidence_authority.sql", "utf8");
const schema = fs.readFileSync("database/schema.sql", "utf8");

describe("security evidence relational schema", () => {
  it("defines bounded durable event tables and deterministic indexes", () => {
    for (const source of [migration, schema]) {
      expect(source).toContain("security_events");
      expect(source).toContain("security_events_shape");
      expect(source).toContain("audit_logs_shape");
      expect(source).toContain("uq_audit_logs_ingest_key");
      expect(source).toContain("uq_security_events_ingest_key");
      expect(source).toContain("idx_security_events_created");
    }
  });

  it("recursively scrubs metadata at the database boundary", () => {
    expect(migration).toContain("nalanda_redact_evidence_metadata(item.value)");
    expect(migration).toContain("trg_scrub_audit_metadata");
    expect(migration).toContain("trg_scrub_security_metadata");
    expect(migration).toContain("'passwordhash'");
    expect(migration).toContain("'candidateemail'");
    expect(migration).toContain("UPDATE audit_logs SET metadata");
    expect(migration).toContain("UPDATE security_events SET metadata");
  });
});
