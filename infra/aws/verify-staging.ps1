[CmdletBinding()]
param(
  [string]$Region = "ap-south-1",
  [string]$StackName = "nalanda-staging",
  [string]$ExpectedCustomDomainName = "",
  [string]$ExpectedCloudFrontCertificateArn = "",
  [string]$ExpectedOriginDomainName = "",
  [string]$ExpectedOriginCertificateArn = "",
  [switch]$RequireEndToEndTls,
  [string]$EvidencePath = ""
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Assert-Condition([bool]$Condition, [string]$Message) {
  if (-not $Condition) { throw $Message }
}

function Invoke-AwsJson([string[]]$Arguments) {
  $raw = & aws @Arguments --region $Region --output json
  if ($LASTEXITCODE -ne 0) {
    throw "AWS command failed: aws $($Arguments -join ' ')"
  }
  return ($raw | Out-String | ConvertFrom-Json)
}

function Get-RequiredOutput([hashtable]$Outputs, [string]$Key) {
  $value = [string]$Outputs[$Key]
  if (-not $value -or $value -eq "None") {
    throw "CloudFormation output '$Key' is unavailable."
  }
  return $value
}

$viewerValues = @(@($ExpectedCustomDomainName, $ExpectedCloudFrontCertificateArn) | Where-Object { $_ })
if ($viewerValues.Count -ne 0 -and $viewerValues.Count -ne 2) {
  throw "ExpectedCustomDomainName and ExpectedCloudFrontCertificateArn must be supplied together."
}
$originValues = @(@($ExpectedOriginDomainName, $ExpectedOriginCertificateArn) | Where-Object { $_ })
if ($originValues.Count -ne 0 -and $originValues.Count -ne 2) {
  throw "ExpectedOriginDomainName and ExpectedOriginCertificateArn must be supplied together."
}
if ($originValues.Count -and $viewerValues.Count -ne 2) {
  throw "Origin TLS verification requires the expected custom-domain tuple."
}
if ($RequireEndToEndTls -and ($viewerValues.Count -ne 2 -or $originValues.Count -ne 2)) {
  throw "RequireEndToEndTls requires both expected viewer and origin TLS tuples."
}

$identity = Invoke-AwsJson @("sts", "get-caller-identity")
$stackEnvelope = Invoke-AwsJson @("cloudformation", "describe-stacks", "--stack-name", $StackName)
$stack = @($stackEnvelope.Stacks)[0]
Assert-Condition ($null -ne $stack) "CloudFormation stack '$StackName' was not found."
Assert-Condition (@("CREATE_COMPLETE", "UPDATE_COMPLETE", "IMPORT_COMPLETE") -contains [string]$stack.StackStatus) `
  "Stack '$StackName' is not in a releasable state: $($stack.StackStatus)"

$outputs = @{}
foreach ($output in @($stack.Outputs)) {
  $outputs[[string]$output.OutputKey] = [string]$output.OutputValue
}
$applicationUrl = Get-RequiredOutput $outputs "ApplicationUrl"
$distributionId = Get-RequiredOutput $outputs "CloudFrontDistributionId"
$loadBalancerArn = Get-RequiredOutput $outputs "LoadBalancerArn"
$listenerArn = Get-RequiredOutput $outputs "ApplicationListenerArn"
$loadBalancerSecurityGroupId = Get-RequiredOutput $outputs "LoadBalancerSecurityGroupId"
$originPrefixListId = Get-RequiredOutput $outputs "CloudFrontOriginPrefixListId"
$expectedWebAclArn = Get-RequiredOutput $outputs "RegionalWebAclArn"

$distributionEnvelope = Invoke-AwsJson @("cloudfront", "get-distribution", "--id", $distributionId)
$distribution = $distributionEnvelope.Distribution
$distributionConfig = $distribution.DistributionConfig
Assert-Condition ([string]$distribution.Status -eq "Deployed") `
  "CloudFront distribution '$distributionId' is not deployed."
Assert-Condition ([bool]$distributionConfig.Enabled) `
  "CloudFront distribution '$distributionId' is disabled."

$aliases = @()
$aliasItemsProperty = $distributionConfig.Aliases.PSObject.Properties["Items"]
if ($null -ne $aliasItemsProperty) { $aliases = @($aliasItemsProperty.Value) }
if ($viewerValues.Count -eq 2) {
  Assert-Condition ($aliases -contains $ExpectedCustomDomainName) `
    "CloudFront does not contain the expected application alias."
  Assert-Condition ([string]$distributionConfig.ViewerCertificate.ACMCertificateArn -eq $ExpectedCloudFrontCertificateArn) `
    "CloudFront viewer certificate does not match the expected ARN."
  Assert-Condition ([string]$distributionConfig.ViewerCertificate.MinimumProtocolVersion -eq "TLSv1.2_2021") `
    "CloudFront viewer TLS policy is not TLSv1.2_2021."
  Assert-Condition ([string]$distributionConfig.ViewerCertificate.SSLSupportMethod -eq "sni-only") `
    "CloudFront viewer certificate is not using SNI-only delivery."
} else {
  Assert-Condition ([bool]$distributionConfig.ViewerCertificate.CloudFrontDefaultCertificate) `
    "The fallback distribution is not using the CloudFront default certificate."
}

