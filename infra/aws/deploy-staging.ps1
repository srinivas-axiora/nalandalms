param(
  [string]$Region = "ap-south-1",
  [string]$StackName = "nalanda-staging",
  [string]$ImageTag = "",
  [switch]$PrepareRelationalDatabase,
  [switch]$RunRelationalVerifiers,
  [switch]$RunMultiTaskConcurrencyCanary,
  [switch]$PromoteNormalizedAuthority,
  [switch]$ConfirmNormalizedPromotion,
  [switch]$ConfirmStagingTrafficStopped,
  [ValidateRange(120, 3600)][int]$SoakDurationSeconds = 900,
  [ValidateRange(0.5, 5.0)][double]$SoakRequestsPerSecondPerWorker = 2.0,
  [string]$AlertEmail = "",
  [ValidateRange(100, 2000000000)][int]$WafRateLimit = 2000,
  [string]$CustomDomainName = "",
  [string]$HostedZoneId = "",
  [string]$CloudFrontCertificateArn = "",
  [string]$OriginDomainName = "",
  [string]$OriginCertificateArn = "",
  [string]$EvidencePath = "",
  [string]$PromotionEvidencePath = "",
  [Parameter(Mandatory = $true)][ValidatePattern('^\d{12}$')][string]$ExpectedAccountId,
  [switch]$ConfirmStagingDeployment,
  [Parameter(Mandatory = $true)][string]$RazorpayKeyIdSecretArn,
  [Parameter(Mandatory = $true)][string]$RazorpayKeySecretArn,
  [Parameter(Mandatory = $true)][string]$RazorpayWebhookSecretArn
)

