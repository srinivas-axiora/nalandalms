param(
  [string]$Region = "ap-south-1",
  [string]$StackName = "nalanda-staging",
  [Parameter(Mandatory = $true)][ValidatePattern('^[0-9]{12}$')][string]$ExpectedAccountId,
  [Parameter(Mandatory = $true)][ValidatePattern('^[0-9a-f]{40}$')][string]$ExpectedSourceRevision,
  [Parameter(Mandatory = $true)][switch]$ConfirmFailover,
  [ValidateRange(60, 1200)][int]$RecoveryTimeoutSeconds = 600,
  [ValidateRange(30, 300)][int]$ArmTimeoutSeconds = 180,
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

function Get-ReplicationGroup {
  $result = Invoke-AwsJson @(
    "elasticache", "describe-replication-groups",
    "--replication-group-id", $replicationGroupId,
    "--region", $Region, "--output", "json"
  )
  return @($result.ReplicationGroups)[0]
}

function Get-PrimaryMember($ReplicationGroup) {
  $nodeGroup = @($ReplicationGroup.NodeGroups)[0]
  return @($nodeGroup.NodeGroupMembers | Where-Object { $_.CurrentRole -eq "primary" })[0]
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
      -TimeoutSec 10 -UseBasicParsing -Headers @{ "Cache-Control" = "no-cache" }
    return [int]$response.StatusCode
  } catch {
    if ($null -ne $_.Exception.Response) {
      return [int]$_.Exception.Response.StatusCode
    }
    return 0
  }
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
    replicationGroupId = $replicationGroupId
    nodeGroupId = $nodeGroupId
    primaryBefore = $primaryBefore
    primaryAfter = $primaryAfter
    verifierTaskArn = $verifierTaskArn
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
  Write-Host "Redis failover evidence: $resolvedPath"
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
$replicationGroupId = Get-RequiredOutput $outputs "CacheReplicationGroupId"
$applicationUrl = (Get-RequiredOutput $outputs "ApplicationUrl").TrimEnd("/")
$logGroupName = Get-RequiredOutput $outputs "ApplicationLogGroupName"
$subnets = Get-RequiredOutput $outputs "ApplicationSubnetIds"
$securityGroup = Get-RequiredOutput $outputs "ApplicationSecurityGroupId"

Assert-Condition ($environmentName -match '(?i)(staging|nonprod|test|dev)' -and $environmentName -notmatch '(?i)(^|-)prod(uction)?($|-)') `
  "Redis failover is restricted to an explicitly non-production environment."
Assert-Condition ($sourceRevision -match '^[0-9a-f]{40}$') "Stack source revision is invalid."
Assert-Condition ($sourceRevision -eq $ExpectedSourceRevision) `
  "The stack source revision does not match ExpectedSourceRevision."

$taskDefinitionEnvelope = Invoke-AwsJson @(
  "ecs", "describe-task-definition", "--task-definition", $taskDefinition,
  "--region", $Region, "--output", "json"
)
$taskContainer = @($taskDefinitionEnvelope.TaskDefinition.ContainerDefinitions | Where-Object { $_.Name -eq "nalanda" })[0]
Assert-Condition ($null -ne $taskContainer) "The Nalanda task container is missing."
Assert-Condition ([string]$taskContainer.Image -match '@sha256:[0-9a-f]{64}$') `
  "The Redis failover drill requires an immutable digest-pinned image."
$revisionLabel = $null
if ($null -ne $taskContainer.DockerLabels) {
  $revisionLabel = $taskContainer.DockerLabels.PSObject.Properties["org.opencontainers.image.revision"]
}
Assert-Condition ($null -ne $revisionLabel -and [string]$revisionLabel.Value -eq $ExpectedSourceRevision) `
  "The task definition source-revision label does not match ExpectedSourceRevision."

$replicationGroup = Get-ReplicationGroup
Assert-Condition ([string]$replicationGroup.Status -eq "available") "The cache replication group is not available."
Assert-Condition ([string]$replicationGroup.AutomaticFailover -eq "enabled") "Automatic failover is not enabled."
Assert-Condition ([string]$replicationGroup.MultiAZ -eq "enabled") "Cache Multi-AZ is not enabled."
Assert-Condition (-not [bool]$replicationGroup.ClusterEnabled) "This drill supports one non-clustered node group only."
Assert-Condition (@($replicationGroup.NodeGroups).Count -eq 1) "Expected exactly one cache node group."
$nodeGroup = @($replicationGroup.NodeGroups)[0]
$nodeGroupId = [string]$nodeGroup.NodeGroupId
Assert-Condition (@($nodeGroup.NodeGroupMembers).Count -ge 2) "Failover requires a primary and at least one replica."
$primaryMember = Get-PrimaryMember $replicationGroup
Assert-Condition ($null -ne $primaryMember) "The current cache primary is unavailable."
$primaryBefore = [string]$primaryMember.CacheClusterId

$memberIds = @($nodeGroup.NodeGroupMembers | ForEach-Object { [string]$_.CacheClusterId })
$cacheDescriptions = @()
foreach ($memberId in $memberIds) {
  $described = Invoke-AwsJson @(
    "elasticache", "describe-cache-clusters", "--cache-cluster-id", $memberId,
    "--region", $Region, "--output", "json"
  )
  $cacheDescriptions += @($described.CacheClusters)[0]
}
$availabilityZones = @($cacheDescriptions | ForEach-Object { [string]$_.PreferredAvailabilityZone } | Sort-Object -Unique)
Assert-Condition ($availabilityZones.Count -ge 2) "Cache members are not distributed across Availability Zones."

$service = Invoke-AwsJson @(
  "ecs", "describe-services", "--cluster", $cluster, "--services", $serviceName,
  "--region", $Region, "--output", "json"
)
$serviceState = @($service.Services)[0]
Assert-Condition ([int]$serviceState.RunningCount -eq [int]$serviceState.DesiredCount) "The ECS service is not stable before failover."
Assert-Condition ([string]$serviceState.TaskDefinition -eq $taskDefinition) `
  "The ECS service is not running the stack-owned task definition."
$serviceTaskArnsBefore = @(Get-ServiceTaskArns)
Assert-Condition ($serviceTaskArnsBefore.Count -eq 1) "The staging failover drill requires exactly one running service task."

$network = "awsvpcConfiguration={subnets=[$subnets],securityGroups=[$securityGroup],assignPublicIp=DISABLED}"
$runToken = ([guid]::NewGuid().ToString("N")).Substring(0, 24).ToUpperInvariant()
$runId = "RF-$runToken"
if (-not $EvidencePath) { $EvidencePath = "artifacts/aws/$StackName-$($runToken.ToLowerInvariant())-redis-failover.json" }
$overrides = (@{
  containerOverrides = @(@{
    name = "nalanda"
    command = @("node", "backend/src/cache/verify-redis-recovery.mjs", $runId, [string]$RecoveryTimeoutSeconds)
  })
} | ConvertTo-Json -Depth 7 -Compress)

$verifierTaskArn = ""
$primaryAfter = ""
$serviceTaskArnsAfter = @()
$readinessObservations = @()
$drillError = $null

try {
  $run = Invoke-AwsJson @(
    "ecs", "run-task", "--cluster", $cluster, "--task-definition", $taskDefinition,
    "--launch-type", "FARGATE", "--count", "1", "--network-configuration", $network,
    "--overrides", $overrides, "--region", $Region, "--output", "json"
  )
  Assert-Condition (@($run.Failures).Count -eq 0 -and @($run.Tasks).Count -eq 1) `
    "Unable to launch the Redis recovery verifier task."
  $verifierTaskArn = [string]$run.Tasks[0].TaskArn
  & aws ecs wait tasks-running --cluster $cluster --tasks $verifierTaskArn --region $Region
  if ($LASTEXITCODE -ne 0) { throw "Timed out waiting for the Redis recovery verifier task to run." }

  $taskId = ($verifierTaskArn -split "/")[-1]
  $logStream = "app/nalanda/$taskId"
  Assert-Condition (Wait-LogMarker $logStream "REDIS_RECOVERY_ARMED:$runId" $ArmTimeoutSeconds) `
    "The Redis recovery verifier did not arm before the timeout."

  Write-Host "Triggering ElastiCache test failover for $replicationGroupId/$nodeGroupId..."
  Invoke-AwsJson @(
    "elasticache", "test-failover", "--replication-group-id", $replicationGroupId,
    "--node-group-id", $nodeGroupId, "--region", $Region, "--output", "json"
  ) | Out-Null

  $recoveryDeadline = (Get-Date).ToUniversalTime().AddSeconds($RecoveryTimeoutSeconds)
  $verifierStopped = $false
  while ((Get-Date).ToUniversalTime() -lt $recoveryDeadline) {
    $readinessObservations += [ordered]@{
      capturedAt = (Get-Date).ToUniversalTime().ToString("o")
      statusCode = Get-ReadinessStatus
    }
    $task = Invoke-AwsJson @(
      "ecs", "describe-tasks", "--cluster", $cluster, "--tasks", $verifierTaskArn,
      "--region", $Region, "--output", "json"
    )
    if ([string]$task.Tasks[0].LastStatus -eq "STOPPED") {
      $verifierStopped = $true
      break
    }
    Start-Sleep -Seconds 2
  }
  Assert-Condition $verifierStopped "Redis recovery verifier exceeded the recovery-time objective."

  $task = Invoke-AwsJson @(
    "ecs", "describe-tasks", "--cluster", $cluster, "--tasks", $verifierTaskArn,
    "--region", $Region, "--output", "json"
  )
  $container = @($task.Tasks[0].Containers | Where-Object { $_.Name -eq "nalanda" })[0]
  $exitCode = if ($null -eq $container.ExitCode) { -1 } else { [int]$container.ExitCode }
  Assert-Condition ($exitCode -eq 0) "Redis recovery verifier failed (exit $exitCode): $($container.Reason)"
  Assert-Condition (Wait-LogMarker $logStream "REDIS_RECOVERY_RECOVERED:$runId" 60) `
    "The verifier recovery marker did not reach CloudWatch Logs."
  Assert-Condition (Test-LogMarker $logStream "REDIS_RECOVERY_OUTAGE:$runId") "The verifier did not observe a Redis outage."
  Assert-Condition (Test-LogMarker $logStream "REDIS_RECOVERY_FAIL_CLOSED:$runId") "Redis request controls did not prove fail-closed behavior."
  Assert-Condition (@($readinessObservations | Where-Object { $_.statusCode -eq 503 }).Count -gt 0) `
    "Public readiness never reported HTTP 503 during cache failover."

  do {
    $replicationGroup = Get-ReplicationGroup
    if ([string]$replicationGroup.Status -eq "available") { break }
    Start-Sleep -Seconds 5
  } while ((Get-Date).ToUniversalTime() -lt $recoveryDeadline)
  Assert-Condition ([string]$replicationGroup.Status -eq "available") "Cache replication group did not return to available."
  $primaryAfter = [string](Get-PrimaryMember $replicationGroup).CacheClusterId
  Assert-Condition ($primaryAfter -and $primaryAfter -ne $primaryBefore) "The cache primary did not change after test failover."

  & aws ecs wait services-stable --cluster $cluster --services $serviceName --region $Region
  if ($LASTEXITCODE -ne 0) { throw "The ECS service did not stabilize after Redis failover." }
  $serviceTaskArnsAfter = @(Get-ServiceTaskArns)
  Assert-Condition (($serviceTaskArnsBefore -join ",") -eq ($serviceTaskArnsAfter -join ",")) `
    "The ECS service task was replaced instead of reconnecting in place."
  Assert-Condition ((Get-ReadinessStatus) -eq 200) "Application readiness did not recover to HTTP 200."

  Write-Evidence "passed"
  Write-Host "Redis Multi-AZ failover and in-place application recovery passed."
} catch {
  $drillError = $_
  if ($verifierTaskArn) {
    & aws ecs stop-task --cluster $cluster --task $verifierTaskArn --reason "Redis failover drill cleanup" `
      --region $Region --output json 2>$null | Out-Null
  }
  try { Write-Evidence "failed" $drillError.Exception.Message } catch { Write-Warning $_.Exception.Message }
  throw $drillError
}
