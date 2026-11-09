param(
  [string]$Region = "ap-south-1",
  [string]$StackName = "nalanda-staging",
  [Parameter(Mandatory = $true)][string]$RollbackTaskDefinitionArn,
  [Parameter(Mandatory = $true)][string]$ExpectedRollbackSourceRevision,
  [Parameter(Mandatory = $true)][string]$ExpectedRollbackContainerImage,
  [ValidateRange(0, 900)][int]$ObservationSeconds = 60,
  [string]$EvidencePath = ""
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Invoke-AwsJson([string[]]$Arguments) {
  $raw = & aws @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "AWS CLI command failed: aws $($Arguments -join ' ')"
  }
  return ($raw | ConvertFrom-Json)
}

function Assert-Condition([bool]$Condition, [string]$Message) {
  if (-not $Condition) { throw $Message }
}

function Get-StackOutputs {
  $stacks = Invoke-AwsJson @(
    "cloudformation", "describe-stacks", "--stack-name", $StackName,
    "--region", $Region, "--output", "json"
  )
  $outputs = @{}
  foreach ($output in @($stacks.Stacks[0].Outputs)) {
    $outputs[[string]$output.OutputKey] = [string]$output.OutputValue
  }
  return $outputs
}

function Get-RequiredOutput([hashtable]$Outputs, [string]$Key) {
  if (-not $Outputs.ContainsKey($Key) -or -not $Outputs[$Key]) {
    throw "CloudFormation output '$Key' is unavailable."
  }
  return [string]$Outputs[$Key]
}

function Convert-ToComparableJson($Value) {
  return ($Value | ConvertTo-Json -Depth 40 -Compress)
}

function Get-NormalizedContainerJson($Container) {
  $copy = $Container | ConvertTo-Json -Depth 40 | ConvertFrom-Json
  $copy.image = "<release-image>"
  if ($null -ne $copy.dockerLabels) {
    $revisionLabel = $copy.dockerLabels.PSObject.Properties["org.opencontainers.image.revision"]
    if ($null -ne $revisionLabel) { $revisionLabel.Value = "<source-revision>" }
  }
  return (Convert-ToComparableJson $copy)
}

function Get-NalandaContainer($TaskDefinition, [string]$Description) {
  $containers = @($TaskDefinition.containerDefinitions | Where-Object { $_.name -eq "nalanda" })
  Assert-Condition ($containers.Count -eq 1) "$Description must contain exactly one nalanda container."
  return $containers[0]
}

function Assert-EquivalentTaskConfiguration($Current, $Rollback) {
  Assert-Condition ([string]$Rollback.family -eq [string]$Current.family) `
    "Rollback task definition must use the current task family."
  Assert-Condition ([int]$Rollback.revision -lt [int]$Current.revision) `
    "Rollback task definition must be an older revision of the current family."

  $scalarFields = @(
    "taskRoleArn", "executionRoleArn", "networkMode", "cpu", "memory", "pidMode", "ipcMode"
  )
  foreach ($field in $scalarFields) {
    Assert-Condition ([string]$Rollback.$field -eq [string]$Current.$field) `
      "Rollback task definition differs in protected field '$field'."
  }
  $structuredFields = @(
    "requiresCompatibilities", "runtimePlatform", "volumes", "placementConstraints",
    "proxyConfiguration", "ephemeralStorage", "inferenceAccelerators"
  )
  foreach ($field in $structuredFields) {
    Assert-Condition ((Convert-ToComparableJson $Rollback.$field) -eq (Convert-ToComparableJson $Current.$field)) `
      "Rollback task definition differs in protected field '$field'."
  }

  $currentContainers = @($Current.containerDefinitions | Sort-Object name)
  $rollbackContainers = @($Rollback.containerDefinitions | Sort-Object name)
  Assert-Condition ($rollbackContainers.Count -eq $currentContainers.Count) `
    "Rollback task definition changes the container count."
  for ($index = 0; $index -lt $currentContainers.Count; $index++) {
    Assert-Condition ([string]$rollbackContainers[$index].name -eq [string]$currentContainers[$index].name) `
      "Rollback task definition changes container identity."
    Assert-Condition ((Get-NormalizedContainerJson $rollbackContainers[$index]) `
      -eq (Get-NormalizedContainerJson $currentContainers[$index])) `
      "Rollback task definition changes protected container configuration."
  }
}

