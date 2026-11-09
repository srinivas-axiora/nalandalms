param(
  [string]$Region = "ap-south-1",
  [string]$StackName = "nalanda-staging",
  [string]$ImageTag = "",
  [switch]$PrepareRelationalDatabase,
  [switch]$RunRelationalVerifiers,
  [switch]$RunMultiTaskConcurrencyCanary,
  [string]$AlertEmail = "",
  [ValidateRange(100, 2000000000)][int]$WafRateLimit = 2000,
  [string]$CustomDomainName = "",
  [string]$HostedZoneId = "",
  [string]$CloudFrontCertificateArn = "",
  [string]$OriginDomainName = "",
  [string]$OriginCertificateArn = "",
  [string]$EvidencePath = "",
  [Parameter(Mandatory = $true)][string]$RazorpayKeyIdSecretArn,
  [Parameter(Mandatory = $true)][string]$RazorpayKeySecretArn,
  [Parameter(Mandatory = $true)][string]$RazorpayWebhookSecretArn
)

$ErrorActionPreference = "Stop"
if ($RunMultiTaskConcurrencyCanary -and -not $RunRelationalVerifiers) {
  throw "RunMultiTaskConcurrencyCanary requires RunRelationalVerifiers."
}
$sourceRevision = (git rev-parse HEAD).Trim()
if ($LASTEXITCODE -ne 0 -or $sourceRevision -notmatch '^[0-9a-f]{40}$') {
  throw "A valid Git source revision is required before deployment."
}
$worktreeChanges = @(git status --porcelain --untracked-files=normal)
if ($LASTEXITCODE -ne 0) { throw "Unable to verify Git worktree state." }
if ($worktreeChanges.Count -gt 0) {
  throw "The Git worktree must be clean before building a release image."
}
if (-not $ImageTag) { $ImageTag = $sourceRevision.Substring(0, 12) }
if ($ImageTag -notmatch '^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$') {
  throw "ImageTag is not a valid ECR tag."
}
if (-not $EvidencePath) { $EvidencePath = "artifacts/aws/$StackName-$ImageTag-attestation.json" }
$customDomainValues = @(@($CustomDomainName, $HostedZoneId, $CloudFrontCertificateArn) | Where-Object { $_ })
if ($customDomainValues.Count -ne 0 -and $customDomainValues.Count -ne 3) {
  throw "CustomDomainName, HostedZoneId and CloudFrontCertificateArn must be supplied together."
}
if ($CustomDomainName -and $CustomDomainName -notmatch '^(?=.{1,253}$)[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$') {
  throw "CustomDomainName must be a valid fully qualified DNS name."
}
if ($HostedZoneId -and $HostedZoneId -notmatch '^Z[A-Z0-9]+$') {
  throw "HostedZoneId must be a valid Route 53 hosted zone identifier."
}
if ($CloudFrontCertificateArn -and $CloudFrontCertificateArn -notmatch '^arn:[^:]+:acm:us-east-1:') {
  throw "The CloudFront ACM certificate must be provisioned in us-east-1."
}
$originTlsValues = @(@($OriginDomainName, $OriginCertificateArn) | Where-Object { $_ })
if ($originTlsValues.Count -ne 0 -and $originTlsValues.Count -ne 2) {
  throw "OriginDomainName and OriginCertificateArn must be supplied together."
}
if ($OriginDomainName -and $customDomainValues.Count -ne 3) {
  throw "Origin TLS requires the complete custom-domain configuration and its Route 53 hosted zone."
}
if ($OriginDomainName -and $OriginDomainName -notmatch '^(?=.{1,253}$)[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$') {
  throw "OriginDomainName must be a valid fully qualified DNS name."
}
if ($OriginDomainName -and $OriginDomainName -eq $CustomDomainName) {
  throw "OriginDomainName must differ from CustomDomainName."
}
if ($OriginCertificateArn -and $OriginCertificateArn -notmatch "^arn:[^:]+:acm:$([regex]::Escape($Region)):") {
  throw "The origin ACM certificate must be provisioned in the deployment region ($Region)."
}

$identity = aws sts get-caller-identity --region $Region | ConvertFrom-Json
if (-not $identity.Account) { throw "AWS authentication is required." }

Write-Host "Validating CloudFormation template with AWS..."
aws cloudformation validate-template `
  --template-body file://infra/aws/staging.yml `
  --region $Region | Out-Null
