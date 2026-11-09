param(
  [string]$Region = "ap-south-1",
  [string]$StackName = "nalanda-staging",
  [Parameter(Mandatory = $true)][ValidatePattern('^\d{12}$')][string]$ExpectedAccountId,
  [Parameter(Mandatory = $true)][ValidatePattern('^[0-9a-f]{40}$')][string]$ExpectedSourceRevision,
  [switch]$ConfirmRecoveryDrill,
  [string]$EvidencePath = ""
)

$ErrorActionPreference = "Stop"
if (-not $ConfirmRecoveryDrill) {
  throw "Operational recovery verification requires the explicit -ConfirmRecoveryDrill switch."
}
if ($StackName -notmatch '(?i)(staging|stage|test|nonprod|dev)' -or $StackName -match '(?i)(^|[-_])prod(uction)?($|[-_])') {
  throw "Operational recovery verification is restricted to an explicitly non-production stack."
}

function Invoke-AwsJson([string[]]$Arguments) {
  $raw = & aws @Arguments
  if ($LASTEXITCODE -ne 0) { throw "AWS CLI command failed: aws $($Arguments -join ' ')" }
  return ($raw | ConvertFrom-Json)
}

function Get-StackOutput([object]$Stack, [string]$Key) {
  $output = @($Stack.Outputs | Where-Object { $_.OutputKey -eq $Key })[0]
  if ($null -eq $output -or -not $output.OutputValue) {
    throw "CloudFormation output '$Key' is unavailable."
  }
  return [string]$output.OutputValue
}

function Get-ServiceState([string]$Cluster, [string]$Service) {
  $response = Invoke-AwsJson @(
    "ecs", "describe-services", "--cluster", $Cluster, "--services", $Service,
    "--region", $Region, "--output", "json"
  )
  $state = @($response.Services)[0]
  if ($null -eq $state -or $state.Status -ne "ACTIVE" -or [int]$state.DesiredCount -lt 1 `
    -or [int]$state.RunningCount -ne [int]$state.DesiredCount -or [int]$state.PendingCount -ne 0 `
    -or @($state.Deployments).Count -ne 1) {
    throw "The normalized service must be stable before and after the recovery drill."
  }
  return [ordered]@{
    taskDefinition = [string]$state.TaskDefinition
    desiredCount = [int]$state.DesiredCount
    runningCount = [int]$state.RunningCount
    pendingCount = [int]$state.PendingCount
  }
}

$identity = Invoke-AwsJson @("sts", "get-caller-identity", "--region", $Region, "--output", "json")
if ([string]$identity.Account -ne $ExpectedAccountId) {
  throw "AWS account mismatch. Expected $ExpectedAccountId, received $($identity.Account)."
}
$stacks = Invoke-AwsJson @(
  "cloudformation", "describe-stacks", "--stack-name", $StackName,
  "--region", $Region, "--output", "json"
)
$stack = @($stacks.Stacks)[0]
$cluster = Get-StackOutput $stack "ClusterName"
$service = Get-StackOutput $stack "ServiceName"
$taskDefinition = Get-StackOutput $stack "TaskDefinitionArn"
$subnets = Get-StackOutput $stack "ApplicationSubnetIds"
$securityGroup = Get-StackOutput $stack "ApplicationSecurityGroupId"
$sourceRevision = Get-StackOutput $stack "SourceRevision"
$authorityMode = Get-StackOutput $stack "AuthorityMode"
if ($sourceRevision -ne $ExpectedSourceRevision) { throw "Stack source revision mismatch." }
if ($authorityMode -ne "normalized") { throw "Operational recovery verification requires AuthorityMode=normalized." }

$definition = Invoke-AwsJson @(
  "ecs", "describe-task-definition", "--task-definition", $taskDefinition,
  "--region", $Region, "--output", "json"
)
$container = @($definition.TaskDefinition.ContainerDefinitions | Where-Object { $_.Name -eq "nalanda" })[0]
if ($null -eq $container -or [string]$container.Image -notmatch '@sha256:[0-9a-f]{64}$') {
  throw "Recovery drill requires a digest-pinned Nalanda container."
}
$environment = @{}
foreach ($item in @($container.Environment)) { $environment[[string]$item.Name] = [string]$item.Value }
if ($environment.SOURCE_REVISION -ne $ExpectedSourceRevision -or $environment.USE_PG_COURSES -ne "1" `
  -or $environment.USE_PG_PAYMENTS -ne "1" -or $environment.USE_PG_PRIVACY -ne "1" `
  -or $environment.USE_PG_ATTEMPTS -ne "1") {
  throw "Task definition does not expose the expected normalized/revision-bound runtime."
}

