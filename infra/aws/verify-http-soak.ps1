param(
  [string]$Region = "ap-south-1",
  [string]$StackName = "nalanda-staging",
  [Parameter(Mandatory = $true)][ValidatePattern('^[0-9]{12}$')][string]$ExpectedAccountId,
  [Parameter(Mandatory = $true)][ValidatePattern('^[0-9a-f]{40}$')][string]$ExpectedSourceRevision,
  [Parameter(Mandatory = $true)][switch]$ConfirmLoadTest,
  [ValidateRange(120, 3600)][int]$DurationSeconds = 900,
  [ValidateRange(0.5, 5.0)][double]$RequestsPerSecondPerWorker = 2.0,
  [ValidateRange(50, 5000)][int]$P95ThresholdMilliseconds = 400,
  [ValidateRange(50, 10000)][int]$P99ThresholdMilliseconds = 1000,
  [ValidateRange(0.0, 0.01)][double]$MaximumErrorRate = 0.001,
  [ValidateRange(10, 100)][double]$MaximumCpuPercent = 80,
  [ValidateRange(10, 100)][double]$MaximumMemoryPercent = 80,
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

function Get-RequiredOutput([hashtable]$Outputs, [string]$Key) {
  if (-not $Outputs.ContainsKey($Key) -or -not $Outputs[$Key]) {
    throw "CloudFormation output '$Key' is unavailable."
  }
  return [string]$Outputs[$Key]
}

function Get-Service {
  $result = Invoke-AwsJson @(
    "ecs", "describe-services", "--cluster", $cluster, "--services", $serviceName,
    "--region", $Region, "--output", "json"
  )
  return @($result.Services)[0]
}

function Wait-ServiceStable {
  & aws ecs wait services-stable --cluster $cluster --services $serviceName --region $Region
  if ($LASTEXITCODE -ne 0) { throw "ECS service did not become stable." }
}

function Get-ServiceTaskArns {
  $result = Invoke-AwsJson @(
    "ecs", "list-tasks", "--cluster", $cluster, "--service-name", $serviceName,
    "--desired-status", "RUNNING", "--region", $Region, "--output", "json"
  )
  return @($result.TaskArns | ForEach-Object { [string]$_ } | Sort-Object)
}

function Get-Tasks([string[]]$TaskArns) {
  if ($TaskArns.Count -eq 0) { return @() }
  $arguments = @("ecs", "describe-tasks", "--cluster", $cluster, "--tasks")
  $arguments += $TaskArns
  $arguments += @("--region", $Region, "--output", "json")
  $result = Invoke-AwsJson $arguments
  return @($result.Tasks)
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
    "Unable to launch verifier task: $($Command -join ' ')"
  return [string]$run.Tasks[0].TaskArn
}

function Wait-TaskStopped([string]$TaskArn) {
  & aws ecs wait tasks-stopped --cluster $cluster --tasks $TaskArn --region $Region
  if ($LASTEXITCODE -ne 0) { throw "Timed out waiting for ECS task $TaskArn" }
}

function Assert-TaskSucceeded([string]$TaskArn) {
  $task = @(Get-Tasks @($TaskArn))[0]
  $container = @($task.Containers | Where-Object { $_.Name -eq "nalanda" })[0]
  $exitCode = if ($null -eq $container.ExitCode) { -1 } else { [int]$container.ExitCode }
  Assert-Condition ($exitCode -eq 0) `
    "Verifier task failed (exit $exitCode): $TaskArn $($container.Reason) $($task.StoppedReason)"
}

function Invoke-VerifierTask([string[]]$Command) {
  $taskArn = Start-VerifierTask $Command
  Wait-TaskStopped $taskArn
  Assert-TaskSucceeded $taskArn
  return $taskArn
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

function Get-TaskLogPayload([string]$TaskArn, [string]$Marker, [int]$TimeoutSeconds = 90) {
  $taskId = ($TaskArn -split "/")[-1]
  $logStream = "app/nalanda/$taskId"
  $deadline = (Get-Date).ToUniversalTime().AddSeconds($TimeoutSeconds)
  do {
    $raw = & aws logs get-log-events --log-group-name $logGroupName `
      --log-stream-name $logStream --start-from-head --region $Region --output json 2>$null
    if ($LASTEXITCODE -eq 0) {
      $events = ($raw | ConvertFrom-Json).Events
      $matchingLines = @($events | ForEach-Object { [string]$_.Message } | Where-Object { $_ -like "$Marker*" })
      if ($matchingLines.Count -gt 0) {
        $line = [string]$matchingLines[-1]
        return ($line.Substring($Marker.Length) | ConvertFrom-Json)
      }
    }
    Start-Sleep -Seconds 3
  } while ((Get-Date).ToUniversalTime() -lt $deadline)
  throw "CloudWatch log marker '$Marker' was not found for task $TaskArn"
}

