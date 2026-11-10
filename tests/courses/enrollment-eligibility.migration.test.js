import fs from "node:fs";
import { describe, expect, it } from "vitest";

const migration = fs.readFileSync(
  new URL("../../database/migrations/0023_enrollment_prerequisite_authority.sql", import.meta.url),
  "utf8",
);
const baseline = fs.readFileSync(new URL("../../database/schema.sql", import.meta.url), "utf8");

describe("payment-order eligibility binding migration", () => {
  it("expires unbound open orders and requires eligibility on new orders", () => {
    expect(migration).toContain("SET status = 'Expired'");
    expect(migration).toContain("require_payment_order_eligibility_binding");
    expect(migration).toContain("BEFORE INSERT ON payment_orders");
  });

  it("makes the eligibility evidence immutable", () => {
    for (const field of ["course_version", "prerequisite_ids", "eligibility_bound_at"]) {
      expect(migration).toContain(`NEW.${field} IS DISTINCT FROM OLD.${field}`);
      expect(baseline).toContain(field);
    }
  });
});