$before = Get-ServiceState $cluster $service
if ($before.taskDefinition -ne $taskDefinition) { throw "Service task definition differs from the stack output." }
$runId = "OR-$(([guid]::NewGuid().ToString('N')).ToUpperInvariant())"
if (-not $EvidencePath) { $EvidencePath = "artifacts/aws/$StackName-$runId-operational-recovery.json" }
$network = "awsvpcConfiguration={subnets=[$subnets],securityGroups=[$securityGroup],assignPublicIp=DISABLED}"
$taskResults = @()
$result = "failed"
$errorMessage = ""

function Invoke-Verifier([string]$Name, [string]$Script) {
  $overrides = (@{
    containerOverrides = @(@{ name = "nalanda"; command = @("node", $Script) })
  } | ConvertTo-Json -Depth 5 -Compress)
  $run = Invoke-AwsJson @(
    "ecs", "run-task", "--cluster", $cluster, "--task-definition", $taskDefinition,
    "--launch-type", "FARGATE", "--network-configuration", $network,
    "--overrides", $overrides, "--region", $Region, "--output", "json"
  )
  if (@($run.Failures).Count -gt 0 -or @($run.Tasks).Count -ne 1) {
    throw "Unable to start the $Name verifier."
  }
  $taskArn = [string]$run.Tasks[0].TaskArn
  & aws ecs wait tasks-stopped --cluster $cluster --tasks $taskArn --region $Region
  if ($LASTEXITCODE -ne 0) { throw "Timed out waiting for the $Name verifier task." }
  $described = Invoke-AwsJson @(
    "ecs", "describe-tasks", "--cluster", $cluster, "--tasks", $taskArn,
    "--region", $Region, "--output", "json"
  )
  $task = @($described.Tasks)[0]
  $taskContainer = @($task.Containers | Where-Object { $_.Name -eq "nalanda" })[0]
  $taskResult = [ordered]@{
    name = $Name
    taskArn = $taskArn
    availabilityZone = [string]$task.AvailabilityZone
    exitCode = if ($null -eq $taskContainer.ExitCode) { -1 } else { [int]$taskContainer.ExitCode }
    reason = [string]$taskContainer.Reason
    stoppedReason = [string]$task.StoppedReason
  }
  $script:taskResults += $taskResult
  if ($taskResult.exitCode -ne 0) {
    throw "$Name verifier failed (exit $($taskResult.exitCode)): $($taskResult.reason) $($taskResult.stoppedReason)"
  }
}

try {
  Invoke-Verifier "payment-reconciliation" "backend/src/db/verify-payments.mjs"
  Invoke-Verifier "privacy-erasure-retry" "backend/src/db/verify-privacy.mjs"
  Invoke-Verifier "proctor-media-retention-retry" "backend/src/db/verify-proctor-retention.mjs"

  & aws ecs wait services-stable --cluster $cluster --services $service --region $Region
  if ($LASTEXITCODE -ne 0) { throw "Service did not stabilize after operational recovery verification." }
  $after = Get-ServiceState $cluster $service
  if ($after.taskDefinition -ne $before.taskDefinition `
    -or $after.desiredCount -ne $before.desiredCount -or $after.runningCount -ne $before.runningCount) {
    throw "Operational recovery verification changed the service deployment or task count."
  }
  $alarms = Invoke-AwsJson @(
    "cloudwatch", "describe-alarms", "--alarm-name-prefix", "$StackName-",
    "--state-value", "ALARM", "--region", $Region, "--output", "json"
  )
  if (@($alarms.MetricAlarms).Count -gt 0 -or @($alarms.CompositeAlarms).Count -gt 0) {
    throw "One or more stack alarms are active after operational recovery verification."
  }
  $result = "passed"
} catch {
  $errorMessage = $_.Exception.Message
} finally {
  $evidence = [ordered]@{
    schemaVersion = 1
    capturedAt = (Get-Date).ToUniversalTime().ToString("o")
    result = $result
    error = $errorMessage
    accountId = [string]$identity.Account
    region = $Region
    stackName = $StackName
    sourceRevision = $sourceRevision
    authorityMode = $authorityMode
    containerImage = [string]$container.Image
    taskDefinitionArn = $taskDefinition
    serviceBefore = $before
    tasks = $taskResults
    serviceAfter = if ($null -ne $after) { $after } else { $null }
  }
  $resolvedPath = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($EvidencePath)
  $directory = Split-Path -Parent $resolvedPath
  if ($directory) { New-Item -ItemType Directory -Force -Path $directory | Out-Null }
  $evidence | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $resolvedPath -Encoding utf8
  Write-Host "Operational recovery evidence: $resolvedPath"
}

if ($result -ne "passed") { throw $errorMessage }
Write-Host "Operational recovery verification passed ($($taskResults.Count) isolated verifier tasks)."
