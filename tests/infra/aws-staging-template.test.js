import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const template = fs.readFileSync(path.join(repositoryRoot, "infra", "aws", "staging.yml"), "utf8");
const deploymentScript = fs.readFileSync(
  path.join(repositoryRoot, "infra", "aws", "deploy-staging.ps1"),
  "utf8",
);

describe("AWS staging release controls", () => {
  it("retains encrypted ALB access logs behind a scoped delivery policy", () => {
    expect(template).toContain("AccessLogBucket:");
    expect(template).toContain("SSEAlgorithm: AES256");
    expect(template).toContain("logdelivery.elasticloadbalancing.amazonaws.com");
    expect(template).toContain("alb/AWSLogs/${AWS::AccountId}/*");
    expect(template).toContain("routing.http.drop_invalid_header_fields.enabled");
    expect(template).toContain("access_logs.s3.enabled");
  });

  it("associates a regional WAF with forwarded-client-IP rate protection", () => {
    expect(template).toContain("Type: AWS::WAFv2::WebACL");
    expect(template).toContain("Type: AWS::WAFv2::WebACLAssociation");
    expect(template).toContain("AggregateKeyType: FORWARDED_IP");
    expect(template).toContain("HeaderName: X-Forwarded-For");
    expect(template).toContain("Name: AWSManagedRulesCommonRuleSet");
    expect(template).toMatch(/AwsManagedCommonThreatsCount[\s\S]*?OverrideAction:\s*\n\s+Count:[\s\S]*?AWSManagedRulesCommonRuleSet/);
    expect(template).toContain("Name: AWSManagedRulesKnownBadInputsRuleSet");
  });

  it("defines encrypted alert routing and broad operational alarms", () => {
    expect(template).toContain("Type: AWS::SNS::Topic");
    expect(template).toContain("AlertKey:");
    expect(template).toContain("EnableKeyRotation: true");
    expect(template).toContain("Service: cloudwatch.amazonaws.com");
    expect(template).toContain("aws:SourceAccount: !Ref AWS::AccountId");
    expect(template).toContain("KmsMasterKeyId: !GetAtt AlertKey.Arn");
    expect(template).toContain("ReadinessFailureMetric:");
    expect(template).toContain("ApplicationErrorMetric:");
    expect((template.match(/Type: AWS::CloudWatch::Alarm/g) ?? []).length).toBeGreaterThanOrEqual(9);
  });

  it("keeps relational authority flags disabled until live verification", () => {
    const expectedFlags = [
      "USE_PG_PAYMENTS",
      "USE_PG_SKILLS",
      "USE_PG_IDENTITY",
      "USE_PG_ATTEMPTS",
      "USE_PG_CERTIFICATES",
      "USE_PG_CANDIDATE_ASSESSMENTS",
      "USE_PG_COURSES",
      "USE_PG_PRIVACY",
      "USE_PG_SETTINGS",
    ];
    for (const flag of expectedFlags) {
      expect(template).toContain(`Name: ${flag}, Value: "0"`);
    }
    expect(template).not.toMatch(/Name: USE_PG_[A-Z_]+, Value: "1"/);
  });

  it("gates deployment on service validation, image scanning, verifiers and readiness", () => {
    expect(deploymentScript).toContain("cloudformation validate-template");
    expect(deploymentScript).toContain("ecr wait image-scan-complete");
    expect(deploymentScript).toContain("$criticalFindings -gt 0 -or $highFindings -gt 0");
    expect(deploymentScript).toContain("RunRelationalVerifiers");
    expect(deploymentScript).toContain("Staging readiness smoke gate passed");

    const expectedVerifiers = [
      "verify-identity.mjs",
      "verify-attempts.mjs",
      "verify-certificates.mjs",
      "verify-candidate-assessments.mjs",
      "verify-privacy.mjs",
      "verify-courses.mjs",
      "verify-learning.mjs",
      "verify-assessments.mjs",
      "verify-assignments.mjs",
      "verify-cohorts.mjs",
      "verify-analytics.mjs",
      "verify-reports.mjs",
      "verify-ai-feedback.mjs",
      "verify-operational-authority.mjs",
    ];
    for (const verifier of expectedVerifiers) expect(deploymentScript).toContain(verifier);
  });
});