function Get-RevisionLabel($Container) {
  if ($null -eq $Container.dockerLabels) { return "" }
  $property = $Container.dockerLabels.PSObject.Properties["org.opencontainers.image.revision"]
  if ($null -eq $property) { return "" }
  return [string]$property.Value
}

function Assert-ScannedImage([string]$Image, [string]$Description) {
  $pattern = '^(?<account>[0-9]{12})\.dkr\.ecr\.(?<region>[a-z0-9-]+)\.amazonaws\.com/(?<repository>[a-z0-9][a-z0-9._/-]{1,255})@(?<digest>sha256:[0-9a-f]{64})$'
  Assert-Condition ($Image -match $pattern) "$Description must use an immutable ECR sha256 digest URI."
  Assert-Condition ($Matches.account -eq [string]$identity.Account -and $Matches.region -eq $Region) `
    "$Description image must belong to the authenticated account and region."
  $repository = [string]$Matches.repository
  $digest = [string]$Matches.digest
  $scan = Invoke-AwsJson @(
    "ecr", "describe-image-scan-findings", "--repository-name", $repository,
    "--image-id", "imageDigest=$digest", "--region", $Region, "--output", "json"
  )
  Assert-Condition ([string]$scan.imageScanStatus.status -eq "COMPLETE") `
    "$Description image scan is not complete."
  $severity = $scan.imageScanFindings.findingSeverityCounts
  $critical = if ($null -eq $severity.CRITICAL) { 0 } else { [int]$severity.CRITICAL }
  $high = if ($null -eq $severity.HIGH) { 0 } else { [int]$severity.HIGH }
  Assert-Condition ($critical -eq 0 -and $high -eq 0) `
    "$Description image has $critical critical and $high high findings."
  return [ordered]@{ repository = $repository; digest = $digest; critical = $critical; high = $high }
}

function Get-Service {
  $result = Invoke-AwsJson @(
    "ecs", "describe-services", "--cluster", $cluster, "--services", $serviceName,
    "--region", $Region, "--output", "json"
  )
  Assert-Condition (@($result.failures).Count -eq 0 -and @($result.services).Count -eq 1) `
    "Unable to resolve the ECS service."
  return $result.services[0]
}

function Wait-ServiceStable {
  & aws ecs wait services-stable --cluster $cluster --services $serviceName --region $Region
  if ($LASTEXITCODE -ne 0) { throw "Timed out waiting for ECS service stability." }
}

function Assert-ServiceState([string]$ExpectedTaskDefinitionArn) {
  $service = Get-Service
  Assert-Condition ([string]$service.status -eq "ACTIVE") "The ECS service is not active."
  Assert-Condition ([string]$service.deploymentController.type -eq "ECS") `
    "The ECS service does not use the rolling ECS deployment controller."
  Assert-Condition ([bool]$service.deploymentConfiguration.deploymentCircuitBreaker.enable `
    -and [bool]$service.deploymentConfiguration.deploymentCircuitBreaker.rollback) `
    "The ECS deployment circuit breaker and automatic rollback must remain enabled."
  Assert-Condition ([string]$service.taskDefinition -eq $ExpectedTaskDefinitionArn) `
    "The ECS service task definition does not match the expected release."
  Assert-Condition ([int]$service.desiredCount -eq $initialDesiredCount `
    -and [int]$service.runningCount -eq $initialDesiredCount `
    -and [int]$service.pendingCount -eq 0) `
    "The ECS service has not returned to its stable task count."
  $primary = @($service.deployments | Where-Object { $_.status -eq "PRIMARY" })[0]
  Assert-Condition ($null -ne $primary `
    -and [string]$primary.taskDefinition -eq $ExpectedTaskDefinitionArn `
    -and [string]$primary.rolloutState -eq "COMPLETED") `
    "The ECS primary deployment has not completed on the expected release."

  $listed = Invoke-AwsJson @(
    "ecs", "list-tasks", "--cluster", $cluster, "--service-name", $serviceName,
    "--desired-status", "RUNNING", "--region", $Region, "--output", "json"
  )
  $taskArns = @($listed.taskArns | ForEach-Object { [string]$_ })
  Assert-Condition ($taskArns.Count -eq $initialDesiredCount) `
    "The ECS running-task count does not match desired count."
  $describeArguments = @("ecs", "describe-tasks", "--cluster", $cluster, "--tasks")
  $describeArguments += $taskArns
  $describeArguments += @("--region", $Region, "--output", "json")
  $tasks = Invoke-AwsJson $describeArguments
  Assert-Condition (@($tasks.tasks | Where-Object { $_.taskDefinitionArn -ne $ExpectedTaskDefinitionArn }).Count -eq 0) `
    "One or more running tasks use an unexpected task definition."
  return $taskArns
}

