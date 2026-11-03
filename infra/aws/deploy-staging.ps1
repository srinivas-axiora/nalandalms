param(
  [string]$Region = "ap-south-1",
  [string]$StackName = "nalanda-staging",
  [string]$ImageTag = "",
  [switch]$PrepareRelationalDatabase,
  [Parameter(Mandatory = $true)][string]$RazorpayKeyIdSecretArn,
  [Parameter(Mandatory = $true)][string]$RazorpayKeySecretArn,
  [Parameter(Mandatory = $true)][string]$RazorpayWebhookSecretArn
)

$ErrorActionPreference = "Stop"
if (-not $ImageTag) { $ImageTag = (git rev-parse --short=12 HEAD).Trim() }

$identity = aws sts get-caller-identity --region $Region | ConvertFrom-Json
if (-not $identity.Account) { throw "AWS authentication is required." }

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

$image = "$repositoryUri`:$ImageTag"
docker build --platform linux/arm64 --tag $image .
if ($LASTEXITCODE -ne 0) { throw "Container build failed." }
docker push $image
if ($LASTEXITCODE -ne 0) { throw "Container push failed." }

aws cloudformation deploy `
  --template-file infra/aws/staging.yml `
  --stack-name $StackName `
  --region $Region `
  --capabilities CAPABILITY_IAM `
  --no-fail-on-empty-changeset `
  --parameter-overrides `
    "EnvironmentName=$StackName" `
    "ContainerImage=$image" `
    "RazorpayKeyIdSecretArn=$RazorpayKeyIdSecretArn" `
    "RazorpayKeySecretArn=$RazorpayKeySecretArn" `
    "RazorpayWebhookSecretArn=$RazorpayWebhookSecretArn"
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
  $subnets = Get-StackOutput "PublicSubnetIds"
  $securityGroup = Get-StackOutput "ApplicationSecurityGroupId"
  $network = "awsvpcConfiguration={subnets=[$subnets],securityGroups=[$securityGroup],assignPublicIp=ENABLED}"
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

aws cloudformation describe-stacks `
  --stack-name $StackName `
  --region $Region `
  --query "Stacks[0].Outputs" `
  --output table
