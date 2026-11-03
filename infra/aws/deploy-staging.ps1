param(
  [string]$Region = "ap-south-1",
  [string]$StackName = "nalanda-staging",
  [string]$ImageTag = "",
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

aws cloudformation describe-stacks `
  --stack-name $StackName `
  --region $Region `
  --query "Stacks[0].Outputs" `
  --output table