function Assert-ApplicationReady {
  $ready = Invoke-RestMethod "$applicationUrl/api/ready" -TimeoutSec 20
  Assert-Condition ([bool]$ready.ok) "Application readiness probe failed."
  $health = Invoke-RestMethod "$applicationUrl/api/health" -TimeoutSec 20
  Assert-Condition ([bool]$health.ok -and [bool]$health.ready) "Application liveness/startup probe failed."
}

function Update-ServiceTaskDefinition([string]$TaskDefinitionArn) {
  & aws ecs update-service --cluster $cluster --service $serviceName `
    --task-definition $TaskDefinitionArn --region $Region --output json | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Unable to update ECS service to $TaskDefinitionArn" }
  Wait-ServiceStable
}

function Write-Evidence([string]$Result, [string]$FailureMessage) {
  $evidence = [ordered]@{
    schemaVersion = 1
    capturedAt = (Get-Date).ToUniversalTime().ToString("o")
    result = $Result
    failure = $FailureMessage
    region = $Region
    accountId = [string]$identity.Account
    stackName = $StackName
    cluster = $cluster
    serviceName = $serviceName
    current = [ordered]@{
      taskDefinitionArn = $currentTaskDefinitionArn
      sourceRevision = $currentSourceRevision
      containerImage = $currentContainerImage
      scan = $currentScan
      initialRunningTaskArns = $initialTaskArns
    }
    rollback = [ordered]@{
      taskDefinitionArn = $RollbackTaskDefinitionArn
      sourceRevision = $ExpectedRollbackSourceRevision
      containerImage = $ExpectedRollbackContainerImage
      scan = $rollbackScan
      runningTaskArns = $rollbackTaskArns
      observedReadinessChecks = $observedReadinessChecks
    }
    restoration = [ordered]@{
      attempted = $mutationStarted
      completed = $restorationCompleted
      runningTaskArns = $restoredTaskArns
    }
  }
  $resolvedPath = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($EvidencePath)
  $directory = Split-Path -Parent $resolvedPath
  if ($directory) { New-Item -ItemType Directory -Force -Path $directory | Out-Null }
  $evidence | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $resolvedPath -Encoding utf8
  Write-Host "ECS rollback evidence: $resolvedPath"
}

if ($ExpectedRollbackSourceRevision -notmatch '^[0-9a-f]{40}$') {
  throw "ExpectedRollbackSourceRevision must be a full 40-character Git revision."
}
$identity = Invoke-AwsJson @("sts", "get-caller-identity", "--region", $Region, "--output", "json")
$outputs = Get-StackOutputs
$cluster = Get-RequiredOutput $outputs "ClusterName"
$serviceName = Get-RequiredOutput $outputs "ServiceName"
$applicationUrl = Get-RequiredOutput $outputs "ApplicationUrl"
$currentTaskDefinitionArn = Get-RequiredOutput $outputs "TaskDefinitionArn"
$currentSourceRevision = Get-RequiredOutput $outputs "SourceRevision"
Assert-Condition ($RollbackTaskDefinitionArn -ne $currentTaskDefinitionArn) `
  "Rollback target must differ from the current stack task definition."
$arnPattern = '^arn:(aws|aws-us-gov):ecs:(?<region>[a-z0-9-]+):(?<account>[0-9]{12}):task-definition/(?<family>[A-Za-z0-9_-]+):(?<revision>[0-9]+)$'
Assert-Condition ($RollbackTaskDefinitionArn -match $arnPattern) `
  "RollbackTaskDefinitionArn must be a full revision-qualified ECS task definition ARN."
Assert-Condition ($Matches.region -eq $Region -and $Matches.account -eq [string]$identity.Account) `
  "Rollback task definition must belong to the authenticated account and region."

$currentEnvelope = Invoke-AwsJson @(
  "ecs", "describe-task-definition", "--task-definition", $currentTaskDefinitionArn,
  "--region", $Region, "--output", "json"
)
$rollbackEnvelope = Invoke-AwsJson @(
  "ecs", "describe-task-definition", "--task-definition", $RollbackTaskDefinitionArn,
  "--region", $Region, "--output", "json"
)
$currentDefinition = $currentEnvelope.taskDefinition
$rollbackDefinition = $rollbackEnvelope.taskDefinition
Assert-Condition ([string]$currentDefinition.status -eq "ACTIVE" -and [string]$rollbackDefinition.status -eq "ACTIVE") `
  "Current and rollback task definitions must both be ACTIVE."
Assert-EquivalentTaskConfiguration $currentDefinition $rollbackDefinition

$currentContainer = Get-NalandaContainer $currentDefinition "Current task definition"
$rollbackContainer = Get-NalandaContainer $rollbackDefinition "Rollback task definition"
$currentContainerImage = [string]$currentContainer.image
Assert-Condition ([string]$rollbackContainer.image -eq $ExpectedRollbackContainerImage) `
  "Rollback container image does not match the explicitly approved digest URI."
Assert-Condition ($ExpectedRollbackContainerImage -ne $currentContainerImage) `
  "Rollback container image must differ from the current release image."
Assert-Condition ($ExpectedRollbackSourceRevision -ne $currentSourceRevision) `
  "Rollback source revision must differ from the current stack revision."
Assert-Condition ((Get-RevisionLabel $currentContainer) -eq $currentSourceRevision) `
  "Current task definition revision label does not match the stack source revision."
Assert-Condition ((Get-RevisionLabel $rollbackContainer) -eq $ExpectedRollbackSourceRevision) `
  "Rollback task definition revision label does not match the explicitly approved source revision."
$currentScan = Assert-ScannedImage $currentContainerImage "Current"
$rollbackScan = Assert-ScannedImage $ExpectedRollbackContainerImage "Rollback"

$initialService = Get-Service
$initialDesiredCount = [int]$initialService.desiredCount
Assert-Condition ($initialDesiredCount -gt 0) "The ECS service desired count must be positive."
Wait-ServiceStable
$initialTaskArns = Assert-ServiceState $currentTaskDefinitionArn
Assert-ApplicationReady

if (-not $EvidencePath) {
  $EvidencePath = "artifacts/aws/$StackName-$($currentSourceRevision.Substring(0, 12))-ecs-rollback.json"
}
$mutationStarted = $false
$restorationCompleted = $false
$rollbackTaskArns = @()
$restoredTaskArns = @()
$observedReadinessChecks = 0
$drillError = $null
$restorationError = $null

try {
  Write-Host "Deploying approved rollback task definition: $RollbackTaskDefinitionArn"
  $mutationStarted = $true
  Update-ServiceTaskDefinition $RollbackTaskDefinitionArn
  $rollbackTaskArns = @(Assert-ServiceState $RollbackTaskDefinitionArn)
  Assert-ApplicationReady
  $observedReadinessChecks++

  $deadline = (Get-Date).ToUniversalTime().AddSeconds($ObservationSeconds)
  while ((Get-Date).ToUniversalTime() -lt $deadline) {
    Start-Sleep -Seconds ([math]::Min(15, [math]::Max(1, $ObservationSeconds)))
    $rollbackTaskArns = @(Assert-ServiceState $RollbackTaskDefinitionArn)
    Assert-ApplicationReady
    $observedReadinessChecks++
  }
} catch {
  $drillError = $_
} finally {
  if ($mutationStarted) {
    try {
      Write-Host "Restoring stack-owned task definition: $currentTaskDefinitionArn"
      $service = Get-Service
      if ([string]$service.taskDefinition -ne $currentTaskDefinitionArn) {
        Update-ServiceTaskDefinition $currentTaskDefinitionArn
      } else {
        Wait-ServiceStable
      }
      $restoredTaskArns = @(Assert-ServiceState $currentTaskDefinitionArn)
      Assert-ApplicationReady
      $restorationCompleted = $true
    } catch {
      $restorationError = $_
    }
  }
}

$failureMessage = if ($null -ne $restorationError) {
  "RESTORATION FAILED: $($restorationError.Exception.Message)"
} elseif ($null -ne $drillError) {
  $drillError.Exception.Message
} else { "" }
$result = if ($null -eq $drillError -and $null -eq $restorationError -and $restorationCompleted) { "passed" } else { "failed" }
Write-Evidence $result $failureMessage

if ($null -ne $restorationError) {
  throw "CRITICAL: ECS rollback rehearsal could not restore the stack-owned release. $($restorationError.Exception.Message)"
}
if ($null -ne $drillError) { throw $drillError }
Write-Host "ECS rollback rehearsal passed and the stack-owned release was restored."
