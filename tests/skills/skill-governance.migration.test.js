import fs from "node:fs";
import { describe, expect, it } from "vitest";

const migration = fs.readFileSync(
  new URL("../../database/migrations/0022_skill_governance_integrity.sql", import.meta.url),
  "utf8",
);
const baseline = fs.readFileSync(new URL("../../database/schema.sql", import.meta.url), "utf8");

describe("skill-governance database invariants", () => {
  it("adds and validates skill and employee references", () => {
    expect(migration).toContain("FOREIGN KEY (skill_id) REFERENCES skills(id)");
    expect(migration).toContain("FOREIGN KEY (user_id) REFERENCES users(id)");
    expect(migration).toContain("VALIDATE CONSTRAINT target_skills_skill_fk");
    expect(migration).toContain("VALIDATE CONSTRAINT target_skills_user_fk");
  });

  it("requires exactly the reference for the selected target scope", () => {
    expect(migration).toContain("target_skills_scope_reference_ck");
    expect(migration).toContain("scope = 'Employee'");
    expect(migration).toContain("user_id IS NOT NULL");
    expect(migration).toContain("VALIDATE CONSTRAINT target_skills_scope_reference_ck");
  });

  it("keeps the normalized baseline aligned with the migration", () => {
    expect(baseline).toContain("target_score >= 1 AND target_score <= 100");
    expect(baseline).toContain("scope = 'Organization' AND department IS NULL");
  });
});