if ($LASTEXITCODE -ne 0) { throw "CloudFormation template validation failed." }

$repositoryName = "nalanda"
$repositoryUri = aws ecr describe-repositories --repository-names $repositoryName --region $Region --query "repositories[0].repositoryUri" --output text 2>$null
if ($LASTEXITCODE -ne 0) {
  $repositoryUri = aws ecr create-repository `
    --repository-name $repositoryName `
    --image-scanning-configuration scanOnPush=true `
    --image-tag-mutability IMMUTABLE `
    --encryption-configuration encryptionType=AES256 `
    --region $Region `
    --query "repository.repositoryUri" `
    --output text
}

$registry = "$($identity.Account).dkr.ecr.$Region.amazonaws.com"
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $registry
if ($LASTEXITCODE -ne 0) { throw "ECR login failed." }

$taggedImage = "$repositoryUri`:$ImageTag"
docker build --platform linux/arm64 --tag $taggedImage .
if ($LASTEXITCODE -ne 0) { throw "Container build failed." }
docker push $taggedImage
if ($LASTEXITCODE -ne 0) { throw "Container push failed." }

Write-Host "Waiting for ECR vulnerability scan..."
aws ecr wait image-scan-complete `
  --repository-name $repositoryName `
  --image-id "imageTag=$ImageTag" `
  --region $Region
if ($LASTEXITCODE -ne 0) { throw "ECR image scan did not complete." }
$scan = aws ecr describe-image-scan-findings `
  --repository-name $repositoryName `
  --image-id "imageTag=$ImageTag" `
  --region $Region `
  --output json | ConvertFrom-Json
if ($LASTEXITCODE -ne 0) { throw "Unable to retrieve ECR image scan findings." }
$severity = $scan.imageScanFindings.findingSeverityCounts
$criticalFindings = if ($null -eq $severity.CRITICAL) { 0 } else { [int]$severity.CRITICAL }
$highFindings = if ($null -eq $severity.HIGH) { 0 } else { [int]$severity.HIGH }
if ($criticalFindings -gt 0 -or $highFindings -gt 0) {
  throw "ECR image scan failed the release gate: $criticalFindings critical, $highFindings high findings."
}
$imageDigest = aws ecr describe-images `
  --repository-name $repositoryName `
  --image-ids "imageTag=$ImageTag" `
  --region $Region `
  --query "imageDetails[0].imageDigest" `
  --output text
if ($LASTEXITCODE -ne 0 -or $imageDigest -notmatch '^sha256:[0-9a-f]{64}$') {
  throw "Unable to resolve the scanned ECR image to an immutable sha256 digest."
}
$deployedImage = "$repositoryUri@$($imageDigest.Trim())"

$parameterOverrides = @(
  "EnvironmentName=$StackName",
  "ContainerImage=$deployedImage",
  "SourceRevision=$sourceRevision",
  "RazorpayKeyIdSecretArn=$RazorpayKeyIdSecretArn",
  "RazorpayKeySecretArn=$RazorpayKeySecretArn",
  "RazorpayWebhookSecretArn=$RazorpayWebhookSecretArn",
  "WafRateLimit=$WafRateLimit"
)
if ($AlertEmail) { $parameterOverrides += "AlertEmail=$AlertEmail" }
if ($CustomDomainName) {
  $parameterOverrides += "CustomDomainName=$CustomDomainName"
  $parameterOverrides += "HostedZoneId=$HostedZoneId"
  $parameterOverrides += "CloudFrontCertificateArn=$CloudFrontCertificateArn"
}
if ($OriginDomainName) {
  $parameterOverrides += "OriginDomainName=$OriginDomainName"
  $parameterOverrides += "OriginCertificateArn=$OriginCertificateArn"
}

aws cloudformation deploy `
  --template-file infra/aws/staging.yml `
  --stack-name $StackName `
  --region $Region `
  --capabilities CAPABILITY_IAM `
  --no-fail-on-empty-changeset `
  --parameter-overrides $parameterOverrides
if ($LASTEXITCODE -ne 0) { throw "CloudFormation deployment failed." }

function Get-StackOutput([string]$OutputKey) {
  $value = aws cloudformation describe-stacks `
    --stack-name $StackName `
    --region $Region `
    --query "Stacks[0].Outputs[?OutputKey=='$OutputKey'].OutputValue | [0]" `
    --output text
  if ($LASTEXITCODE -ne 0 -or -not $value -or $value -eq "None") {
    throw "CloudFormation output '$OutputKey' is unavailable."
  }
  return $value.Trim()
}

function Invoke-OneOffTask([string[]]$Command) {
  $cluster = Get-StackOutput "ClusterName"
  $taskDefinition = Get-StackOutput "TaskDefinitionArn"
  $subnets = Get-StackOutput "ApplicationSubnetIds"
  $securityGroup = Get-StackOutput "ApplicationSecurityGroupId"
  $network = "awsvpcConfiguration={subnets=[$subnets],securityGroups=[$securityGroup],assignPublicIp=DISABLED}"
  $overrides = (@{
    containerOverrides = @(@{ name = "nalanda"; command = $Command })
  } | ConvertTo-Json -Depth 5 -Compress)
  $taskArn = aws ecs run-task `
    --cluster $cluster `
    --task-definition $taskDefinition `
    --launch-type FARGATE `
    --network-configuration $network `
    --overrides $overrides `
    --region $Region `
    --query "tasks[0].taskArn" `
    --output text
  if ($LASTEXITCODE -ne 0 -or -not $taskArn -or $taskArn -eq "None") {
    throw "Unable to start one-off ECS task: $($Command -join ' ')"
  }
  aws ecs wait tasks-stopped --cluster $cluster --tasks $taskArn --region $Region
  if ($LASTEXITCODE -ne 0) { throw "Timed out waiting for one-off ECS task $taskArn" }
  $result = aws ecs describe-tasks `
    --cluster $cluster `
    --tasks $taskArn `
    --region $Region `
    --query "tasks[0].containers[?name=='nalanda'] | [0].{ExitCode:exitCode,Reason:reason}" `
    --output json | ConvertFrom-Json
  if ($LASTEXITCODE -ne 0 -or $result.ExitCode -ne 0) {
    throw "One-off ECS task failed (exit $($result.ExitCode)): $($result.Reason)"
  }
}

if ($PrepareRelationalDatabase) {
  Write-Host "Preparing normalized staging schema..."
  Invoke-OneOffTask @("node", "backend/src/db/bootstrap.js")
  Write-Host "Backfilling normalized staging tables from app_state..."
  Invoke-OneOffTask @("node", "backend/src/db/backfill.js")
}

if ($RunRelationalVerifiers) {
  $verifiers = @(
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
    "verify-workplace.mjs",
    "verify-course-cutover.mjs"
  )
  foreach ($verifier in $verifiers) {
    Write-Host "Running relational verifier: $verifier"
    Invoke-OneOffTask @("node", "backend/src/db/$verifier")
  }
}

if ($RunMultiTaskConcurrencyCanary) {
  Write-Host "Running two-task relational concurrency canary..."
  & (Join-Path $PSScriptRoot "verify-multi-task.ps1") `
    -Region $Region `
    -StackName $StackName `
    -EvidencePath "artifacts/aws/$StackName-$ImageTag-multi-task.json"
  if ($LASTEXITCODE -ne 0) { throw "Multi-task concurrency canary failed." }
}

$applicationUrl = Get-StackOutput "ApplicationUrl"
$ready = $null
for ($attempt = 1; $attempt -le 12; $attempt++) {
  try {
    $ready = Invoke-RestMethod "$applicationUrl/api/ready" -TimeoutSec 15
    if ($ready.ok) { break }
  } catch {
    if ($attempt -eq 12) { throw }
  }
  Start-Sleep -Seconds 10
}
if (-not $ready.ok) { throw "Staging readiness smoke gate failed." }
Write-Host "Staging readiness smoke gate passed: $applicationUrl"

Write-Host "Running deployed AWS control attestation..."
& (Join-Path $PSScriptRoot "verify-staging.ps1") `
  -Region $Region `
  -StackName $StackName `
  -ExpectedCustomDomainName $CustomDomainName `
  -ExpectedCloudFrontCertificateArn $CloudFrontCertificateArn `
  -ExpectedOriginDomainName $OriginDomainName `
  -ExpectedOriginCertificateArn $OriginCertificateArn `
  -ExpectedContainerImage $deployedImage `
  -ExpectedSourceRevision $sourceRevision `
  -RequireEndToEndTls:([bool]$OriginDomainName) `
  -EvidencePath $EvidencePath

aws cloudformation describe-stacks `
  --stack-name $StackName `
  --region $Region `
  --query "Stacks[0].Outputs" `
  --output table
