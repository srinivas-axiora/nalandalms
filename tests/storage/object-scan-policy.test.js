import { describe, expect, it } from "vitest";
import {
  CLEAN_MALWARE_SCAN_STATUS,
  MALWARE_SCAN_TAG,
  ObjectScanError,
  malwareScanStatusFromTags,
  objectRequiresMalwareScan,
} from "../../backend/src/storage/object-store.js";

describe("private object malware scan policy", () => {
  it.each([
    "course_media/CRS-1/video.mp4",
    "chapter_pdf/CRS-1/chapter.pdf",
    "proctoring/ATT-1/capture.jpg",
  ])("requires scanning for untrusted object %s", (key) => {
    expect(objectRequiresMalwareScan(key)).toBe(true);
  });

  it("does not quarantine internally generated report artifacts", () => {
    expect(objectRequiresMalwareScan("reports/RPT-1/report.pdf")).toBe(false);
  });

  it("treats a missing result as pending and recognizes only the clean verdict", () => {
    expect(malwareScanStatusFromTags([])).toBe("PENDING");
    expect(malwareScanStatusFromTags([{ Key: MALWARE_SCAN_TAG, Value: "THREATS_FOUND" }])).toBe("THREATS_FOUND");
    expect(malwareScanStatusFromTags([{ Key: MALWARE_SCAN_TAG, Value: CLEAN_MALWARE_SCAN_STATUS }]))
      .toBe(CLEAN_MALWARE_SCAN_STATUS);
  });

  it("distinguishes pending, threat and rejected scan outcomes", () => {
    expect(new ObjectScanError("THREATS_FOUND")).toMatchObject({
      code: "OBJECT_QUARANTINED",
      scanStatus: "THREATS_FOUND",
    });
    expect(new ObjectScanError("FAILED")).toMatchObject({
      code: "OBJECT_SCAN_REJECTED",
      scanStatus: "FAILED",
    });
  });
});