$origin = @($distributionConfig.Origins.Items | Where-Object { $_.Id -eq "alb" })[0]
Assert-Condition ($null -ne $origin) "CloudFront ALB origin is missing."
$originTlsEnabled = $originValues.Count -eq 2
if ($originTlsEnabled) {
  Assert-Condition ([string]$origin.DomainName -eq $ExpectedOriginDomainName) `
    "CloudFront origin hostname does not match the expected name."
  Assert-Condition ([string]$origin.CustomOriginConfig.OriginProtocolPolicy -eq "https-only") `
    "CloudFront origin protocol is not https-only."
  Assert-Condition ([int]$origin.CustomOriginConfig.HTTPSPort -eq 443) `
    "CloudFront origin HTTPS port is not 443."
  Assert-Condition (@($origin.CustomOriginConfig.OriginSslProtocols.Items) -contains "TLSv1.2") `
    "CloudFront origin protocols do not include TLSv1.2."
} else {
  Assert-Condition ([string]$origin.CustomOriginConfig.OriginProtocolPolicy -eq "http-only") `
    "The staging fallback origin protocol is not http-only."
}

$listenersEnvelope = Invoke-AwsJson @("elbv2", "describe-listeners", "--load-balancer-arn", $loadBalancerArn)
$listeners = @($listenersEnvelope.Listeners)
Assert-Condition ($listeners.Count -eq 1) `
  "The ALB must expose exactly one listener; found $($listeners.Count)."
$listener = $listeners[0]
Assert-Condition ([string]$listener.ListenerArn -eq $listenerArn) `
  "The active ALB listener does not match the stack output."

if ($originTlsEnabled) {
  Assert-Condition ([int]$listener.Port -eq 443 -and [string]$listener.Protocol -eq "HTTPS") `
    "The ALB listener is not HTTPS/443."
  Assert-Condition ([string]$listener.SslPolicy -eq "ELBSecurityPolicy-TLS13-1-2-2021-06") `
    "The ALB listener TLS policy is not the approved policy."
  $certificateEnvelope = Invoke-AwsJson @("elbv2", "describe-listener-certificates", "--listener-arn", $listenerArn)
  $certificateArns = @($certificateEnvelope.Certificates | ForEach-Object { [string]$_.CertificateArn })
  Assert-Condition ($certificateArns -contains $ExpectedOriginCertificateArn) `
    "The ALB listener does not present the expected origin certificate."
} else {
  Assert-Condition ([int]$listener.Port -eq 80 -and [string]$listener.Protocol -eq "HTTP") `
    "The staging fallback listener is not HTTP/80."
}

$securityGroupEnvelope = Invoke-AwsJson @("ec2", "describe-security-groups", "--group-ids", $loadBalancerSecurityGroupId)
$securityGroup = @($securityGroupEnvelope.SecurityGroups)[0]
$ingress = @($securityGroup.IpPermissions)
Assert-Condition ($ingress.Count -eq 1) `
  "The ALB security group must have exactly one ingress rule; found $($ingress.Count)."
$permission = $ingress[0]
$expectedPort = if ($originTlsEnabled) { 443 } else { 80 }
Assert-Condition ([string]$permission.IpProtocol -eq "tcp" -and [int]$permission.FromPort -eq $expectedPort -and [int]$permission.ToPort -eq $expectedPort) `
  "The ALB ingress rule does not match the expected origin port $expectedPort."
$prefixIds = @($permission.PrefixListIds | ForEach-Object { [string]$_.PrefixListId })
Assert-Condition ($prefixIds.Count -eq 1 -and $prefixIds[0] -eq $originPrefixListId) `
  "The ALB ingress rule is not scoped only to the CloudFront origin-facing prefix list."
Assert-Condition (@($permission.IpRanges).Count -eq 0 -and @($permission.Ipv6Ranges).Count -eq 0 -and @($permission.UserIdGroupPairs).Count -eq 0) `
  "The ALB ingress rule contains an unexpected CIDR or security-group source."

$webAclEnvelope = Invoke-AwsJson @("wafv2", "get-web-acl-for-resource", "--resource-arn", $loadBalancerArn)
Assert-Condition ([string]$webAclEnvelope.WebACL.ARN -eq $expectedWebAclArn) `
  "The expected regional WAF is not associated with the ALB."

$ready = $null
for ($attempt = 1; $attempt -le 6; $attempt++) {
  try {
    $ready = Invoke-RestMethod "$applicationUrl/api/ready" -TimeoutSec 15
    if ($ready.ok) { break }
  } catch {
    if ($attempt -eq 6) { throw }
  }
  Start-Sleep -Seconds 10
}
Assert-Condition ([bool]$ready.ok) "Application readiness verification failed."

$evidence = [ordered]@{
  schemaVersion = 1
  generatedAt = (Get-Date).ToUniversalTime().ToString("o")
  accountId = [string]$identity.Account
  region = $Region
  stack = [ordered]@{
    name = $StackName
    status = [string]$stack.StackStatus
  }
  application = [ordered]@{
    url = $applicationUrl
    ready = [bool]$ready.ok
  }
  cloudFront = [ordered]@{
    distributionId = $distributionId
    status = [string]$distribution.Status
    viewerTlsPolicy = [string]$distributionConfig.ViewerCertificate.MinimumProtocolVersion
    applicationAlias = $ExpectedCustomDomainName
    viewerCertificateArn = $ExpectedCloudFrontCertificateArn
    originName = [string]$origin.DomainName
    originProtocolPolicy = [string]$origin.CustomOriginConfig.OriginProtocolPolicy
  }
  loadBalancer = [ordered]@{
    arn = $loadBalancerArn
    listenerArn = $listenerArn
    listenerProtocol = [string]$listener.Protocol
    listenerPort = [int]$listener.Port
    originCertificateArn = $ExpectedOriginCertificateArn
    securityGroupId = $loadBalancerSecurityGroupId
    originPrefixListId = $originPrefixListId
  }
  controls = [ordered]@{
    endToEndTlsRequired = [bool]$RequireEndToEndTls
    endToEndTlsVerified = [bool]$originTlsEnabled
    regionalWebAclArn = [string]$webAclEnvelope.WebACL.ARN
  }
}

$evidenceJson = $evidence | ConvertTo-Json -Depth 8
if ($EvidencePath) {
  $resolvedEvidencePath = if ([System.IO.Path]::IsPathRooted($EvidencePath)) {
    [System.IO.Path]::GetFullPath($EvidencePath)
  } else {
    [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $EvidencePath))
  }
  $evidenceDirectory = Split-Path -Parent $resolvedEvidencePath
  if ($evidenceDirectory) { New-Item -ItemType Directory -Force -Path $evidenceDirectory | Out-Null }
  Set-Content -LiteralPath $resolvedEvidencePath -Value $evidenceJson -Encoding utf8
  Write-Host "AWS staging evidence written to $resolvedEvidencePath"
}

Write-Output $evidenceJson
