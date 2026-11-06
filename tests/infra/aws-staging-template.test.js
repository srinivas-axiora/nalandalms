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
const verificationScript = fs.readFileSync(
  path.join(repositoryRoot, "infra", "aws", "verify-staging.ps1"),
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

  it("quarantines protected media until GuardDuty reports a clean scan", () => {
    expect(template).toContain("Type: AWS::GuardDuty::MalwareProtectionPlan");
    expect(template).toContain("Service: malware-protection-plan.guardduty.amazonaws.com");
    expect(template).toContain("GuardDutyMalwareScanStatus: NO_THREATS_FOUND");
    expect(template).toContain("ObjectPrefixes:");
    expect(template).toContain("- course_media/");
    expect(template).toContain("- chapter_pdf/");
    expect(template).toContain("- proctoring/");
    expect(template).toContain("Status: ENABLED");
    expect(template).toContain("GuardDuty Malware Protection Object Scan Result");
    expect(template).toContain("THREATS_FOUND");
    expect(template).toContain("GuardDuty Malware Protection Post Scan Action Failed");
    expect(template).toContain("Action: [s3:GetObject, s3:GetObjectTagging, s3:PutObject, s3:DeleteObject]");
  });

  it("configures custom-domain TLS only from a complete validated input tuple", () => {
    expect(template).toContain("HasCustomDomain: !And");
    expect(template).toContain("CompleteCustomDomainConfiguration:");
    expect(template).toContain("AcmCertificateArn: !Ref CloudFrontCertificateArn");
    expect(template).toContain("MinimumProtocolVersion: TLSv1.2_2021");
    expect(template).toContain("SslSupportMethod: sni-only");
    expect(template).toContain("Type: AAAA");
    expect(template).toContain("HostedZoneId: Z2FDTNDATAQYW2");
    expect(template).toMatch(/Name: ALLOWED_ORIGINS[\s\S]*?HasCustomDomain[\s\S]*?CustomDomainName/);
    expect(deploymentScript).toContain("must be supplied together");
    expect(deploymentScript).toContain("acm:us-east-1:");
  });

  it("encrypts the CloudFront-to-ALB hop only from a complete regional origin tuple", () => {
    expect(template).toContain("HasOriginTls: !And");
    expect(template).toContain("CompleteOriginTlsConfiguration:");
    expect(template).toContain("OriginProtocolPolicy: !If [HasOriginTls, https-only, http-only]");
    expect(template).toContain("OriginSSLProtocols: !If");
    expect(template).toContain("- [TLSv1.2]");
    expect(template).toContain("SslPolicy: !If [HasOriginTls, ELBSecurityPolicy-TLS13-1-2-2021-06");
    expect(template).toContain("CertificateArn: !Ref OriginCertificateArn");
    expect(template).toContain("HostedZoneId: !GetAtt LoadBalancer.CanonicalHostedZoneID");
    expect(template).toMatch(/HasOriginTls[\s\S]*?FromPort: 443[\s\S]*?SourcePrefixListId/);
    expect(deploymentScript).toContain("OriginDomainName must differ from CustomDomainName");
    expect(deploymentScript).toContain("origin ACM certificate must be provisioned in the deployment region");
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
      "USE_PG_AUDIT",
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
    expect(deploymentScript).toContain("verify-staging.ps1");

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
      "verify-security-evidence.mjs",
      "verify-archives.mjs",
    ];
    for (const verifier of expectedVerifiers) expect(deploymentScript).toContain(verifier);
  });

  it("attests deployed edge, origin, WAF and readiness state before preserving evidence", () => {
    expect(template).toContain("LoadBalancerSecurityGroupId:");
    expect(template).toContain("ApplicationListenerArn:");
    expect(template).toContain("CloudFrontOriginPrefixListId:");
    expect(verificationScript).toContain('\"cloudfront\", \"get-distribution\"');
    expect(verificationScript).toContain('\"elbv2\", \"describe-listeners\"');
    expect(verificationScript).toContain('\"elbv2\", \"describe-listener-certificates\"');
    expect(verificationScript).toContain('\"ec2\", \"describe-security-groups\"');
    expect(verificationScript).toContain('\"wafv2\", \"get-web-acl-for-resource\"');
    expect(verificationScript).toContain("RequireEndToEndTls requires both expected viewer and origin TLS tuples");
    expect(verificationScript).toContain("The ALB must expose exactly one listener");
    expect(verificationScript).toContain("The ALB security group must have exactly one ingress rule");
    expect(verificationScript).toContain("Set-Content -LiteralPath $resolvedEvidencePath");
  });

  it("deploys and attests the scanned image by digest and source revision", () => {
    expect(template).toContain("Description: Immutable ECR image URI pinned to a sha256 manifest digest");
    expect(template).toContain("SourceRevision:");
    expect(template).toContain("org.opencontainers.image.revision: !Ref SourceRevision");
    expect(deploymentScript).toContain("git status --porcelain --untracked-files=normal");
    expect(deploymentScript).toContain("The Git worktree must be clean before building a release image");
    expect(deploymentScript).toContain('"imageDetails[0].imageDigest"');
    expect(deploymentScript).toContain("$deployedImage = \"$repositoryUri@$($imageDigest.Trim())\"");
    expect(deploymentScript).toContain("$scan.imageScanFindings.findingSeverityCounts");
    expect(deploymentScript).not.toContain("findingsSeverityCounts");
    expect(verificationScript).toContain('\"ecs\", \"describe-task-definition\"');
    expect(verificationScript).toContain('\"ecs\", \"describe-services\"');
    expect(verificationScript).toContain('\"ecr\", \"describe-image-scan-findings\"');
    expect(verificationScript).toContain("The task definition image does not match the expected immutable digest");
    expect(verificationScript).toContain("The ECS primary deployment has not completed");
    expect(verificationScript).toContain("findingSeverityCounts");
    expect(verificationScript).toContain("supplyChain = [ordered]@{");
  });

  it("keeps service and one-off tasks private with resilient per-AZ NAT egress", () => {
    expect(template).toContain("ApplicationSubnetA:");
    expect(template).toContain("ApplicationSubnetB:");
    expect((template.match(/Type: AWS::EC2::NatGateway/g) ?? []).length).toBe(2);
    expect(template).toContain("ApplicationDefaultRouteA:");
    expect(template).toContain("ApplicationDefaultRouteB:");
    expect(template).toContain("NatGatewayId: !Ref NatGatewayA");
    expect(template).toContain("NatGatewayId: !Ref NatGatewayB");
    expect(template).toMatch(/Service:[\s\S]*?AssignPublicIp: DISABLED[\s\S]*?Subnets: \[!Ref ApplicationSubnetA, !Ref ApplicationSubnetB\]/);
    expect(deploymentScript).toContain('Get-StackOutput "ApplicationSubnetIds"');
    expect(deploymentScript).toContain("assignPublicIp=DISABLED");
    expect(deploymentScript).not.toContain("assignPublicIp=ENABLED");
    expect(verificationScript).toContain('"ec2", "describe-subnets"');
    expect(verificationScript).toContain('"ec2", "describe-nat-gateways"');
    expect(verificationScript).toContain('"ec2", "describe-route-tables"');
    expect(verificationScript).toContain("The ECS service still assigns public IP addresses");
    expect(verificationScript).toContain("routes through a NAT gateway in a different Availability Zone");
    expect(verificationScript).toContain("sameZoneNatRoutingVerified = $true");
    expect(verificationScript).toContain("network = [ordered]@{");
  });
});
