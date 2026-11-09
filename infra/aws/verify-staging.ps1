[CmdletBinding()]
param(
  [string]$Region = "ap-south-1",
  [string]$StackName = "nalanda-staging",
  [string]$ExpectedCustomDomainName = "",
  [string]$ExpectedCloudFrontCertificateArn = "",
  [string]$ExpectedOriginDomainName = "",
  [string]$ExpectedOriginCertificateArn = "",
  [Parameter(Mandatory = $true)][string]$ExpectedContainerImage,
  [Parameter(Mandatory = $true)][string]$ExpectedSourceRevision,
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

function Test-SameStringSet([object[]]$Actual, [object[]]$Expected) {
  $difference = @(Compare-Object -ReferenceObject @($Expected | ForEach-Object { [string]$_ } | Sort-Object) `
    -DifferenceObject @($Actual | ForEach-Object { [string]$_ } | Sort-Object))
  return $difference.Count -eq 0
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
if ($ExpectedContainerImage -notmatch '^(?<registry>[^/]+)/(?<repository>[a-z0-9][a-z0-9._/-]{1,255})@(?<digest>sha256:[0-9a-f]{64})$') {
  throw "ExpectedContainerImage must be an ECR image URI pinned to a sha256 digest."
}
$expectedRegistry = [string]$Matches.registry
$expectedRepository = [string]$Matches.repository
$expectedImageDigest = [string]$Matches.digest
if ($ExpectedSourceRevision -notmatch '^[0-9a-f]{40}$') {
  throw "ExpectedSourceRevision must be a full 40-character Git commit."
}

$identity = Invoke-AwsJson @("sts", "get-caller-identity")
Assert-Condition ($expectedRegistry.StartsWith("$($identity.Account).dkr.ecr.$Region.")) `
  "The expected image registry does not belong to the authenticated account and region."
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
$taskDefinitionArn = Get-RequiredOutput $outputs "TaskDefinitionArn"
$clusterName = Get-RequiredOutput $outputs "ClusterName"
$serviceName = Get-RequiredOutput $outputs "ServiceName"
$applicationSecurityGroupId = Get-RequiredOutput $outputs "ApplicationSecurityGroupId"
$applicationSubnetIds = @((Get-RequiredOutput $outputs "ApplicationSubnetIds") -split ",")
$publicSubnetIds = @((Get-RequiredOutput $outputs "PublicSubnetIds") -split ",")
$applicationRouteTableIds = @((Get-RequiredOutput $outputs "ApplicationRouteTableIds") -split ",")
$natGatewayIds = @((Get-RequiredOutput $outputs "NatGatewayIds") -split ",")
$cacheReplicationGroupId = Get-RequiredOutput $outputs "CacheReplicationGroupId"
$deployedSourceRevision = Get-RequiredOutput $outputs "SourceRevision"
Assert-Condition ($deployedSourceRevision -eq $ExpectedSourceRevision) `
  "The stack source revision does not match the expected Git commit."

$cacheEnvelope = Invoke-AwsJson @(
  "elasticache", "describe-replication-groups",
  "--replication-group-id", $cacheReplicationGroupId
)
$cache = @($cacheEnvelope.ReplicationGroups)[0]
Assert-Condition ($null -ne $cache -and [string]$cache.Status -eq "available") `
  "The Redis replication group is not available."
Assert-Condition ([string]$cache.AutomaticFailover -eq "enabled" -and [string]$cache.MultiAZ -eq "enabled") `
  "Redis must have Multi-AZ automatic failover enabled."
Assert-Condition (-not [bool]$cache.ClusterEnabled -and @($cache.NodeGroups).Count -eq 1) `
  "The staging Redis topology must use one non-clustered node group."
$cacheMembers = @($cache.NodeGroups[0].NodeGroupMembers)
Assert-Condition ($cacheMembers.Count -ge 2) `
  "Redis failover requires a primary and at least one replica."
$cacheAvailabilityZones = @()
foreach ($cacheMember in $cacheMembers) {
  $cacheClusterEnvelope = Invoke-AwsJson @(
    "elasticache", "describe-cache-clusters",
    "--cache-cluster-id", [string]$cacheMember.CacheClusterId
  )
  $cacheAvailabilityZones += [string]$cacheClusterEnvelope.CacheClusters[0].PreferredAvailabilityZone
}
$cacheAvailabilityZones = @($cacheAvailabilityZones | Sort-Object -Unique)
Assert-Condition ($cacheAvailabilityZones.Count -ge 2) `
  "Redis primary and replica are not distributed across Availability Zones."

$taskDefinitionEnvelope = Invoke-AwsJson @("ecs", "describe-task-definition", "--task-definition", $taskDefinitionArn)
$taskContainer = @($taskDefinitionEnvelope.taskDefinition.containerDefinitions | Where-Object { $_.name -eq "nalanda" })[0]
Assert-Condition ($null -ne $taskContainer) "The Nalanda task container is missing."
Assert-Condition ([string]$taskContainer.image -eq $ExpectedContainerImage) `
  "The task definition image does not match the expected immutable digest."
$revisionLabel = $null
if ($null -ne $taskContainer.dockerLabels) {
  $revisionLabel = $taskContainer.dockerLabels.PSObject.Properties["org.opencontainers.image.revision"]
}
Assert-Condition ($null -ne $revisionLabel -and [string]$revisionLabel.Value -eq $ExpectedSourceRevision) `
  "The task definition source-revision label does not match the expected Git commit."

$serviceEnvelope = Invoke-AwsJson @("ecs", "describe-services", "--cluster", $clusterName, "--services", $serviceName)
$service = @($serviceEnvelope.services)[0]
Assert-Condition ($null -ne $service -and [string]$service.status -eq "ACTIVE") `
  "The ECS service is not active."
Assert-Condition ([string]$service.taskDefinition -eq $taskDefinitionArn) `
  "The ECS service is not running the stack task definition."
Assert-Condition ([int]$service.desiredCount -eq 1 -and [int]$service.runningCount -eq 1 -and [int]$service.pendingCount -eq 0) `
  "The single-writer staging service is not at a stable 1/1 task count."
$primaryDeployment = @($service.deployments | Where-Object { $_.status -eq "PRIMARY" })[0]
Assert-Condition ($null -ne $primaryDeployment -and [string]$primaryDeployment.rolloutState -eq "COMPLETED") `
  "The ECS primary deployment has not completed."
$serviceNetwork = $service.networkConfiguration.awsvpcConfiguration
Assert-Condition ([string]$serviceNetwork.assignPublicIp -eq "DISABLED") `
  "The ECS service still assigns public IP addresses."
Assert-Condition (Test-SameStringSet -Actual @($serviceNetwork.subnets) -Expected $applicationSubnetIds) `
  "The ECS service is not attached to the expected private application subnets."
Assert-Condition (Test-SameStringSet -Actual @($serviceNetwork.securityGroups) -Expected @($applicationSecurityGroupId)) `
  "The ECS service security groups do not match the expected application group."

$subnetEnvelope = Invoke-AwsJson (@("ec2", "describe-subnets", "--subnet-ids") + $applicationSubnetIds + $publicSubnetIds)
$allNetworkSubnets = @($subnetEnvelope.Subnets)
$applicationSubnets = @($allNetworkSubnets | Where-Object { $applicationSubnetIds -contains $_.SubnetId })
$publicSubnets = @($allNetworkSubnets | Where-Object { $publicSubnetIds -contains $_.SubnetId })
Assert-Condition ($applicationSubnets.Count -eq 2) `
  "Expected two private application subnets; found $($applicationSubnets.Count)."
Assert-Condition (@($applicationSubnets | Where-Object { [bool]$_.MapPublicIpOnLaunch }).Count -eq 0) `
  "An application subnet still maps public IP addresses on launch."
Assert-Condition ($publicSubnets.Count -eq 2) `
  "Expected two public ingress/NAT subnets; found $($publicSubnets.Count)."

$natEnvelope = Invoke-AwsJson (@("ec2", "describe-nat-gateways", "--nat-gateway-ids") + $natGatewayIds)
$natGateways = @($natEnvelope.NatGateways)
Assert-Condition ($natGateways.Count -eq 2 -and @($natGateways | Where-Object { $_.State -ne "available" }).Count -eq 0) `
  "Both application NAT gateways must be available."
Assert-Condition (Test-SameStringSet -Actual @($natGateways | ForEach-Object { $_.SubnetId }) -Expected $publicSubnetIds) `
  "The NAT gateways are not placed one-per-public-subnet."

$routeEnvelope = Invoke-AwsJson (@("ec2", "describe-route-tables", "--route-table-ids") + $applicationRouteTableIds)
$routeTables = @($routeEnvelope.RouteTables)
Assert-Condition ($routeTables.Count -eq 2) `
  "Expected two application route tables; found $($routeTables.Count)."
$verifiedApplicationSubnets = @()
$verifiedNatGatewayIds = @()
foreach ($routeTable in $routeTables) {
  $subnetAssociation = @($routeTable.Associations | Where-Object { $applicationSubnetIds -contains $_.SubnetId })[0]
  Assert-Condition ($null -ne $subnetAssociation) `
    "An application route table is not associated with an expected private subnet."
  $defaultRoute = @($routeTable.Routes | Where-Object {
    $_.DestinationCidrBlock -eq "0.0.0.0/0" -and $_.State -eq "active" -and $natGatewayIds -contains $_.NatGatewayId
  })[0]
  Assert-Condition ($null -ne $defaultRoute) `
    "An application route table lacks an active default route through an expected NAT gateway."
  $applicationSubnet = @($applicationSubnets | Where-Object { $_.SubnetId -eq $subnetAssociation.SubnetId })[0]
  $natGateway = @($natGateways | Where-Object { $_.NatGatewayId -eq $defaultRoute.NatGatewayId })[0]
  $natPublicSubnet = @($publicSubnets | Where-Object { $_.SubnetId -eq $natGateway.SubnetId })[0]
  Assert-Condition ($null -ne $applicationSubnet -and $null -ne $natPublicSubnet `
    -and [string]$applicationSubnet.AvailabilityZone -eq [string]$natPublicSubnet.AvailabilityZone) `
    "An application subnet routes through a NAT gateway in a different Availability Zone."
  $verifiedApplicationSubnets += [string]$applicationSubnet.SubnetId
  $verifiedNatGatewayIds += [string]$natGateway.NatGatewayId
}
Assert-Condition ((Test-SameStringSet -Actual $verifiedApplicationSubnets -Expected $applicationSubnetIds) `
  -and (Test-SameStringSet -Actual $verifiedNatGatewayIds -Expected $natGatewayIds)) `
  "Application routing does not cover each private subnet and NAT gateway exactly once."

$scanEnvelope = Invoke-AwsJson @(
  "ecr", "describe-image-scan-findings",
  "--repository-name", $expectedRepository,
  "--image-id", "imageDigest=$expectedImageDigest",
  "--no-paginate"
)
$scanStatus = [string]$scanEnvelope.imageScanStatus.status
Assert-Condition (@("COMPLETE", "ACTIVE") -contains $scanStatus) `
  "The deployed image scan is not complete or active: $scanStatus"
$severityCounts = $null
$severityProperty = $scanEnvelope.imageScanFindings.PSObject.Properties["findingSeverityCounts"]
if ($null -ne $severityProperty) { $severityCounts = $severityProperty.Value }
$criticalProperty = if ($null -ne $severityCounts) { $severityCounts.PSObject.Properties["CRITICAL"] } else { $null }
$highProperty = if ($null -ne $severityCounts) { $severityCounts.PSObject.Properties["HIGH"] } else { $null }
$criticalFindings = if ($null -eq $criticalProperty) { 0 } else { [int]$criticalProperty.Value }
$highFindings = if ($null -eq $highProperty) { 0 } else { [int]$highProperty.Value }
Assert-Condition ($criticalFindings -eq 0 -and $highFindings -eq 0) `
  "The deployed image scan contains $criticalFindings critical and $highFindings high findings."

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
  supplyChain = [ordered]@{
    sourceRevision = $ExpectedSourceRevision
    taskDefinitionArn = $taskDefinitionArn
    containerImage = $ExpectedContainerImage
    imageDigest = $expectedImageDigest
    imageScanStatus = $scanStatus
    criticalFindings = $criticalFindings
    highFindings = $highFindings
    desiredTasks = [int]$service.desiredCount
    runningTasks = [int]$service.runningCount
    rolloutState = [string]$primaryDeployment.rolloutState
  }
  network = [ordered]@{
    assignPublicIp = [string]$serviceNetwork.assignPublicIp
    applicationSubnetIds = $applicationSubnetIds
    applicationSecurityGroupId = $applicationSecurityGroupId
    natGatewayIds = $natGatewayIds
    applicationRouteTableIds = $applicationRouteTableIds
    activeNatDefaultRoutes = $verifiedNatGatewayIds.Count
    sameZoneNatRoutingVerified = $true
  }
  cacheResilience = [ordered]@{
    replicationGroupId = $cacheReplicationGroupId
    status = [string]$cache.Status
    automaticFailover = [string]$cache.AutomaticFailover
    multiAZ = [string]$cache.MultiAZ
    memberCount = $cacheMembers.Count
    availabilityZones = $cacheAvailabilityZones
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