function Get-EcsMetricMaximum([string]$MetricName, [datetime]$StartTime, [datetime]$EndTime) {
  $deadline = (Get-Date).ToUniversalTime().AddSeconds(180)
  do {
    $result = Invoke-AwsJson @(
      "cloudwatch", "get-metric-statistics", "--namespace", "AWS/ECS",
      "--metric-name", $MetricName,
      "--dimensions", "Name=ClusterName,Value=$cluster", "Name=ServiceName,Value=$serviceName",
      "--start-time", $StartTime.ToUniversalTime().ToString("o"),
      "--end-time", $EndTime.ToUniversalTime().ToString("o"),
      "--period", "60", "--statistics", "Maximum", "--region", $Region, "--output", "json"
    )
    $values = @($result.Datapoints | ForEach-Object { [double]$_.Maximum })
    if ($values.Count -gt 0) { return [double](($values | Measure-Object -Maximum).Maximum) }
    Start-Sleep -Seconds 15
  } while ((Get-Date).ToUniversalTime() -lt $deadline)
  throw "CloudWatch did not publish $MetricName samples for the load interval."
}

function Get-EnvironmentValue($Container, [string]$Name) {
  $entry = @($Container.Environment | Where-Object { $_.Name -eq $Name })[0]
  if ($null -eq $entry) { return "" }
  return [string]$entry.Value
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
    authorityMode = $authorityMode
    sourceRevision = $sourceRevision
    taskDefinitionArn = $taskDefinition
    runId = $runId
    originalDesiredCount = $originalDesiredCount
    serviceRestored = $serviceRestored
    serviceTargets = $serviceTargets
    serviceTaskArnsAfter = $serviceTaskArnsAfter
    setupTaskArn = $setupTaskArn
    workerTaskArns = $workerTaskArns
    assertionTaskArn = $assertionTaskArn
    cleanupTaskArn = $cleanupTaskArn
    fixtureCleaned = $fixtureCleaned
    durationSeconds = $DurationSeconds
    requestsPerSecondPerWorker = $RequestsPerSecondPerWorker
    p95ThresholdMilliseconds = $P95ThresholdMilliseconds
    p99ThresholdMilliseconds = $P99ThresholdMilliseconds
    maximumErrorRate = $MaximumErrorRate
    readinessObservations = $readinessObservations
    aggregate = $aggregate
    maximumCpuPercent = $observedCpuPercent
    maximumMemoryPercent = $observedMemoryPercent
    activeAlarms = $activeAlarms
  }
  $resolvedPath = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($EvidencePath)
  $directory = Split-Path -Parent $resolvedPath
  if ($directory) { New-Item -ItemType Directory -Force -Path $directory | Out-Null }
  $evidence | ConvertTo-Json -Depth 15 | Set-Content -LiteralPath $resolvedPath -Encoding utf8
  Write-Host "HTTP soak evidence: $resolvedPath"
}

Assert-Condition $ConfirmLoadTest.IsPresent "The load/soak gate requires the explicit -ConfirmLoadTest switch."
Assert-Condition ($P99ThresholdMilliseconds -ge $P95ThresholdMilliseconds) `
  "P99ThresholdMilliseconds must be greater than or equal to P95ThresholdMilliseconds."
$identity = Invoke-AwsJson @("sts", "get-caller-identity", "--region", $Region, "--output", "json")
Assert-Condition ([string]$identity.Account -eq $ExpectedAccountId) `
  "The authenticated AWS account does not match ExpectedAccountId."