$ErrorActionPreference = "Stop"
if (-not $ConfirmStagingDeployment) {
  throw "Staging deployment requires the explicit -ConfirmStagingDeployment switch."
}
if ($StackName -notmatch '(?i)(staging|stage|test|nonprod|dev)' -or $StackName -match '(?i)(^|[-_])prod(uction)?($|[-_])') {
  throw "This deployment script is restricted to an explicitly non-production stack."
}
if ($RunMultiTaskConcurrencyCanary -and -not $RunRelationalVerifiers) {
  throw "RunMultiTaskConcurrencyCanary requires RunRelationalVerifiers."
}
if ($PromoteNormalizedAuthority -and (-not $PrepareRelationalDatabase `
  -or -not $RunRelationalVerifiers -or -not $RunMultiTaskConcurrencyCanary)) {
  throw "PromoteNormalizedAuthority requires database preparation, every relational verifier and the multi-task concurrency canary."
}
if ($PromoteNormalizedAuthority -and -not $ConfirmNormalizedPromotion) {
  throw "PromoteNormalizedAuthority requires the explicit -ConfirmNormalizedPromotion switch."
}
if ($PromoteNormalizedAuthority -and -not $ConfirmStagingTrafficStopped) {
  throw "PromoteNormalizedAuthority requires confirmation that user and batch traffic is stopped."
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
if (-not $PromotionEvidencePath) {
  $PromotionEvidencePath = "artifacts/aws/$StackName-$ImageTag-normalized-promotion.json"
}
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
if ([string]$identity.Account -ne $ExpectedAccountId) {
  throw "The authenticated AWS account does not match ExpectedAccountId."
}

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

function Invoke-StackDeployment([string]$AuthorityMode = "") {
  $overrides = @($parameterOverrides | Where-Object { $_ -notmatch '^AuthorityMode=' })
  if ($AuthorityMode) { $overrides += "AuthorityMode=$AuthorityMode" }
  aws cloudformation deploy `
    --template-file infra/aws/staging.yml `
    --stack-name $StackName `
    --region $Region `
    --capabilities CAPABILITY_IAM `
    --no-fail-on-empty-changeset `
    --parameter-overrides $overrides
  if ($LASTEXITCODE -ne 0) { throw "CloudFormation deployment failed for AuthorityMode=$AuthorityMode." }
}

$initialAuthorityMode = if ($PromoteNormalizedAuthority) { "snapshot" } else { "" }
Invoke-StackDeployment $initialAuthorityMode

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

function Set-StagingServiceCount([int]$DesiredCount) {
  $cluster = Get-StackOutput "ClusterName"
  $service = Get-StackOutput "ServiceName"
  aws ecs update-service `
    --cluster $cluster `
    --service $service `
    --desired-count $DesiredCount `
    --region $Region `
    --output json | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Unable to set staging service desired count to $DesiredCount." }
  aws ecs wait services-stable --cluster $cluster --services $service --region $Region
  if ($LASTEXITCODE -ne 0) { throw "Staging service did not stabilize at desired count $DesiredCount." }
  $state = aws ecs describe-services `
    --cluster $cluster `
    --services $service `
    --region $Region `
    --query "services[0].{Status:status,Desired:desiredCount,Running:runningCount,Pending:pendingCount}" `
    --output json | ConvertFrom-Json
  if ($LASTEXITCODE -ne 0 -or $state.Status -ne "ACTIVE" `
    -or [int]$state.Desired -ne $DesiredCount -or [int]$state.Running -ne $DesiredCount `
    -or [int]$state.Pending -ne 0) {
    throw "Staging service count attestation failed for desired count $DesiredCount."
  }
  return $state
}

$promotionSnapshotIdentifier = ""
$promotionSnapshotStatus = ""
$promotionSnapshotEncrypted = $false
$snapshotTaskDefinitionArn = if ($PromoteNormalizedAuthority) { Get-StackOutput "TaskDefinitionArn" } else { "" }
$normalizedTaskDefinitionArn = ""
$authorityModeAfter = if ($PromoteNormalizedAuthority) { Get-StackOutput "AuthorityMode" } else { "" }
$soakEvidencePath = "artifacts/aws/$StackName-$ImageTag-http-soak.json"
$rollbackResult = "not-required"
$rollbackTaskDefinitionArn = ""
$normalizedDeploymentAttempted = $false
$cutoverQuiesced = $false
$cutoverQuiescenceResult = if ($PromoteNormalizedAuthority) { "not-started" } else { "not-required" }
$finalReconciliationResult = if ($PromoteNormalizedAuthority) { "not-started" } else { "not-required" }
$promotionError = $null

function Write-PromotionEvidence([string]$Result, [string]$ErrorMessage = "") {
  $evidence = [ordered]@{
    schemaVersion = 1
    capturedAt = (Get-Date).ToUniversalTime().ToString("o")
    result = $Result
    error = $ErrorMessage
    accountId = [string]$identity.Account
    region = $Region
    stackName = $StackName
    sourceRevision = $sourceRevision
    containerImage = $deployedImage
    snapshotIdentifier = $promotionSnapshotIdentifier
    snapshotStatus = $promotionSnapshotStatus
    snapshotEncrypted = $promotionSnapshotEncrypted
    snapshotTaskDefinitionArn = $snapshotTaskDefinitionArn
    normalizedTaskDefinitionArn = $normalizedTaskDefinitionArn
    authorityModeAfter = $authorityModeAfter
    soakEvidencePath = $soakEvidencePath
    rollbackResult = $rollbackResult
    rollbackTaskDefinitionArn = $rollbackTaskDefinitionArn
    quiescenceOriginalDesiredCount = $promotionOriginalDesiredCount
    quiescenceResult = $promotionQuiescenceResult
    serviceResumeResult = $promotionResumeResult
    cutoverQuiescenceResult = $cutoverQuiescenceResult
    finalReconciliationResult = $finalReconciliationResult
  }
  $resolvedPath = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($PromotionEvidencePath)
  $directory = Split-Path -Parent $resolvedPath
  if ($directory) { New-Item -ItemType Directory -Force -Path $directory | Out-Null }
  $evidence | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $resolvedPath -Encoding utf8
  Write-Host "Normalized-authority promotion evidence: $resolvedPath"
}

$promotionOriginalDesiredCount = $null
$promotionQuiescenceResult = if ($PromoteNormalizedAuthority) { "pending" } else { "not-required" }
$promotionResumeResult = if ($PromoteNormalizedAuthority) { "pending" } else { "not-required" }
$databasePhaseError = $null
$resumeError = $null

try {
  if ($PromoteNormalizedAuthority) {
    $cluster = Get-StackOutput "ClusterName"
    $service = Get-StackOutput "ServiceName"
    $originalDesiredCount = aws ecs describe-services `
      --cluster $cluster `
      --services $service `
      --region $Region `
      --query "services[0].desiredCount" `
      --output text
    if ($LASTEXITCODE -ne 0 -or $originalDesiredCount -notmatch '^\d+$' `
      -or [int]$originalDesiredCount -lt 1) {
      throw "Normalized promotion requires a running staging service before the write-quiescence window."
    }
    $promotionOriginalDesiredCount = [int]$originalDesiredCount
    Write-Host "Enforcing staging write quiescence for relational preparation..."
    Set-StagingServiceCount 0 | Out-Null
    $promotionQuiescenceResult = "passed"
  }

  if ($PrepareRelationalDatabase) {
    Write-Host "Preparing normalized staging schema..."
    Invoke-OneOffTask @("node", "backend/src/db/bootstrap.js")
    Write-Host "Backfilling normalized staging tables from app_state..."
    Invoke-OneOffTask @("node", "backend/src/db/backfill.js")
  }

  if ($RunRelationalVerifiers) {
    $verifiers = @(
      "verify-normalized-reconciliation.mjs",
      "verify-payments.mjs",
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
      "verify-proctor-retention.mjs",
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
} catch {
  $databasePhaseError = $_
} finally {
  if ($PromoteNormalizedAuthority -and $null -ne $promotionOriginalDesiredCount) {
    try {
      Write-Host "Restoring the pre-promotion staging service count..."
      Set-StagingServiceCount ([int]$promotionOriginalDesiredCount) | Out-Null
      $promotionResumeResult = "passed"
    } catch {
      $promotionResumeResult = "failed"
      $resumeError = $_
    }
  }
}
if ($resumeError) {
  $priorMessage = if ($databasePhaseError) { " Database phase error: $($databasePhaseError.Exception.Message)" } else { "" }
  $recoveryMessage = "Staging service recovery after write quiescence failed: $($resumeError.Exception.Message).$priorMessage"
  if ($PromoteNormalizedAuthority) {
    $rollbackResult = "failed: $($resumeError.Exception.Message)"
    try { $authorityModeAfter = Get-StackOutput "AuthorityMode" } catch { $authorityModeAfter = "unknown" }
    try { Write-PromotionEvidence "failed" $recoveryMessage } catch { Write-Warning $_.Exception.Message }
  }
  throw $recoveryMessage
}
if ($databasePhaseError) {
  if ($PromoteNormalizedAuthority) {
    $authorityModeAfter = Get-StackOutput "AuthorityMode"
    try { Write-PromotionEvidence "failed" $databasePhaseError.Exception.Message } catch { Write-Warning $_.Exception.Message }
  }
  throw $databasePhaseError
}

function Wait-ApplicationReady {
  $applicationUrl = Get-StackOutput "ApplicationUrl"
  $ready = $null
  for ($attempt = 1; $attempt -le 18; $attempt++) {
    try {
      $ready = Invoke-RestMethod "$applicationUrl/api/ready" -TimeoutSec 15
      if ($ready.ok) { break }
    } catch {
      if ($attempt -eq 18) { throw }
    }
    Start-Sleep -Seconds 10
  }
  if (-not $ready.ok) { throw "Staging readiness smoke gate failed." }
  Write-Host "Staging readiness smoke gate passed: $applicationUrl"
  return $applicationUrl
}

function Invoke-StagingAttestation([string]$Path) {
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
    -EvidencePath $Path
}

$applicationUrl = Wait-ApplicationReady
if (-not $PromoteNormalizedAuthority) {
  Invoke-StagingAttestation $EvidencePath
} else {
  $cutoverQuiescenceResult = "pending"
  $finalReconciliationResult = "pending"

  try {
    if ($authorityModeAfter -ne "snapshot") {
      throw "The pre-promotion stack did not converge to AuthorityMode=snapshot."
    }
    Invoke-StagingAttestation "artifacts/aws/$StackName-$ImageTag-prepromotion-attestation.json"

    Write-Host "Enforcing the final write-quiescence window..."
    $cutoverQuiesced = $true
    Set-StagingServiceCount 0 | Out-Null
    $cutoverQuiescenceResult = "passed"
    $finalReconciliationResult = "running"
    Write-Host "Refreshing the relational backfill inside the final write-quiescence window..."
    Invoke-OneOffTask @("node", "backend/src/db/backfill.js")
    Write-Host "Re-running source-to-target reconciliation inside the final write-quiescence window..."
    Invoke-OneOffTask @("node", "backend/src/db/verify-normalized-reconciliation.mjs")
    $finalReconciliationResult = "passed"

    $databaseIdentifier = Get-StackOutput "DatabaseIdentifier"
    $snapshotSuffix = (Get-Date).ToUniversalTime().ToString("yyyyMMddHHmmss")
    $snapshotBase = (($StackName.ToLowerInvariant() -replace '[^a-z0-9-]', '-') -replace '-+', '-').Trim('-')
    if ($snapshotBase.Length -gt 80) { $snapshotBase = $snapshotBase.Substring(0, 80).TrimEnd('-') }
    $promotionSnapshotIdentifier = "$snapshotBase-pre-normalized-$($sourceRevision.Substring(0, 8))-$snapshotSuffix"
    Write-Host "Creating mandatory pre-promotion RDS snapshot: $promotionSnapshotIdentifier"
    aws rds create-db-snapshot `
      --db-instance-identifier $databaseIdentifier `
      --db-snapshot-identifier $promotionSnapshotIdentifier `
      --tags "Key=Purpose,Value=normalized-authority-promotion" "Key=SourceRevision,Value=$sourceRevision" `
      --region $Region `
      --output json | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Unable to create the pre-promotion RDS snapshot." }
    aws rds wait db-snapshot-available `
      --db-snapshot-identifier $promotionSnapshotIdentifier `
      --region $Region
    if ($LASTEXITCODE -ne 0) { throw "The pre-promotion RDS snapshot did not become available." }
    $snapshotEnvelope = aws rds describe-db-snapshots `
      --db-snapshot-identifier $promotionSnapshotIdentifier `
      --region $Region `
      --output json | ConvertFrom-Json
    if ($LASTEXITCODE -ne 0) { throw "Unable to attest the pre-promotion RDS snapshot." }
    $snapshot = @($snapshotEnvelope.DBSnapshots)[0]
    $promotionSnapshotStatus = [string]$snapshot.Status
    $promotionSnapshotEncrypted = [bool]$snapshot.Encrypted
    if ($promotionSnapshotStatus -ne "available" -or -not $promotionSnapshotEncrypted `
      -or [string]$snapshot.DBInstanceIdentifier -ne $databaseIdentifier) {
      throw "The pre-promotion RDS snapshot failed availability, encryption or source binding checks."
    }

    Write-Host "Promoting the attested task definition to normalized authority..."
    $normalizedDeploymentAttempted = $true
    Invoke-StackDeployment "normalized"
    Set-StagingServiceCount ([int]$promotionOriginalDesiredCount) | Out-Null
    $cutoverQuiesced = $false
    $authorityModeAfter = Get-StackOutput "AuthorityMode"
    $normalizedTaskDefinitionArn = Get-StackOutput "TaskDefinitionArn"
    if ($authorityModeAfter -ne "normalized") {
      throw "The stack did not publish AuthorityMode=normalized after promotion."
    }
    if ($normalizedTaskDefinitionArn -eq $snapshotTaskDefinitionArn) {
      throw "Promotion did not produce a new normalized task definition."
    }
    $applicationUrl = Wait-ApplicationReady
    Invoke-StagingAttestation $EvidencePath

    Write-Host "Running mandatory two-task HTTP load/soak gate..."
    & (Join-Path $PSScriptRoot "verify-http-soak.ps1") `
      -Region $Region `
      -StackName $StackName `
      -ExpectedAccountId ([string]$identity.Account) `
      -ExpectedSourceRevision $sourceRevision `
      -ConfirmLoadTest `
      -DurationSeconds $SoakDurationSeconds `
      -RequestsPerSecondPerWorker $SoakRequestsPerSecondPerWorker `
      -EvidencePath $soakEvidencePath
    $applicationUrl = Wait-ApplicationReady
    Invoke-StagingAttestation $EvidencePath
    $authorityModeAfter = Get-StackOutput "AuthorityMode"
    if ($authorityModeAfter -ne "normalized") {
      throw "The stack left normalized authority after the soak gate."
    }
    Write-PromotionEvidence "passed"
  } catch {
    $promotionError = $_
    if ($finalReconciliationResult -eq "running") { $finalReconciliationResult = "failed" }
    if ($normalizedDeploymentAttempted) {
      try {
        Write-Warning "Normalized promotion failed; restoring snapshot authority."
        Invoke-StackDeployment "snapshot"
        Set-StagingServiceCount ([int]$promotionOriginalDesiredCount) | Out-Null
        $cutoverQuiesced = $false
        $applicationUrl = Wait-ApplicationReady
        $authorityModeAfter = Get-StackOutput "AuthorityMode"
        $rollbackTaskDefinitionArn = Get-StackOutput "TaskDefinitionArn"
        if ($authorityModeAfter -ne "snapshot") {
          throw "Rollback did not restore AuthorityMode=snapshot."
        }
        Invoke-StagingAttestation $EvidencePath
        $rollbackResult = "passed"
      } catch {
        $rollbackResult = "failed: $($_.Exception.Message)"
      }
    } elseif ($cutoverQuiesced) {
      try {
        Write-Warning "Pre-cutover gate failed; restoring the snapshot-mode staging service."
        Set-StagingServiceCount ([int]$promotionOriginalDesiredCount) | Out-Null
        $cutoverQuiesced = $false
        $applicationUrl = Wait-ApplicationReady
        $authorityModeAfter = Get-StackOutput "AuthorityMode"
        if ($authorityModeAfter -ne "snapshot") {
          throw "Pre-cutover recovery did not retain AuthorityMode=snapshot."
        }
        Invoke-StagingAttestation $EvidencePath
        $rollbackResult = "passed"
      } catch {
        $rollbackResult = "failed: $($_.Exception.Message)"
      }
    }
    try { Write-PromotionEvidence "failed" $promotionError.Exception.Message } catch { Write-Warning $_.Exception.Message }
    if ($rollbackResult -like "failed:*") {
      throw "Normalized promotion failed and automatic authority rollback also failed. Promotion error: $($promotionError.Exception.Message). $rollbackResult"
    }
    throw $promotionError
  }
}

aws cloudformation describe-stacks `
  --stack-name $StackName `
  --region $Region `
  --query "Stacks[0].Outputs" `
  --output table
