import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { parseDocument } from "yaml";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templatePath = path.join(repositoryRoot, "infra", "aws", "staging.yml");
const source = fs.readFileSync(templatePath, "utf8");

// The YAML parser does not resolve CloudFormation's short-form intrinsic tags.
// Removing only the tag tokens preserves the YAML nodes and lets this local gate
// detect malformed YAML, duplicate keys and missing structural controls. AWS
// service-side validation remains mandatory before deployment.
const intrinsicTags = [
  "And",
  "Base64",
  "Cidr",
  "Equals",
  "FindInMap",
  "GetAtt",
  "GetAZs",
  "If",
  "ImportValue",
  "Join",
  "Not",
  "Or",
  "Ref",
  "Select",
  "Split",
  "Sub",
  "Transform",
];
const tagPattern = new RegExp(`!(${intrinsicTags.join("|")})(?=\\s|\\[|\\{)`, "g");
const normalizedSource = source.replace(tagPattern, "");
const document = parseDocument(normalizedSource, {
  prettyErrors: true,
  uniqueKeys: true,
});

if (document.errors.length > 0) {
  for (const error of document.errors) console.error(error.message);
  process.exit(1);
}

const template = document.toJS();
const resources = template?.Resources;
const outputs = template?.Outputs;

if (!resources || typeof resources !== "object" || Array.isArray(resources)) {
  throw new Error("CloudFormation template must define a Resources mapping.");
}

const requiredResources = [
  "AccessLogBucket",
  "AccessLogBucketPolicy",
  "AlertTopic",
  "CustomDomainARecord",
  "CustomDomainAaaaRecord",
  "OriginDomainARecord",
  "Distribution",
  "LoadBalancer",
  "MalwareProtectionPlan",
  "MalwareProtectionRole",
  "RegionalWebAcl",
  "RegionalWebAclAssociation",
];
for (const logicalId of requiredResources) {
  if (!resources[logicalId]) throw new Error(`Required resource is missing: ${logicalId}`);
}

if (
  !outputs?.ApplicationUrl
  || !outputs?.RegionalWebAclArn
  || !outputs?.AccessLogBucketName
  || !outputs?.MalwareProtectionPlanArn
  || !outputs?.LoadBalancerArn
  || !outputs?.ApplicationListenerArn
  || !outputs?.LoadBalancerSecurityGroupId
  || !outputs?.CloudFrontOriginPrefixListId
) {
  throw new Error("Required application, edge, WAF, access-log or malware-protection outputs are missing.");
}

console.log(
  `CloudFormation local structure valid: ${Object.keys(resources).length} resources, ${Object.keys(outputs).length} outputs.`,
);
