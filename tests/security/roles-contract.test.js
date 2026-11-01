import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { roles } from "../../backend/src/core.js";

function schemaRoles() {
  const schema = fs.readFileSync(path.resolve("database/schema.sql"), "utf8");
  const match = schema.match(/CREATE TYPE user_role AS ENUM\s*\(([^;]+)\);/s);
  if (!match) throw new Error("database/schema.sql does not declare user_role");
  return [...match[1].matchAll(/'([^']+)'/g)].map((entry) => entry[1]);
}

describe("canonical role contract", () => {
  it("keeps the runtime and PostgreSQL user_role values identical", () => {
    expect(schemaRoles().sort()).toEqual([...roles].sort());
  });
});
