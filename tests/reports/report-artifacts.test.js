import { describe, expect, it } from "vitest";
import { unzipSync, strFromU8 } from "fflate";
import { createPdfArtifact, createXlsxArtifact } from "../../backend/src/reports/report-artifacts.js";

const rows = [{
  userId: "USR-1", employeeName: "Learner <One>", team: "Blue", department: "Engineering",
  courseId: "CRS-1", courseTitle: "Security & Privacy", progress: 75,
  chapterTimeSeconds: 600, assessmentTimeSeconds: 120, courseTimeSeconds: 900,
}];

describe("report artifact generation", () => {
  it("creates a genuine XLSX archive with escaped inline worksheet data", () => {
    const artifact = createXlsxArtifact(rows);
    expect(artifact.subarray(0, 2).toString()).toBe("PK");
    const files = unzipSync(artifact);
    expect(Object.keys(files)).toContain("xl/worksheets/sheet1.xml");
    const worksheet = strFromU8(files["xl/worksheets/sheet1.xml"]);
    expect(worksheet).toContain("Learner &lt;One&gt;");
    expect(worksheet).toContain("Security &amp; Privacy");
    expect(worksheet).not.toContain("<f>");
  });

  it("creates a genuine PDF document", async () => {
    const artifact = await createPdfArtifact({
      report: { id: "RPT-1", reportType: "Team" }, rows,
      generatedAt: new Date("2026-11-05T00:00:00Z"),
    });
    expect(artifact.subarray(0, 5).toString()).toBe("%PDF-");
    expect(artifact.length).toBeGreaterThan(500);
  });
});
