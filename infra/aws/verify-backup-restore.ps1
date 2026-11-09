param(
  [string]$Region = "ap-south-1",
  [string]$StackName = "nalanda-staging",
  [Parameter(Mandatory = $true)][ValidatePattern('^\d{12}$')][string]$ExpectedAccountId,
  [Parameter(Mandatory = $true)][ValidatePattern('^[0-9a-f]{40}$')][string]$ExpectedSourceRevision,
  [ValidateRange(5, 240)][int]$MaxRestoreMinutes = 45,
  [string]$EvidencePath = "",
  [switch]$ConfirmRestoreDrill,
  [switch]$KeepFailedResources
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

function Assert-Condition([bool]$Condition, [string]$Message) {
  if (-not $Condition) { throw $Message }
}

Assert-Condition $ConfirmRestoreDrill.IsPresent `
  "The backup/restore drill requires the explicit -ConfirmRestoreDrill switch."
Assert-Condition ($StackName -match '(?i)(staging|stage|test|nonprod|dev)' `
    -and $StackName -notmatch '(?i)(^|[-_])prod(uction)?($|[-_])') `
  "The backup/restore drill is restricted to an explicitly non-production stack."

$identity = Invoke-AwsJson @("sts", "get-caller-identity", "--region", $Region, "--output", "json")
Assert-Condition ([string]$identity.Account -eq $ExpectedAccountId) `
  "The authenticated AWS account does not match ExpectedAccountId."

function Invoke-VerifierTask(
  [string[]]$Command,
  [hashtable]$Environment = @{}
) {
  $environmentOverrides = @()
  foreach ($entry in $Environment.GetEnumerator()) {
    $environmentOverrides += @{ name = [string]$entry.Key; value = [string]$entry.Value }
  }
  $overrides = (@{
    containerOverrides = @(@{
      name = "nalanda"
      command = $Command
      environment = $environmentOverrides
    })
  } | ConvertTo-Json -Depth 7 -Compress)
  $run = Invoke-AwsJson @(
    "ecs", "run-task", "--cluster", $cluster,
    "--task-definition", $taskDefinition, "--launch-type", "FARGATE",
    "--count", "1", "--network-configuration", $network,
    "--overrides", $overrides, "--region", $Region, "--output", "json"
  )
  if (@($run.Failures).Count -gt 0 -or @($run.Tasks).Count -ne 1) {
    throw "Unable to start backup/restore verifier task: $($Command -join ' ')"
  }
  $taskArn = [string]$run.Tasks[0].TaskArn
  & aws ecs wait tasks-stopped --cluster $cluster --tasks $taskArn --region $Region
  if ($LASTEXITCODE -ne 0) { throw "Timed out waiting for ECS verifier task $taskArn" }
  $described = Invoke-AwsJson @(
    "ecs", "describe-tasks", "--cluster", $cluster, "--tasks", $taskArn,
    "--region", $Region, "--output", "json"
  )
  $container = @($described.Tasks[0].Containers | Where-Object { $_.Name -eq "nalanda" })[0]
  $exitCode = if ($null -eq $container.ExitCode) { -1 } else { [int]$container.ExitCode }
  if ($exitCode -ne 0) {
    throw "ECS verifier task failed (exit $exitCode): $taskArn $($container.Reason)"
  }
  return [ordered]@{ taskArn = $taskArn; exitCode = $exitCode }
}

function Assert-RunScopedIdentifier([string]$Identifier, [string]$Expected) {
  if ($Identifier -ne $Expected -or $Identifier -notmatch '^nalanda-(restore|snapshot)-[0-9a-f]{16}$') {
    throw "Refusing cleanup of an identifier outside this restore run: $Identifier"
  }
}

