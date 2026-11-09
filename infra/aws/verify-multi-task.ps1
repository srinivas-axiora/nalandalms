param(
  [string]$Region = "ap-south-1",
  [string]$StackName = "nalanda-staging",
  [Parameter(Mandatory = $true)][ValidatePattern('^\d{12}$')][string]$ExpectedAccountId,
  [Parameter(Mandatory = $true)][ValidatePattern('^[0-9a-f]{40}$')][string]$ExpectedSourceRevision,
  [switch]$ConfirmMultiTaskCanary,
  [string]$EvidencePath = ""
)

$ErrorActionPreference = "Stop"

function Invoke-AwsJson([string[]]$Arguments) {
  $raw = & aws @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "AWS CLI command failed: aws $($Arguments -join ' ')"
  }
  return ($raw | ConvertFrom-Json)
}

function Get-StackOutput([string]$OutputKey) {
  $stacks = Invoke-AwsJson @(
    "cloudformation", "describe-stacks",
    "--stack-name", $StackName,
    "--region", $Region,
    "--output", "json"
  )
  $output = @($stacks.Stacks[0].Outputs | Where-Object { $_.OutputKey -eq $OutputKey })[0]
  if ($null -eq $output -or -not $output.OutputValue) {
    throw "CloudFormation output '$OutputKey' is unavailable."
  }
  return [string]$output.OutputValue
}

if (-not $ConfirmMultiTaskCanary) {
  throw "The multi-task canary requires the explicit -ConfirmMultiTaskCanary switch."
}
if ($StackName -notmatch '(?i)(staging|stage|test|nonprod|dev)' -or $StackName -match '(?i)(^|[-_])prod(uction)?($|[-_])') {
  throw "The multi-task canary is restricted to an explicitly non-production stack."
}
$identity = Invoke-AwsJson @("sts", "get-caller-identity", "--region", $Region, "--output", "json")
if ([string]$identity.Account -ne $ExpectedAccountId) {
  throw "The authenticated AWS account does not match ExpectedAccountId."
}

$cluster = Get-StackOutput "ClusterName"
$taskDefinition = Get-StackOutput "TaskDefinitionArn"
$subnets = Get-StackOutput "ApplicationSubnetIds"
$securityGroup = Get-StackOutput "ApplicationSecurityGroupId"
$sourceRevision = Get-StackOutput "SourceRevision"
if ($sourceRevision -ne $ExpectedSourceRevision) {
  throw "The stack source revision does not match ExpectedSourceRevision."
}
$taskDefinitionEnvelope = Invoke-AwsJson @(
  "ecs", "describe-task-definition", "--task-definition", $taskDefinition,
  "--region", $Region, "--output", "json"
)
$taskContainer = @($taskDefinitionEnvelope.TaskDefinition.ContainerDefinitions | Where-Object { $_.Name -eq "nalanda" })[0]
if ($null -eq $taskContainer -or [string]$taskContainer.Image -notmatch '@sha256:[0-9a-f]{64}$') {
  throw "The multi-task canary requires a digest-pinned Nalanda container."
}
$taskSourceRevision = @($taskContainer.Environment | Where-Object { $_.Name -eq "SOURCE_REVISION" })[0]
if ($null -eq $taskSourceRevision -or [string]$taskSourceRevision.Value -ne $ExpectedSourceRevision) {
  throw "The task definition SOURCE_REVISION does not match ExpectedSourceRevision."
}
$containerImage = [string]$taskContainer.Image
$network = "awsvpcConfiguration={subnets=[$subnets],securityGroups=[$securityGroup],assignPublicIp=DISABLED}"
$runId = "MT-$(([guid]::NewGuid().ToString('N')).ToUpperInvariant())"
if (-not $EvidencePath) {
  $EvidencePath = "artifacts/aws/$StackName-$runId-multi-task.json"
}