$stacks = Invoke-AwsJson @(
  "cloudformation", "describe-stacks", "--stack-name", $StackName,
  "--region", $Region, "--output", "json"
)
$outputs = @{}
foreach ($output in @($stacks.Stacks[0].Outputs)) {
  $outputs[[string]$output.OutputKey] = [string]$output.OutputValue
}
$environmentName = Get-RequiredOutput $outputs "EnvironmentName"
$cluster = Get-RequiredOutput $outputs "ClusterName"
$serviceName = Get-RequiredOutput $outputs "ServiceName"
$taskDefinition = Get-RequiredOutput $outputs "TaskDefinitionArn"
$sourceRevision = Get-RequiredOutput $outputs "SourceRevision"
$authorityMode = Get-RequiredOutput $outputs "AuthorityMode"
$applicationUrl = (Get-RequiredOutput $outputs "ApplicationUrl").TrimEnd("/")
$logGroupName = Get-RequiredOutput $outputs "ApplicationLogGroupName"
$subnets = Get-RequiredOutput $outputs "ApplicationSubnetIds"
$securityGroup = Get-RequiredOutput $outputs "ApplicationSecurityGroupId"

Assert-Condition ($environmentName -match '(?i)(staging|nonprod|test|dev)' -and $environmentName -notmatch '(?i)(^|-)prod(uction)?($|-)') `
  "HTTP load/soak is restricted to an explicitly non-production environment."
Assert-Condition ($sourceRevision -eq $ExpectedSourceRevision) `
  "The stack source revision does not match ExpectedSourceRevision."
Assert-Condition ($authorityMode -eq "normalized") `
  "The load/soak gate requires the stack AuthorityMode=normalized."
Assert-Condition ($applicationUrl -match '^https://') "ApplicationUrl must use HTTPS."

$taskDefinitionEnvelope = Invoke-AwsJson @(
  "ecs", "describe-task-definition", "--task-definition", $taskDefinition,
  "--region", $Region, "--output", "json"
)
$taskContainer = @($taskDefinitionEnvelope.TaskDefinition.ContainerDefinitions | Where-Object { $_.Name -eq "nalanda" })[0]
Assert-Condition ($null -ne $taskContainer) "The Nalanda task container is missing."
Assert-Condition ([string]$taskContainer.Image -match '@sha256:[0-9a-f]{64}$') `
  "The load/soak gate requires an immutable digest-pinned image."
$revisionLabel = $null
if ($null -ne $taskContainer.DockerLabels) {
  $revisionLabel = $taskContainer.DockerLabels.PSObject.Properties["org.opencontainers.image.revision"]
}
Assert-Condition ($null -ne $revisionLabel -and [string]$revisionLabel.Value -eq $ExpectedSourceRevision) `
  "The task definition source-revision label does not match ExpectedSourceRevision."
Assert-Condition ((Get-EnvironmentValue $taskContainer "USE_PG_COURSES") -eq "1") `
  "The load/soak gate requires USE_PG_COURSES=1; task-local snapshot authority cannot be scaled safely."
Assert-Condition ((Get-EnvironmentValue $taskContainer "COURSE_AUTHORITY_COVERAGE_ACK") -eq "normalized-v1") `
  "The normalized course-authority coverage acknowledgement is missing."
Assert-Condition ((Get-EnvironmentValue $taskContainer "ENABLE_PRIVACY_ERASURE_WORKER") -eq "1" `
  -and (Get-EnvironmentValue $taskContainer "PRIVACY_COVERAGE_ACK") -eq "normalized-v2" `
  -and (Get-EnvironmentValue $taskContainer "ENABLE_REPORT_EXPORT_WORKER") -eq "1") `
  "The normalized background workers and privacy coverage acknowledgement must be enabled before multi-task load."

$service = Get-Service
$originalDesiredCount = [int]$service.DesiredCount
Assert-Condition ($originalDesiredCount -in @(1, 2)) `
  "The staging service desired count must be one or two before the controlled load gate."
Assert-Condition ([int]$service.RunningCount -eq $originalDesiredCount -and [int]$service.PendingCount -eq 0) `
  "The ECS service is not stable before load testing."
