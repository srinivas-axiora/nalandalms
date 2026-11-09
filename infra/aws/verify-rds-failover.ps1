param(
  [string]$Region = "ap-south-1",
  [string]$StackName = "nalanda-staging",
  [Parameter(Mandatory = $true)][ValidatePattern('^[0-9]{12}$')][string]$ExpectedAccountId,
  [Parameter(Mandatory = $true)][ValidatePattern('^[0-9a-f]{40}$')][string]$ExpectedSourceRevision,
  [Parameter(Mandatory = $true)][switch]$ConfirmFailover,
  [ValidateRange(120, 1800)][int]$RecoveryTimeoutSeconds = 900,
  [ValidateRange(30, 300)][int]$ArmTimeoutSeconds = 180,
  [string]$EvidencePath = ""
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Invoke-AwsJson([string[]]$Arguments) {
  $raw = & aws @Arguments
  if ($LASTEXITCODE -ne 0) { throw "AWS CLI command failed: aws $($Arguments -join ' ')" }
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

function Get-Database {
  $result = Invoke-AwsJson @(
    "rds", "describe-db-instances", "--db-instance-identifier", $databaseIdentifier,
    "--region", $Region, "--output", "json"
  )
  return @($result.DBInstances)[0]
}

function Wait-DatabaseAvailable([int]$TimeoutSeconds) {
  $deadline = (Get-Date).ToUniversalTime().AddSeconds($TimeoutSeconds)
  do {
    try {
      $candidate = Get-Database
      if ([string]$candidate.DBInstanceStatus -eq "available") { return $candidate }
    } catch { Write-Verbose $_.Exception.Message }
    Start-Sleep -Seconds 5
  } while ((Get-Date).ToUniversalTime() -lt $deadline)
  return $null
}

function Get-ServiceTaskArns {
  $listed = Invoke-AwsJson @(
    "ecs", "list-tasks", "--cluster", $cluster, "--service-name", $serviceName,
    "--desired-status", "RUNNING", "--region", $Region, "--output", "json"
  )
  return @($listed.TaskArns | ForEach-Object { [string]$_ } | Sort-Object)
}

function Test-LogMarker([string]$LogStream, [string]$ExpectedMarker) {
  $raw = & aws logs get-log-events --log-group-name $logGroupName `
    --log-stream-name $LogStream --start-from-head --region $Region --output json 2>$null
  if ($LASTEXITCODE -ne 0) { return $false }
  $events = ($raw | ConvertFrom-Json).Events
  return @($events | Where-Object { [string]$_.Message -like "*$ExpectedMarker*" }).Count -gt 0
}

function Wait-LogMarker([string]$LogStream, [string]$ExpectedMarker, [int]$TimeoutSeconds) {
  $deadline = (Get-Date).ToUniversalTime().AddSeconds($TimeoutSeconds)
  do {
    if (Test-LogMarker $LogStream $ExpectedMarker) { return $true }
    Start-Sleep -Seconds 2
  } while ((Get-Date).ToUniversalTime() -lt $deadline)
  return $false
}

function Get-ReadinessStatus {
  try {
    $response = Invoke-WebRequest -Uri "$applicationUrl/api/ready" -Method Get `
      -TimeoutSec 20 -UseBasicParsing -Headers @{ "Cache-Control" = "no-cache" }
    return [int]$response.StatusCode
  } catch {
    if ($null -ne $_.Exception.Response) { return [int]$_.Exception.Response.StatusCode }
    return 0
  }
}

function Start-VerifierTask([string[]]$Command) {
  $overrides = (@{
    containerOverrides = @(@{ name = "nalanda"; command = $Command })
  } | ConvertTo-Json -Depth 7 -Compress)
  $run = Invoke-AwsJson @(
    "ecs", "run-task", "--cluster", $cluster, "--task-definition", $taskDefinition,
    "--launch-type", "FARGATE", "--count", "1", "--network-configuration", $network,
    "--overrides", $overrides, "--region", $Region, "--output", "json"
  )
  Assert-Condition (@($run.Failures).Count -eq 0 -and @($run.Tasks).Count -eq 1) `
    "Unable to launch the RDS failover verifier task."
  return [string]$run.Tasks[0].TaskArn
}

function Get-VerifierTask([string]$TaskArn) {
  $result = Invoke-AwsJson @(
    "ecs", "describe-tasks", "--cluster", $cluster, "--tasks", $TaskArn,
    "--region", $Region, "--output", "json"
  )
  return @($result.Tasks)[0]
}

function Assert-VerifierSucceeded([string]$TaskArn) {
  $task = Get-VerifierTask $TaskArn
  $container = @($task.Containers | Where-Object { $_.Name -eq "nalanda" })[0]
  $exitCode = if ($null -eq $container.ExitCode) { -1 } else { [int]$container.ExitCode }
  Assert-Condition ($exitCode -eq 0) "RDS failover verifier failed (exit $exitCode): $($container.Reason)"
}

function Invoke-MarkerCleanup {
  $cleanupArn = Start-VerifierTask @(
    "node", "backend/src/db/verify-rds-failover.mjs", "cleanup", $runId
  )
  & aws ecs wait tasks-stopped --cluster $cluster --tasks $cleanupArn --region $Region
  if ($LASTEXITCODE -ne 0) { throw "Timed out waiting for RDS marker cleanup task $cleanupArn" }
  Assert-VerifierSucceeded $cleanupArn
  return $cleanupArn
}

function Write-Evidence([string]$Result, [string]$ErrorMessage = "") {
  $evidence = [ordered]@{
    schemaVersion = 1
    capturedAt = (Get-Date).ToUniversalTime().ToString("o")
    result = $Result
    error = $ErrorMessage
    accountId = [string]$identity.Account
    region = $Region
    stackName = $StackName
    environmentName = $environmentName
    sourceRevision = $sourceRevision
    taskDefinitionArn = $taskDefinition
    databaseIdentifier = $databaseIdentifier
    databaseEndpoint = $databaseEndpoint
    availabilityZoneBefore = $availabilityZoneBefore
    availabilityZoneAfter = $availabilityZoneAfter
    observerTaskArn = $observerTaskArn
    cleanupTaskArn = $cleanupTaskArn
    markerCleaned = $markerCleaned
    serviceTaskArnsBefore = $serviceTaskArnsBefore
    serviceTaskArnsAfter = $serviceTaskArnsAfter
    observedReadinessChecks = $readinessObservations
    observedReadinessFailure = @($readinessObservations | Where-Object { $_.statusCode -eq 503 }).Count -gt 0
    recoveryTimeoutSeconds = $RecoveryTimeoutSeconds
  }
  $resolvedPath = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($EvidencePath)
  $directory = Split-Path -Parent $resolvedPath
  if ($directory) { New-Item -ItemType Directory -Force -Path $directory | Out-Null }
  $evidence | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $resolvedPath -Encoding utf8
  Write-Host "RDS failover evidence: $resolvedPath"
}

Assert-Condition $ConfirmFailover.IsPresent "The failover drill requires the explicit -ConfirmFailover switch."
$identity = Invoke-AwsJson @("sts", "get-caller-identity", "--region", $Region, "--output", "json")
Assert-Condition ([string]$identity.Account -eq $ExpectedAccountId) `
  "The authenticated AWS account does not match ExpectedAccountId."

$outputs = Get-StackOutputs
$environmentName = Get-RequiredOutput $outputs "EnvironmentName"
$cluster = Get-RequiredOutput $outputs "ClusterName"
$serviceName = Get-RequiredOutput $outputs "ServiceName"
$taskDefinition = Get-RequiredOutput $outputs "TaskDefinitionArn"
$sourceRevision = Get-RequiredOutput $outputs "SourceRevision"
$databaseIdentifier = Get-RequiredOutput $outputs "DatabaseIdentifier"
$applicationUrl = (Get-RequiredOutput $outputs "ApplicationUrl").TrimEnd("/")
$logGroupName = Get-RequiredOutput $outputs "ApplicationLogGroupName"
$subnets = Get-RequiredOutput $outputs "ApplicationSubnetIds"
$securityGroup = Get-RequiredOutput $outputs "ApplicationSecurityGroupId"

Assert-Condition ($environmentName -match '(?i)(staging|nonprod|test|dev)' -and $environmentName -notmatch '(?i)(^|-)prod(uction)?($|-)') `
  "RDS failover is restricted to an explicitly non-production environment."
Assert-Condition ($sourceRevision -eq $ExpectedSourceRevision) `
  "The stack source revision does not match ExpectedSourceRevision."

$taskDefinitionEnvelope = Invoke-AwsJson @(
  "ecs", "describe-task-definition", "--task-definition", $taskDefinition,
  "--region", $Region, "--output", "json"
)
$taskContainer = @($taskDefinitionEnvelope.TaskDefinition.ContainerDefinitions | Where-Object { $_.Name -eq "nalanda" })[0]
Assert-Condition ($null -ne $taskContainer) "The Nalanda task container is missing."
Assert-Condition ([string]$taskContainer.Image -match '@sha256:[0-9a-f]{64}$') `
  "The RDS failover drill requires an immutable digest-pinned image."
$revisionLabel = $null
if ($null -ne $taskContainer.DockerLabels) {
  $revisionLabel = $taskContainer.DockerLabels.PSObject.Properties["org.opencontainers.image.revision"]
}
Assert-Condition ($null -ne $revisionLabel -and [string]$revisionLabel.Value -eq $ExpectedSourceRevision) `
  "The task definition source-revision label does not match ExpectedSourceRevision."
$pgHost = [string](@($taskContainer.Environment | Where-Object { $_.Name -eq "PGHOST" })[0].Value)

$database = Get-Database
Assert-Condition ([string]$database.DBInstanceStatus -eq "available") "The RDS instance is not available."
Assert-Condition ([string]$database.Engine -eq "postgres") "The failover drill requires PostgreSQL."
Assert-Condition ([bool]$database.MultiAZ) "The RDS instance is not configured for Multi-AZ failover."
Assert-Condition (-not [bool]$database.PubliclyAccessible -and [bool]$database.StorageEncrypted) `
  "The RDS instance must be private and encrypted."
$dbClusterProperty = $database.PSObject.Properties["DBClusterIdentifier"]
$dbClusterIdentifier = if ($null -eq $dbClusterProperty) { "" } else { [string]$dbClusterProperty.Value }
Assert-Condition (-not $dbClusterIdentifier) `
  "This drill supports a Multi-AZ DB instance, not a Multi-AZ DB cluster."
$pendingProperty = $database.PSObject.Properties["PendingModifiedValues"]
$pendingModificationCount = if ($null -eq $pendingProperty -or $null -eq $pendingProperty.Value) {
  0
} else {
  @($pendingProperty.Value.PSObject.Properties).Count
}
Assert-Condition ($pendingModificationCount -eq 0) `
  "The RDS instance has pending modifications."
$databaseEndpoint = [string]$database.Endpoint.Address
Assert-Condition ($databaseEndpoint -and $pgHost -eq $databaseEndpoint) `
  "The task definition PGHOST does not match the stack RDS endpoint."
$availabilityZoneBefore = [string]$database.AvailabilityZone

$serviceEnvelope = Invoke-AwsJson @(
  "ecs", "describe-services", "--cluster", $cluster, "--services", $serviceName,
  "--region", $Region, "--output", "json"
)
$service = @($serviceEnvelope.Services)[0]
Assert-Condition ([int]$service.RunningCount -eq [int]$service.DesiredCount -and [int]$service.PendingCount -eq 0) `
  "The ECS service is not stable before RDS failover."
Assert-Condition ([string]$service.TaskDefinition -eq $taskDefinition) `
  "The ECS service is not running the stack-owned task definition."
$serviceTaskArnsBefore = @(Get-ServiceTaskArns)
Assert-Condition ($serviceTaskArnsBefore.Count -eq 1) `
  "The staging failover drill requires exactly one running service task."

$network = "awsvpcConfiguration={subnets=[$subnets],securityGroups=[$securityGroup],assignPublicIp=DISABLED}"
$runToken = ([guid]::NewGuid().ToString("N")).Substring(0, 24).ToUpperInvariant()
$runId = "DF-$runToken"
if (-not $EvidencePath) { $EvidencePath = "artifacts/aws/$StackName-$($runToken.ToLowerInvariant())-rds-failover.json" }

$observerTaskArn = ""
$cleanupTaskArn = ""
$markerCleaned = $false
$availabilityZoneAfter = ""
$serviceTaskArnsAfter = @()
$readinessObservations = @()
$drillError = $null

try {
  $observerTaskArn = Start-VerifierTask @(
    "node", "backend/src/db/verify-rds-failover.mjs", "observe", $runId,
    $sourceRevision, [string]$RecoveryTimeoutSeconds
  )
  & aws ecs wait tasks-running --cluster $cluster --tasks $observerTaskArn --region $Region
  if ($LASTEXITCODE -ne 0) { throw "Timed out waiting for the RDS failover observer task to run." }
  $taskId = ($observerTaskArn -split "/")[-1]
  $logStream = "app/nalanda/$taskId"
  Assert-Condition (Wait-LogMarker $logStream "RDS_FAILOVER_ARMED:$runId" $ArmTimeoutSeconds) `
    "The RDS failover observer did not arm before the timeout."
  Assert-Condition ((Get-ReadinessStatus) -eq 200) `
    "Application readiness is not healthy before RDS failover."

  Write-Host "Triggering forced RDS Multi-AZ failover for $databaseIdentifier..."
  Invoke-AwsJson @(
    "rds", "reboot-db-instance", "--db-instance-identifier", $databaseIdentifier,
    "--force-failover", "--region", $Region, "--output", "json"
  ) | Out-Null

  $recoveryDeadline = (Get-Date).ToUniversalTime().AddSeconds($RecoveryTimeoutSeconds)
  $observerStopped = $false
  while ((Get-Date).ToUniversalTime() -lt $recoveryDeadline) {
    $readinessObservations += [ordered]@{
      capturedAt = (Get-Date).ToUniversalTime().ToString("o")
      statusCode = Get-ReadinessStatus
    }
    $task = Get-VerifierTask $observerTaskArn
    if ([string]$task.LastStatus -eq "STOPPED") { $observerStopped = $true; break }
    Start-Sleep -Seconds 2
  }
  Assert-Condition $observerStopped "RDS failover observer exceeded the recovery-time objective."
  Assert-VerifierSucceeded $observerTaskArn
  Assert-Condition (Wait-LogMarker $logStream "RDS_FAILOVER_RECOVERED:$runId" 60) `
    "The RDS recovery marker did not reach CloudWatch Logs."
  Assert-Condition (Test-LogMarker $logStream "RDS_FAILOVER_OUTAGE:$runId") `
    "The observer did not detect a database outage."
  Assert-Condition (Test-LogMarker $logStream "RDS_FAILOVER_MARKER_VERIFIED:$runId") `
    "The observer did not verify durable marker continuity."
  $markerCleaned = $true
  Assert-Condition (@($readinessObservations | Where-Object { $_.statusCode -eq 503 }).Count -gt 0) `
    "Public readiness never reported HTTP 503 during RDS failover."

  do {
    $database = Get-Database
    if ([string]$database.DBInstanceStatus -eq "available" -and [string]$database.AvailabilityZone -ne $availabilityZoneBefore) { break }
    Start-Sleep -Seconds 5
  } while ((Get-Date).ToUniversalTime() -lt $recoveryDeadline)
  Assert-Condition ([string]$database.DBInstanceStatus -eq "available") "RDS did not return to available."
  $availabilityZoneAfter = [string]$database.AvailabilityZone
  Assert-Condition ($availabilityZoneAfter -and $availabilityZoneAfter -ne $availabilityZoneBefore) `
    "The RDS writer Availability Zone did not change after forced failover."
  Assert-Condition ([string]$database.Endpoint.Address -eq $databaseEndpoint) `
    "The stable RDS endpoint changed during failover."

  & aws ecs wait services-stable --cluster $cluster --services $serviceName --region $Region
  if ($LASTEXITCODE -ne 0) { throw "The ECS service did not stabilize after RDS failover." }
  $serviceTaskArnsAfter = @(Get-ServiceTaskArns)
  Assert-Condition (($serviceTaskArnsBefore -join ",") -eq ($serviceTaskArnsAfter -join ",")) `
    "The ECS service task was replaced instead of reconnecting to RDS in place."
  Assert-Condition ((Get-ReadinessStatus) -eq 200) "Application readiness did not recover to HTTP 200."

  Write-Evidence "passed"
  Write-Host "RDS Multi-AZ failover, durability and in-place application recovery passed."
} catch {
  $drillError = $_
  if ($observerTaskArn) {
    & aws ecs stop-task --cluster $cluster --task $observerTaskArn --reason "RDS failover drill cleanup" `
      --region $Region --output json 2>$null | Out-Null
    & aws ecs wait tasks-stopped --cluster $cluster --tasks $observerTaskArn --region $Region 2>$null
  }
  try {
    $availableDatabase = Wait-DatabaseAvailable 300
    if ($null -ne $availableDatabase) {
      $cleanupTaskArn = Invoke-MarkerCleanup
      $markerCleaned = $true
    }
  } catch { Write-Warning "RDS marker cleanup failed: $($_.Exception.Message)" }
  try { Write-Evidence "failed" $drillError.Exception.Message } catch { Write-Warning $_.Exception.Message }
  throw $drillError
}