function Invoke-TaskGroup([string[]]$Command, [ValidateRange(1, 10)][int]$Count = 1) {
  $overrides = (@{
    containerOverrides = @(@{ name = "nalanda"; command = $Command })
  } | ConvertTo-Json -Depth 5 -Compress)
  $run = Invoke-AwsJson @(
    "ecs", "run-task",
    "--cluster", $cluster,
    "--task-definition", $taskDefinition,
    "--launch-type", "FARGATE",
    "--count", [string]$Count,
    "--network-configuration", $network,
    "--overrides", $overrides,
    "--region", $Region,
    "--output", "json"
  )
  if (@($run.Failures).Count -gt 0 -or @($run.Tasks).Count -ne $Count) {
    throw "Unable to start $Count one-off ECS task(s) for: $($Command -join ' ')"
  }
  $taskArns = @($run.Tasks | ForEach-Object { [string]$_.TaskArn })
  $waitArguments = @("ecs", "wait", "tasks-stopped", "--cluster", $cluster, "--tasks")
  $waitArguments += $taskArns
  $waitArguments += @("--region", $Region)
  & aws @waitArguments
  if ($LASTEXITCODE -ne 0) {
    throw "Timed out waiting for ECS task group: $($taskArns -join ', ')"
  }
  $describeArguments = @("ecs", "describe-tasks", "--cluster", $cluster, "--tasks")
  $describeArguments += $taskArns
  $describeArguments += @("--region", $Region, "--output", "json")
  $described = Invoke-AwsJson $describeArguments
  $results = @()
  foreach ($task in @($described.Tasks)) {
    $container = @($task.Containers | Where-Object { $_.Name -eq "nalanda" })[0]
    $result = [ordered]@{
      taskArn = [string]$task.TaskArn
      exitCode = if ($null -eq $container.ExitCode) { -1 } else { [int]$container.ExitCode }
      reason = [string]$container.Reason
      stoppedReason = [string]$task.StoppedReason
    }
    $results += $result
    if ($result.exitCode -ne 0) {
      throw "ECS verifier task failed (exit $($result.exitCode)): $($result.taskArn) $($result.reason) $($result.stoppedReason)"
    }
  }
  return $results
}

$setupCompleted = $false
$setupTasks = @()
$workerTasks = @()
$assertionTasks = @()
try {
  Write-Host "Preparing multi-task concurrency fixture: $runId"
  $setupTasks = @(Invoke-TaskGroup @("node", "backend/src/db/verify-multi-task.mjs", "setup", $runId))
  $setupCompleted = $true

  Write-Host "Launching two independent ECS tasks against shared PostgreSQL..."
  $workerTasks = @(Invoke-TaskGroup @("node", "backend/src/db/verify-multi-task.mjs", "worker", $runId) -Count 2)

  Write-Host "Asserting cross-task database invariants and cleaning the fixture..."
  $assertionTasks = @(Invoke-TaskGroup @("node", "backend/src/db/verify-multi-task.mjs", "assert", $runId))

  $evidence = [ordered]@{
    schemaVersion = 1
    capturedAt = (Get-Date).ToUniversalTime().ToString("o")
    accountId = [string]$identity.Account
    region = $Region
    stackName = $StackName
    sourceRevision = $sourceRevision
    cluster = $cluster
    taskDefinitionArn = $taskDefinition
    containerImage = $containerImage
    runId = $runId
    expectedWorkers = 2
    setupTasks = $setupTasks
    workerTasks = $workerTasks
    assertionTasks = $assertionTasks
    result = "passed"
  }
  $resolvedEvidencePath = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($EvidencePath)
  $evidenceDirectory = Split-Path -Parent $resolvedEvidencePath
  if ($evidenceDirectory) { New-Item -ItemType Directory -Force -Path $evidenceDirectory | Out-Null }
  $evidence | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $resolvedEvidencePath -Encoding utf8
  Write-Host "Multi-task concurrency canary passed. Evidence: $resolvedEvidencePath"
} catch {
  $canaryError = $_
  if ($setupCompleted) {
    try {
      Write-Warning "Canary failed; attempting idempotent fixture cleanup."
      Invoke-TaskGroup @("node", "backend/src/db/verify-multi-task.mjs", "cleanup", $runId) | Out-Null
    } catch {
      Write-Warning "Multi-task fixture cleanup also failed: $($_.Exception.Message)"
    }
  }
  throw $canaryError
}