Assert-Condition ([string]$service.TaskDefinition -eq $taskDefinition) `
  "The ECS service is not running the stack-owned task definition."

$network = "awsvpcConfiguration={subnets=[$subnets],securityGroups=[$securityGroup],assignPublicIp=DISABLED}"
$runToken = ([guid]::NewGuid().ToString("N")).Substring(0, 24).ToUpperInvariant()
$runId = "LS-$runToken"
if (-not $EvidencePath) { $EvidencePath = "artifacts/aws/$StackName-$($runToken.ToLowerInvariant())-http-soak.json" }

$setupTaskArn = ""
$workerTaskArns = @()
$assertionTaskArn = ""
$cleanupTaskArn = ""
$fixtureAttempted = $false
$fixtureCleaned = $false
$serviceScaled = $false
$serviceRestored = $originalDesiredCount -eq 2
$serviceTargets = @()
$serviceTaskArnsAfter = @()
$readinessObservations = @()
$aggregate = $null
$observedCpuPercent = $null
$observedMemoryPercent = $null
$activeAlarms = @()
$gateError = $null

try {
  $fixtureAttempted = $true
  $setupTaskArn = Invoke-VerifierTask @(
    "node", "backend/src/load/verify-http-soak.mjs", "setup", $runId, $sourceRevision
  )

  if ($originalDesiredCount -ne 2) {
    Invoke-AwsJson @(
      "ecs", "update-service", "--cluster", $cluster, "--service", $serviceName,
      "--desired-count", "2", "--region", $Region, "--output", "json"
    ) | Out-Null
    $serviceScaled = $true
    Wait-ServiceStable
  }

  $serviceTaskArns = @(Get-ServiceTaskArns)
  Assert-Condition ($serviceTaskArns.Count -eq 2) `
    "The load/soak gate requires exactly two running ECS service tasks."
  $serviceTasks = @(Get-Tasks $serviceTaskArns)
  foreach ($task in $serviceTasks) {
    Assert-Condition ([string]$task.TaskDefinitionArn -eq $taskDefinition -and [string]$task.LastStatus -eq "RUNNING") `
      "Every service target must run the expected task definition."
    $attachment = @($task.Attachments | Where-Object { $_.Type -eq "ElasticNetworkInterface" })[0]
    $eniId = [string](@($attachment.Details | Where-Object { $_.Name -eq "networkInterfaceId" })[0].Value)
    Assert-Condition ($eniId -match '^eni-[a-f0-9]+$') "A service task network interface is unavailable."
    $eni = @((Invoke-AwsJson @(
      "ec2", "describe-network-interfaces", "--network-interface-ids", $eniId,
      "--region", $Region, "--output", "json"
    )).NetworkInterfaces)[0]
    $serviceTargets += [ordered]@{
      taskArn = [string]$task.TaskArn
      taskId = ([string]$task.TaskArn -split "/")[-1]
      networkInterfaceId = $eniId
      privateIpAddress = [string]$eni.PrivateIpAddress
      availabilityZone = [string]$eni.AvailabilityZone
    }
  }
  Assert-Condition (@($serviceTargets.privateIpAddress | Sort-Object -Unique).Count -eq 2) `
    "The ECS service tasks do not have distinct private addresses."
  Assert-Condition (@($serviceTargets.availabilityZone | Sort-Object -Unique).Count -eq 2) `
    "The ECS service tasks must be distributed across two Availability Zones."

  for ($index = 0; $index -lt $serviceTargets.Count; $index++) {
    $target = $serviceTargets[$index]
    $workerTaskArns += Start-VerifierTask @(
      "node", "backend/src/load/verify-http-soak.mjs", "worker", $runId, $sourceRevision,
      [string]($index + 1), [string]$target.taskId,
      "http://$($target.privateIpAddress):8080", $applicationUrl,
      [string]$DurationSeconds, [string]$RequestsPerSecondPerWorker
    )
  }
  $loadStartedAt = (Get-Date).ToUniversalTime()
  $loadDeadline = $loadStartedAt.AddSeconds($DurationSeconds + 300)
  $workersStopped = $false
  do {
    $readinessObservations += [ordered]@{
      capturedAt = (Get-Date).ToUniversalTime().ToString("o")
      statusCode = Get-ReadinessStatus
    }
    $workerTasks = @(Get-Tasks $workerTaskArns)
    if (@($workerTasks | Where-Object { $_.LastStatus -ne "STOPPED" }).Count -eq 0) {
      $workersStopped = $true
      break
    }
    Start-Sleep -Seconds 5
  } while ((Get-Date).ToUniversalTime() -lt $loadDeadline)
  Assert-Condition $workersStopped "HTTP load workers exceeded the duration and shutdown allowance."
  foreach ($workerTaskArn in $workerTaskArns) { Assert-TaskSucceeded $workerTaskArn }
  Assert-Condition ($readinessObservations.Count -ge [math]::Floor($DurationSeconds / 10)) `
    "Too few public readiness observations were collected during load."
  Assert-Condition (@($readinessObservations | Where-Object { $_.statusCode -ne 200 }).Count -eq 0) `
    "Public readiness was not continuously healthy during load."

  $serviceTaskArnsAfter = @(Get-ServiceTaskArns)
  Assert-Condition (($serviceTaskArns -join ",") -eq ($serviceTaskArnsAfter -join ",")) `
    "An ECS service task was replaced during the load interval."

  $assertionTaskArn = Invoke-VerifierTask @(
    "node", "backend/src/load/verify-http-soak.mjs", "assert", $runId, $sourceRevision,
    "2", [string]$DurationSeconds, [string]$RequestsPerSecondPerWorker,
    [string]$P95ThresholdMilliseconds, [string]$P99ThresholdMilliseconds, [string]$MaximumErrorRate
  )
  $aggregate = Get-TaskLogPayload $assertionTaskArn "HTTP_SOAK_ASSERT:$runId "

  $metricEndTime = (Get-Date).ToUniversalTime().AddMinutes(1)
  $observedCpuPercent = Get-EcsMetricMaximum "CPUUtilization" $loadStartedAt.AddMinutes(-1) $metricEndTime
  $observedMemoryPercent = Get-EcsMetricMaximum "MemoryUtilization" $loadStartedAt.AddMinutes(-1) $metricEndTime
  Assert-Condition ($observedCpuPercent -le $MaximumCpuPercent) `
    "ECS maximum CPU utilization $observedCpuPercent% exceeded $MaximumCpuPercent%."
  Assert-Condition ($observedMemoryPercent -le $MaximumMemoryPercent) `
    "ECS maximum memory utilization $observedMemoryPercent% exceeded $MaximumMemoryPercent%."

  $alarms = Invoke-AwsJson @(
    "cloudwatch", "describe-alarms", "--alarm-name-prefix", "$environmentName-",
    "--state-value", "ALARM", "--region", $Region, "--output", "json"
  )
  $activeAlarms = @($alarms.MetricAlarms | ForEach-Object { [string]$_.AlarmName })
  Assert-Condition ($activeAlarms.Count -eq 0) "One or more staging alarms entered ALARM during the load gate."

  $cleanupTaskArn = Invoke-VerifierTask @(
    "node", "backend/src/load/verify-http-soak.mjs", "cleanup", $runId
  )
  $fixtureCleaned = $true
} catch {
  $gateError = $_
} finally {
  foreach ($workerTaskArn in $workerTaskArns) {
    try {
      $task = @(Get-Tasks @($workerTaskArn))[0]
      if ($null -ne $task -and [string]$task.LastStatus -ne "STOPPED") {
        & aws ecs stop-task --cluster $cluster --task $workerTaskArn --reason "HTTP soak cleanup" `
          --region $Region --output json 2>$null | Out-Null
        & aws ecs wait tasks-stopped --cluster $cluster --tasks $workerTaskArn --region $Region 2>$null
      }
    } catch { if ($null -eq $gateError) { $gateError = $_ } }
  }
  if ($fixtureAttempted -and -not $fixtureCleaned) {
    try {
      $cleanupTaskArn = Invoke-VerifierTask @(
        "node", "backend/src/load/verify-http-soak.mjs", "cleanup", $runId
      )
      $fixtureCleaned = $true
    } catch {
      Write-Warning "HTTP soak fixture cleanup failed: $($_.Exception.Message)"
      if ($null -eq $gateError) { $gateError = $_ }
    }
  }
  if ($serviceScaled) {
    try {
      Invoke-AwsJson @(
        "ecs", "update-service", "--cluster", $cluster, "--service", $serviceName,
        "--desired-count", [string]$originalDesiredCount, "--region", $Region, "--output", "json"
      ) | Out-Null
      Wait-ServiceStable
      $restoredService = Get-Service
      $serviceRestored = [int]$restoredService.DesiredCount -eq $originalDesiredCount `
        -and [int]$restoredService.RunningCount -eq $originalDesiredCount `
        -and [int]$restoredService.PendingCount -eq 0
      if (-not $serviceRestored) { throw "ECS service did not return to its original size." }
    } catch {
      Write-Warning "ECS service restoration failed: $($_.Exception.Message)"
      if ($null -eq $gateError) { $gateError = $_ }
    }
  }
  try {
    if ($null -eq $gateError) { Write-Evidence "passed" }
    else { Write-Evidence "failed" $gateError.Exception.Message }
  } catch {
    Write-Warning "HTTP soak evidence could not be written: $($_.Exception.Message)"
    if ($null -eq $gateError) { $gateError = $_ }
  }
}

if ($null -ne $gateError) { throw $gateError }
Write-Host "Two-task HTTP load/soak, latency, readiness and resource-headroom gate passed."