function Remove-RestoredInstance {
  Assert-RunScopedIdentifier $restoreIdentifier $restoreIdentifier
  $instances = Invoke-AwsJson @(
    "rds", "describe-db-instances", "--db-instance-identifier", $restoreIdentifier,
    "--region", $Region, "--output", "json"
  )
  $instance = @($instances.DBInstances)[0]
  $runTag = @($instance.TagList | Where-Object { $_.Key -eq "NalandaRestoreRun" -and $_.Value -eq $runId })
  if ($runTag.Count -ne 1) { throw "Refusing to delete an untagged restored database instance." }
  & aws rds delete-db-instance --db-instance-identifier $restoreIdentifier `
    --skip-final-snapshot --delete-automated-backups --region $Region | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Unable to delete restored database instance $restoreIdentifier" }
  & aws rds wait db-instance-deleted --db-instance-identifier $restoreIdentifier --region $Region
  if ($LASTEXITCODE -ne 0) { throw "Timed out deleting restored database instance $restoreIdentifier" }
}

function Remove-RunSnapshot {
  Assert-RunScopedIdentifier $snapshotIdentifier $snapshotIdentifier
  $snapshots = Invoke-AwsJson @(
    "rds", "describe-db-snapshots", "--db-snapshot-identifier", $snapshotIdentifier,
    "--snapshot-type", "manual", "--region", $Region, "--output", "json"
  )
  $snapshot = @($snapshots.DBSnapshots)[0]
  $runTag = @($snapshot.TagList | Where-Object { $_.Key -eq "NalandaRestoreRun" -and $_.Value -eq $runId })
  if ($runTag.Count -ne 1) { throw "Refusing to delete an untagged restore snapshot." }
  & aws rds delete-db-snapshot --db-snapshot-identifier $snapshotIdentifier --region $Region | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Unable to delete restore snapshot $snapshotIdentifier" }
}

$outputs = Get-StackOutputs
$cluster = Get-RequiredOutput $outputs "ClusterName"
$taskDefinition = Get-RequiredOutput $outputs "TaskDefinitionArn"
$sourceRevision = Get-RequiredOutput $outputs "SourceRevision"
$sourceDatabaseIdentifier = Get-RequiredOutput $outputs "DatabaseIdentifier"
$databaseSubnetGroup = Get-RequiredOutput $outputs "DatabaseSubnetGroupName"
$databaseSecurityGroup = Get-RequiredOutput $outputs "DatabaseSecurityGroupId"
$subnets = Get-RequiredOutput $outputs "ApplicationSubnetIds"
$applicationSecurityGroup = Get-RequiredOutput $outputs "ApplicationSecurityGroupId"
if ($sourceRevision -notmatch '^[0-9a-f]{40}$') { throw "Stack source revision is invalid." }
Assert-Condition ($sourceRevision -eq $ExpectedSourceRevision) `
  "The stack source revision does not match ExpectedSourceRevision."

$taskDefinitionEnvelope = Invoke-AwsJson @(
  "ecs", "describe-task-definition", "--task-definition", $taskDefinition,
  "--region", $Region, "--output", "json"
)
$taskContainer = @($taskDefinitionEnvelope.TaskDefinition.ContainerDefinitions | Where-Object { $_.Name -eq "nalanda" })[0]
Assert-Condition ($null -ne $taskContainer -and [string]$taskContainer.Image -match '@sha256:[0-9a-f]{64}$') `
  "The backup/restore drill requires a digest-pinned Nalanda container."
$taskSourceRevisionEntry = @($taskContainer.Environment | Where-Object { $_.Name -eq "SOURCE_REVISION" })[0]
Assert-Condition ($null -ne $taskSourceRevisionEntry) `
  "The task definition does not expose SOURCE_REVISION."
$taskSourceRevision = [string]$taskSourceRevisionEntry.Value
Assert-Condition ($taskSourceRevision -eq $ExpectedSourceRevision) `
  "The task definition SOURCE_REVISION does not match ExpectedSourceRevision."
$containerImage = [string]$taskContainer.Image

$network = "awsvpcConfiguration={subnets=[$subnets],securityGroups=[$applicationSecurityGroup],assignPublicIp=DISABLED}"
$runToken = ([guid]::NewGuid().ToString("N")).ToLowerInvariant()
$runId = "BR-$($runToken.ToUpperInvariant())"
$resourceToken = $runToken.Substring(0, 16)
$snapshotIdentifier = "nalanda-snapshot-$resourceToken"
$restoreIdentifier = "nalanda-restore-$resourceToken"
if (-not $EvidencePath) { $EvidencePath = "artifacts/aws/$StackName-$resourceToken-backup-restore.json" }

$source = Invoke-AwsJson @(
  "rds", "describe-db-instances", "--db-instance-identifier", $sourceDatabaseIdentifier,
  "--region", $Region, "--output", "json"
)
$sourceInstance = @($source.DBInstances)[0]
$dbInstanceClass = [string]$sourceInstance.DBInstanceClass
$databaseParameterGroup = [string]$sourceInstance.DBParameterGroups[0].DBParameterGroupName
if (-not $databaseParameterGroup) { throw "The source database parameter group is unavailable." }
$startedAt = (Get-Date).ToUniversalTime()
$markerPrepared = $false
$snapshotCreated = $false
$restoreCreated = $false
$sourceTask = $null
$restoreTask = $null
$drillError = $null
$cleanupErrors = @()

try {
  Write-Host "Writing source marker for backup/restore run $runId..."
  $sourceTask = Invoke-VerifierTask @(
    "node", "backend/src/db/verify-backup-restore.mjs", "prepare", $runId, $sourceRevision
  )
  $markerPrepared = $true

  Write-Host "Creating tagged manual RDS snapshot $snapshotIdentifier..."
  & aws rds create-db-snapshot --db-instance-identifier $sourceDatabaseIdentifier `
    --db-snapshot-identifier $snapshotIdentifier `
    --tags "Key=NalandaRestoreRun,Value=$runId" "Key=SourceRevision,Value=$sourceRevision" `
    --region $Region | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Unable to create RDS snapshot $snapshotIdentifier" }
  $snapshotCreated = $true
  & aws rds wait db-snapshot-completed --db-snapshot-identifier $snapshotIdentifier --region $Region
  if ($LASTEXITCODE -ne 0) { throw "Timed out waiting for RDS snapshot $snapshotIdentifier" }
  $snapshotState = Invoke-AwsJson @(
    "rds", "describe-db-snapshots", "--db-snapshot-identifier", $snapshotIdentifier,
    "--snapshot-type", "manual", "--region", $Region, "--output", "json"
  )
  $completedSnapshot = @($snapshotState.DBSnapshots)[0]
  Assert-Condition ([string]$completedSnapshot.Status -eq "available") `
    "The restore snapshot is not available."
  Assert-Condition ([bool]$completedSnapshot.Encrypted) `
    "The restore snapshot is not encrypted."
  Assert-Condition ([string]$completedSnapshot.DBInstanceIdentifier -eq $sourceDatabaseIdentifier) `
    "The restore snapshot is not bound to the source database."

  Write-Host "Restoring snapshot into isolated instance $restoreIdentifier..."
  & aws rds restore-db-instance-from-db-snapshot `
    --db-instance-identifier $restoreIdentifier `
    --db-snapshot-identifier $snapshotIdentifier `
    --db-instance-class $dbInstanceClass `
    --db-subnet-group-name $databaseSubnetGroup `
    --db-parameter-group-name $databaseParameterGroup `
    --vpc-security-group-ids $databaseSecurityGroup `
    --no-publicly-accessible --no-multi-az --no-deletion-protection `
    --copy-tags-to-snapshot `
    --tags "Key=NalandaRestoreRun,Value=$runId" "Key=SourceRevision,Value=$sourceRevision" `
    --region $Region | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Unable to start RDS restore $restoreIdentifier" }
  $restoreCreated = $true
  & aws rds wait db-instance-available --db-instance-identifier $restoreIdentifier --region $Region
  if ($LASTEXITCODE -ne 0) { throw "Timed out waiting for restored database $restoreIdentifier" }

  $restored = Invoke-AwsJson @(
    "rds", "describe-db-instances", "--db-instance-identifier", $restoreIdentifier,
    "--region", $Region, "--output", "json"
  )
  $restoredInstance = @($restored.DBInstances)[0]
  Assert-Condition ([string]$restoredInstance.DBInstanceStatus -eq "available") `
    "The restored database is not available."
  Assert-Condition (-not [bool]$restoredInstance.PubliclyAccessible) `
    "The restored database unexpectedly has public network access."
  Assert-Condition ([bool]$restoredInstance.StorageEncrypted) `
    "The restored database storage is not encrypted."
  Assert-Condition ([string]$restoredInstance.DBSubnetGroup.DBSubnetGroupName -eq $databaseSubnetGroup) `
    "The restored database is outside the approved data subnet group."
  Assert-Condition ([string]$restoredInstance.DBParameterGroups[0].DBParameterGroupName -eq $databaseParameterGroup) `
    "The restored database does not use the source database parameter group."
  $restoredSecurityGroups = @($restoredInstance.VpcSecurityGroups | ForEach-Object { [string]$_.VpcSecurityGroupId })
  Assert-Condition ($restoredSecurityGroups.Count -eq 1 -and $restoredSecurityGroups[0] -eq $databaseSecurityGroup) `
    "The restored database does not use exactly the approved database security group."
  $restoreEndpoint = [string]$restoredInstance.Endpoint.Address
  if (-not $restoreEndpoint) { throw "Restored database endpoint is unavailable." }
  $restoreElapsed = ((Get-Date).ToUniversalTime() - $startedAt).TotalMinutes
  if ($restoreElapsed -gt $MaxRestoreMinutes) {
    throw "Restore exceeded the $MaxRestoreMinutes minute recovery-time objective."
  }

  Write-Host "Verifying restored data with the deployed application image..."
  $restoreTask = Invoke-VerifierTask `
    @("node", "backend/src/db/verify-backup-restore.mjs", "assert", $runId, $sourceRevision) `
    @{ PGHOST = $restoreEndpoint; PGPOOL_MAX = "1" }
} catch {
  $drillError = $_
} finally {
  if ($markerPrepared) {
    try {
      Invoke-VerifierTask @("node", "backend/src/db/verify-backup-restore.mjs", "cleanup", $runId) | Out-Null
    } catch { $cleanupErrors += "source marker: $($_.Exception.Message)" }
  }
  $retain = $null -ne $drillError -and $KeepFailedResources
  if (-not $retain -and $restoreCreated) {
    try { Remove-RestoredInstance } catch { $cleanupErrors += "restored instance: $($_.Exception.Message)" }
  }
  if (-not $retain -and $snapshotCreated) {
    try { Remove-RunSnapshot } catch { $cleanupErrors += "snapshot: $($_.Exception.Message)" }
  }
}

if ($null -ne $drillError) {
  if ($cleanupErrors.Count -gt 0) { Write-Warning ($cleanupErrors -join "; ") }
  throw $drillError
}
if ($cleanupErrors.Count -gt 0) {
  throw "Restore validation passed, but run-scoped cleanup failed: $($cleanupErrors -join '; ')"
}

$completedAt = (Get-Date).ToUniversalTime()
$evidence = [ordered]@{
  schemaVersion = 1
  capturedAt = $completedAt.ToString("o")
  accountId = [string]$identity.Account
  region = $Region
  stackName = $StackName
  sourceRevision = $sourceRevision
  taskDefinitionArn = $taskDefinition
  containerImage = $containerImage
  sourceDatabaseIdentifier = $sourceDatabaseIdentifier
  snapshotIdentifier = $snapshotIdentifier
  restoredDatabaseIdentifier = $restoreIdentifier
  runId = $runId
  maxRestoreMinutes = $MaxRestoreMinutes
  elapsedMinutes = [math]::Round(($completedAt - $startedAt).TotalMinutes, 2)
  snapshotEncrypted = $true
  restoredStorageEncrypted = $true
  restoredPubliclyAccessible = $false
  databaseParameterGroup = $databaseParameterGroup
  sourceMarkerTask = $sourceTask
  restoredDatabaseTask = $restoreTask
  cleanup = "completed"
  result = "passed"
}
$resolvedEvidencePath = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($EvidencePath)
$evidenceDirectory = Split-Path -Parent $resolvedEvidencePath
if ($evidenceDirectory) { New-Item -ItemType Directory -Force -Path $evidenceDirectory | Out-Null }
$evidence | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $resolvedEvidencePath -Encoding utf8
Write-Host "RDS backup/restore drill passed. Evidence: $resolvedEvidencePath"
