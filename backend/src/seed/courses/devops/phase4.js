// Course 8: DevOps Engineering Masterclass - Phase 4: Infrastructure as Code (IaC) & Cloud Architecture
// Chapters 22 to 27 | Assessments 22 to 27 | 60 MCQs

export const phase4 = {
  chapters: [
    {
      id: "CH-DVO-022",
      courseId: "CRS-DVO-001",
      sequence: 22,
      title: "Infrastructure as Code Philosophy & Modern Paradigms",
      description: "Understand IaC principles: Declarative vs Imperative, mutable vs immutable infrastructure, configuration management vs provisioning, and drift management.",
      contentType: "Rich Text",
      durationMinutes: 70,
      minimumTimeMinutes: 45,
      body: `
# Infrastructure as Code Philosophy & Modern Paradigms

Infrastructure as Code (IaC) treats servers, networks, and cloud infrastructure with the same engineering rigor as application software: versioned in Git, tested through CI/CD, peer-reviewed, and automated.

---

## 1. Declarative vs. Imperative IaC

\`\`\`
+--------------------------------------------------------------------------+
| IMPERATIVE (HOW to do it)        | DECLARATIVE (WHAT you want)           |
| (Bash, Python Boto3, AWS CLI)    | (Terraform HCL, CloudFormation, Pulumi|
+--------------------------------------------------------------------------+
| "Step 1: Check if VPC exists"    | "resource 'aws_vpc' 'main' {          |
| "Step 2: If no, call CreateVpc"  |    cidr_block = '10.0.0.0/16'         |
| "Step 3: Wait 10 seconds"        |  }"                                   |
| "Step 4: Tag with Environment"   |                                       |
|                                  | Engine calculates graph & diffs state |
+--------------------------------------------------------------------------+
\`\`\`

---

## 2. Mutable vs. Immutable Infrastructure

- **Mutable Infrastructure (Snowflake Servers):** Servers are updated in-place via SSH or configuration management tools (Ansible, Chef). Over time, configuration drift, orphaned dependencies, and undocumented manual hotfixes accumulate, rendering servers impossible to reproduce reliably.
- **Immutable Infrastructure (Phoenix Servers):** Servers, container images, and AMIs are never patched in place. When changes occur, brand-new machine images or container instances are baked via Packer/Docker, deployed alongside old infrastructure, and traffic is rerouted before terminating the old machines.

---

## 3. Provisioning vs. Configuration Management

| Category | Primary Tools | Core Responsibility |
|---|---|---|
| **Cloud Provisioning** | Terraform, OpenTofu, AWS CloudFormation | Spin up cloud primitives: VPCs, subnets, Kubernetes clusters, RDS databases, IAM roles. |
| **Machine Image Baking** | HashiCorp Packer | Pre-bake secure OS images (AMIs) containing base binaries and security agents. |
| **Configuration Management** | Ansible, SaltStack, Puppet | Install software packages and configure files on long-lived bare-metal servers. |

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/POPP2WTJ8es" title="Infrastructure as Code Explained" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DVO-023",
      courseId: "CRS-DVO-001",
      sequence: 23,
      title: "Terraform Foundations, HCL2 Syntax & Execution Graph",
      description: "Master HashiCorp Configuration Language (HCL2): Providers, resources, data sources, variables, outputs, locals, and directed acyclic execution graphs.",
      contentType: "Rich Text",
      durationMinutes: 80,
      minimumTimeMinutes: 50,
      body: `
# Terraform Foundations, HCL2 Syntax & Execution Graph

HashiCorp Terraform (and open-source OpenTofu) is the dominant enterprise cloud provisioning tool. Understanding HCL2 syntax, variable validation, and Terraform's underlying Directed Acyclic Graph (DAG) is essential for authoring robust infrastructure.

---

## 1. Core HCL2 Architecture & Syntax

\`\`\`hcl
terraform {
  required_version = ">= 1.7.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Input Variable with Custom Validation
variable "environment" {
  type        = string
  description = "Deployment tier"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

# Data Source: Query existing cloud state
data "aws_availability_zones" "available" {
  state = "available"
}

# Local Values for DRY expressions
locals {
  cluster_name = "nova-\${var.environment}-eks"
}

# Resource Definition
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "\${local.cluster_name}-vpc"
  }
}

# Output Value
output "vpc_id" {
  description = "The ID of the provisioned VPC"
  value       = aws_vpc.main.id
}
\`\`\`

---

## 2. The Directed Acyclic Graph (DAG) Execution Model

When you run \`terraform plan\`, Terraform constructs a mathematical dependency graph:
1. Implicit dependencies are detected automatically via attribute references (e.g., \`vpc_id = aws_vpc.main.id\`).
2. Explicit dependencies are declared using \`depends_on = [aws_iam_role_policy_attachment.worker]\`.
3. Independent resources are provisioned concurrently across parallel worker threads (default: 10).

\`\`\`
       aws_vpc.main
      /            \\
     v              v
aws_subnet.public  aws_subnet.private
     \\              /
      v            v
     aws_eks_cluster.main
\`\`\`

---

## 3. The Core Terraform Lifecycle Commands

\`\`\`bash
# Initialize provider plugins and remote backend
terraform init

# Validate syntax and variable constraints
terraform validate

# Generate execution diff comparing declared state vs real cloud state
terraform plan -out=tfplan.binary

# Apply execution plan idempotently
terraform apply tfplan.binary
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/SLB_c_ayRMo" title="Terraform Tutorial for Beginners" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DVO-024",
      courseId: "CRS-DVO-001",
      sequence: 24,
      title: "Terraform State Architecture, Backends & State Manipulation",
      description: "Master Terraform state: remote S3/DynamoDB backends, state locking, state inspection, resource importation, and state surgery.",
      contentType: "Rich Text",
      durationMinutes: 80,
      minimumTimeMinutes: 50,
      body: `
# Terraform State Architecture, Backends & State Manipulation

The \`terraform.tfstate\` file is the brain of Terraform. It maps declared HCL resource identifiers to real-world cloud API resource IDs and metadata. Losing or corrupting state results in orphaned infrastructure and catastrophic blind overrides.

---

## 1. Remote State Backend with S3 & DynamoDB Locking

Storing state locally on an engineer's laptop prevents team collaboration and creates race conditions where two engineers apply changes simultaneously.

\`\`\`hcl
terraform {
  backend "s3" {
    bucket         = "corp-terraform-state-prod"
    key            = "networking/vpc/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-locks" # Enforces atomic state locking
  }
}
\`\`\`

### State Locking Mechanics:
1. When \`terraform plan\` or \`apply\` starts, Terraform writes an execution lock item into the DynamoDB table.
2. If another engineer or CI pipeline attempts to apply simultaneously, Terraform aborts immediately with:
   \`Error: Error acquiring the state lock\`
3. Upon completion, the lock is released atomically.

---

## 2. Advanced State Surgery & Import

When legacy cloud resources were created manually via AWS Console or resources need to be refactored without recreating them:

\`\`\`bash
# List all resources currently tracked in state
terraform state list

# Show raw metadata for a specific tracked resource
terraform state show aws_vpc.main

# Rename or move a resource in state without deleting and recreating it
terraform state mv aws_instance.web aws_instance.api_server

# Import an existing AWS VPC created manually into Terraform state
terraform import aws_vpc.imported vpc-0a1b2c3d4e5f6g7h8

# Remove a resource from state without destroying real cloud infrastructure
terraform state rm aws_s3_bucket.legacy_logs
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/F5Gz1m_xG0U" title="Terraform State Management Deep Dive" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DVO-025",
      courseId: "CRS-DVO-001",
      sequence: 25,
      title: "Terraform Modular Architecture & DRY Patterns",
      description: "Design reusable Terraform modules: module encapsulation, dynamic blocks, for_each expressions, and directory-based environment segregation.",
      contentType: "Rich Text",
      durationMinutes: 75,
      minimumTimeMinutes: 45,
      body: `
# Terraform Modular Architecture & DRY Patterns

Copy-pasting HCL code across multiple environments (dev, staging, prod) leads to configuration drift and maintenance nightmares. Well-architected Terraform platforms leverage modular abstractions following the DRY (Don't Repeat Yourself) principle.

---

## 1. Enterprise Module Structure

\`\`\`
modules/aws-vpc/
  ├── main.tf       # Core resources (VPC, subnets, route tables, IGW, NAT)
  ├── variables.tf  # Input interfaces with types, descriptions, and validations
  ├── outputs.tf    # Output interfaces (vpc_id, private_subnet_ids)
  ├── versions.tf   # Required provider versions
  └── README.md     # Auto-generated documentation (terraform-docs)
\`\`\`

### Calling a Reusable Module:
\`\`\`hcl
module "production_vpc" {
  source = "../../modules/aws-vpc"

  vpc_cidr             = "10.100.0.0/16"
  environment          = "production"
  availability_zones   = ["us-east-1a", "us-east-1b", "us-east-1c"]
  enable_nat_gateway   = true
  single_nat_gateway   = false # High availability: 1 NAT GW per AZ
}
\`\`\`

---

## 2. Advanced HCL Idioms: \`for_each\` & \`dynamic\` Blocks

### Iterating over Maps with \`for_each\`:
\`\`\`hcl
variable "subnets" {
  type = map(object({
    cidr = string
    az   = string
  }))
  default = {
    public_1  = { cidr = "10.0.1.0/24", az = "us-east-1a" }
    public_2  = { cidr = "10.0.2.0/24", az = "us-east-1b" }
  }
}

resource "aws_subnet" "public" {
  for_each          = var.subnets
  vpc_id            = aws_vpc.main.id
  cidr_block        = each.value.cidr
  availability_zone = each.value.az

  tags = {
    Name = each.key
  }
}
\`\`\`

### Constructing Nested Blocks with \`dynamic\`:
\`\`\`hcl
resource "aws_security_group" "alb" {
  name   = "alb-security-group"
  vpc_id = aws_vpc.main.id

  dynamic "ingress" {
    for_each = var.allowed_ingress_rules
    content {
      description = ingress.value.description
      from_port   = ingress.value.port
      to_port     = ingress.value.port
      protocol    = "tcp"
      cidr_blocks = ingress.value.cidrs
    }
  }
}
\`\`\`

---

## 3. Environment Segregation: Workspaces vs. Directories

While Terraform offers built-in **Workspaces** (\`terraform workspace new prod\`), enterprise best practices overwhelmingly favor **Directory-Based Segregation**:
- Workspaces share the exact same backend configuration and code, making it easy to accidentally apply destructive production changes while testing in dev.
- Directory segregation (\`environments/dev\`, \`environments/prod\`) isolates backend state keys, IAM credentials, and module versions completely.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/l5k1ai_GBDE" title="Terraform Modules Tutorial" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DVO-026",
      courseId: "CRS-DVO-001",
      sequence: 26,
      title: "AWS Core Cloud Architecture & Network Topologies",
      description: "Architect secure enterprise AWS environments: multi-AZ VPCs, public/private subnets, Internet Gateways, NAT Gateways, Route 53, and IAM least privilege.",
      contentType: "Rich Text",
      durationMinutes: 85,
      minimumTimeMinutes: 55,
      body: `
# AWS Core Cloud Architecture & Network Topologies

Every cloud-native application relies on a rock-solid cloud infrastructure foundation. Designing resilient, secure AWS architectures requires deep understanding of VPC subnets, routing tables, perimeter gateways, and least-privilege IAM policies.

---

## 1. Enterprise Multi-AZ VPC Architecture

\`\`\`
+-----------------------------------------------------------------------------------+
| AWS CLOUD REGION (e.g., us-east-1)                                                |
| VPC: 10.0.0.0/16                                                                  |
|                                                                                   |
|  INTERNET GATEWAY (IGW) <======================================================+  |
|                                                                                |  |
|  +---------------------------+       +---------------------------+             |  |
|  | AVAILABILITY ZONE A       |       | AVAILABILITY ZONE B       |             |  |
|  |                           |       |                           |             |  |
|  | PUBLIC SUBNET (10.0.1.0)  |       | PUBLIC SUBNET (10.0.2.0)  |             |  |
|  | - Public ALBs             |       | - Public ALBs             |             |  |
|  | - NAT Gateway A --------+ |       | - NAT Gateway B --------+ |             |  |
|  +-------------------------|-+       +-------------------------|-+             |  |
|                            |                                   |               |  |
|  +-------------------------v-+       +-------------------------v-+             |  |
|  | PRIVATE SUBNET (10.0.10.0)|       | PRIVATE SUBNET (10.0.20.0)|             |  |
|  | - EKS Worker Nodes        |       | - EKS Worker Nodes        |             |  |
|  | - Backend Microservices   |       | - Backend Microservices   |             |  |
|  +---------------------------+       +---------------------------+             |  |
|                                                                                |  |
|  +---------------------------+       +---------------------------+             |  |
|  | DATABASE SUBNET(10.0.50.0)|       | DATABASE SUBNET(10.0.60.0)|             |  |
|  | - RDS Aurora Primary      | <---> | - RDS Aurora Read Replica |             |  |
|  | (Zero Internet Access)    |       | (Zero Internet Access)    |             |  |
|  +---------------------------+       +---------------------------+             |  |
+-----------------------------------------------------------------------------------+
\`\`\`

---

## 2. Security Groups vs. Network ACLs (NACLs)

| Characteristic | Security Group (SG) | Network ACL (NACL) |
|---|---|---|
| **Operating Layer** | Virtual Network Interface (ENI) level | Subnet boundary level |
| **Statefulness** | **Stateful:** Return traffic automatically allowed regardless of inbound rules. | **Stateless:** Inbound and outbound traffic must be explicitly permitted. |
| **Rule Types** | ALLOW rules only (Default Deny). | ALLOW and DENY rules evaluated in numerical rule order. |
| **Common Use Case** | Fine-grained microservice firewalling (e.g., allow port 5432 only from app-sg). | Subnet-wide perimeter defense (e.g., blocking malicious CIDR ranges). |

---

## 3. IAM Least-Privilege Trust Policy Architecture

Never grant broad administrative permissions. Services assume roles via short-lived AWS STS credentials:

\`\`\`json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowS3ReadBucketOnly",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::enterprise-data-lake",
        "arn:aws:s3:::enterprise-data-lake/*"
      ]
    }
  ]
}
\`\`\`

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/iaJxC3z_D9w" title="AWS Networking Masterclass - VPC, Subnets, Routing" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
    {
      id: "CH-DVO-027",
      courseId: "CRS-DVO-001",
      sequence: 27,
      title: "Automated IaC Pipelines, Static Analysis & Testing",
      description: "Automate IaC delivery pipelines: Terragrunt orchestration, tflint, checkov/tfsec security scanning, and automated Terratest Go validation.",
      contentType: "Rich Text",
      durationMinutes: 75,
      minimumTimeMinutes: 45,
      body: `
# Automated IaC Pipelines, Static Analysis & Testing

Applying Terraform changes manually from local workstations introduces catastrophic risks of unintended infrastructure destruction. Enterprise platform engineering enforces automated IaC CI/CD pipelines backed by static analysis, security scans, and integration tests.

---

## 1. Enterprise IaC Pipeline Workflow

\`\`\`
DEVELOPER PR ---> 1. FMT & TFLINT   ---> 2. SECURITY SCAN ---> 3. SPECULATIVE PLAN ---> 4. MANUAL APPROVAL ---> 5. APPLY
                  (Syntax & Lint)        (Checkov/Tfsec)       (Posted to PR Diff)      (2 Peer Reviews)       (Main Branch)
\`\`\`

---

## 2. Static Security Scanning with Checkov & tfsec

Detect security misconfigurations (such as unencrypted S3 buckets, open 0.0.0.0/0 SSH rules, or missing CloudTrail logs) *before* applying to the cloud:

\`\`\`bash
# Run Checkov against Terraform directory and fail build on HIGH/CRITICAL issues
checkov -d . --framework terraform --hard-fail-on HIGH,CRITICAL

# Lint HCL for deprecated syntax and provider-specific errors
tflint --init && tflint
\`\`\`

---

## 3. Integration Testing with Terratest (Go)

**Terratest** is a Go library developed by Gruntwork that provisions real infrastructure in an isolated sandbox cloud account, runs assertions against the live endpoints, and terminates all resources cleanly:

\`\`\`go
package test

import (
	"testing"
	"github.com/gruntwork-io/terratest/modules/terraform"
	"github.com/stretchr/testify/assert"
)

func TestTerraformVpcModule(t *testing.T) {
	t.Parallel()

	terraformOptions := terraform.WithDefaultRetryableErrors(t, &terraform.Options{
		TerraformDir: "../modules/aws-vpc",
		Vars: map[string]interface{}{
			"vpc_cidr":    "10.200.0.0/16",
			"environment": "terratest",
		},
	})

	// Defer destruction of provisioned test infrastructure
	defer terraform.Destroy(t, terraformOptions)

	// Run terraform init and terraform apply
	terraform.InitAndApply(t, terraformOptions)

	// Validate output values
	vpcId := terraform.Output(t, terraformOptions, "vpc_id")
	assert.NotEmpty(t, vpcId)
}
\`\`\`

---

## 4. Terragrunt: DRY Terraform Orchestration

**Terragrunt** wraps Terraform to keep backend and provider configurations completely DRY across hundreds of AWS accounts and environments by inheriting root \`terragrunt.hcl\` configurations.

<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; margin: 2rem 0;">
  <iframe src="https://www.youtube.com/embed/u_qC_z_LhF4" title="Automated Terraform Testing & CI/CD" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></iframe>
</div>
      `,
    },
  ],
  assessments: [
    {
      id: "ASM-DVO-022",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-022",
      title: "Infrastructure as Code Philosophy & Paradigms Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 20,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-211",
          type: "MCQ",
          prompt: "What is the defining distinction between declarative and imperative Infrastructure as Code (IaC)?",
          options: [
            "Declarative IaC specifies the desired end-state of infrastructure (what), letting the engine calculate the changes; Imperative IaC specifies the exact sequential procedural steps (how) to execute",
            "Declarative IaC is written in Python; Imperative IaC is written in YAML",
            "Imperative IaC supports cloud providers; Declarative IaC only supports on-premise hardware",
            "Declarative IaC requires rebooting servers after every apply"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-212",
          type: "MCQ",
          prompt: "What is the core principle of 'Immutable Infrastructure'?",
          options: [
            "Servers and environments are never patched or modified in-place; when changes occur, brand-new machine images or containers are deployed and old ones are destroyed",
            "Servers are locked in a physical room with no internet connectivity",
            "Infrastructure cannot be deleted once created",
            "All cloud passwords must remain unchanged for 5 years"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-213",
          type: "MCQ",
          prompt: "What is a 'Snowflake Server' in systems engineering?",
          options: [
            "A server that has undergone countless manual, unrecorded ad-hoc configuration tweaks over time, making it unique and impossible to reproduce reliably",
            "A server running in a refrigerated datacenter",
            "A server that only operates during winter months",
            "A high-availability cluster node that handles peak holiday shopping traffic"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-214",
          type: "MCQ",
          prompt: "How does 'Configuration Drift' occur in cloud environments?",
          options: [
            "When human engineers make out-of-band manual changes via the cloud console or SSH that diverge from the declared IaC codebase in Git",
            "When the earth's tectonic plates move cloud datacenters",
            "When network cables experience electrical interference",
            "When cloud providers upgrade their physical servers"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-215",
          type: "MCQ",
          prompt: "Which tool category does HashiCorp Packer belong to within the modern infrastructure toolchain?",
          options: [
            "Automated Machine Image / Golden AMI baking",
            "Dynamic DNS management",
            "Packet capture and network analysis",
            "Continuous integration test runner"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-216",
          type: "MCQ",
          prompt: "What is the primary difference between Terraform and Ansible?",
          options: [
            "Terraform is optimized for declarative cloud resource provisioning (VPCs, databases, clusters); Ansible is optimized for procedural configuration management and software installation inside servers",
            "Terraform is proprietary; Ansible is public domain",
            "Ansible requires an agent installed on all target machines",
            "Terraform only works on Microsoft Azure"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-217",
          type: "MCQ",
          prompt: "What is 'Idempotency' in the context of infrastructure automation?",
          options: [
            "An operation can be executed multiple times without altering the result beyond the initial application, ensuring desired state is maintained without unintended side effects",
            "The ability to run automation scripts without needing electricity",
            "The process of deleting duplicate database rows",
            "A cryptographic algorithm used for signing Git commits"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-218",
          type: "MCQ",
          prompt: "Why should infrastructure code be stored in version control systems like Git?",
          options: [
            "To enable audit trails, peer code reviews, automated CI/CD validation, and historical rollback of infrastructure changes",
            "To make cloud hosting 100% free of charge",
            "Because cloud providers will not boot VMs without a GitHub link",
            "To automatically convert HCL into Python"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-219",
          type: "MCQ",
          prompt: "What is 'OpenTofu' in the DevOps open-source ecosystem?",
          options: [
            "A community-driven, Linux Foundation-backed open-source fork of Terraform created after HashiCorp changed Terraform's license to BSL",
            "A vegetarian recipe application written in Go",
            "A cloud monitoring dashboard for Kubernetes",
            "A container runtime built to replace containerd"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-220",
          type: "MCQ",
          prompt: "What is meant by the phrase 'Pets vs. Cattle' in modern cloud operations?",
          options: [
            "Treating servers like disposable, automated, and replaceable cattle rather than uniquely named, hand-nurtured, irreplaceable pets",
            "A policy restricting animals from entering datacenter facilities",
            "A system performance metric tracking database throughput",
            "A software architecture pattern for IoT agricultural tracking"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DVO-023",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-023",
      title: "Terraform Foundations, HCL2 Syntax & Execution Graph Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-221",
          type: "MCQ",
          prompt: "What is the primary role of a 'Provider' in Terraform (e.g., hashicorp/aws)?",
          options: [
            "It acts as a plugin translating declarative HCL resource specifications into concrete upstream cloud API calls (e.g., via AWS REST APIs)",
            "It bills the developer's credit card for hosting expenses",
            "It compiles HCL code into C++ machine binaries",
            "It provides physical internet connectivity to the datacenter"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-222",
          type: "MCQ",
          prompt: "What is the difference between a 'resource' and a 'data' block in HCL2?",
          options: [
            "A 'resource' creates, manages, and destroys cloud infrastructure; a 'data' block queries read-only attributes from existing cloud resources outside Terraform's direct management",
            "A 'data' block stores SQL tables; a 'resource' stores files",
            "A 'resource' runs on Linux; a 'data' block runs on Windows",
            "There is no difference; they are exact aliases"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-223",
          type: "MCQ",
          prompt: "How does Terraform determine the order in which resources must be provisioned?",
          options: [
            "By building a Directed Acyclic Graph (DAG) derived from implicit attribute references (e.g., passing a vpc_id to a subnet) and explicit 'depends_on' directives",
            "By reading resources in the strict top-to-bottom order they appear in the file",
            "By sorting resource names alphabetically",
            "By randomly attempting API calls until all succeed"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-224",
          type: "MCQ",
          prompt: "What does the command 'terraform init' accomplish?",
          options: [
            "It initializes the working directory, downloads required provider plugins, sets up the backend storage, and installs child modules",
            "It provisions all declared cloud infrastructure immediately",
            "It deletes all resources in the AWS account",
            "It reboots the developer's computer"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-225",
          type: "MCQ",
          prompt: "What is the purpose of running 'terraform plan -out=tfplan.binary'?",
          options: [
            "It generates a speculative execution plan comparing declared code against real cloud state and saves the exact planned mutations into a deterministic binary file",
            "It formats HCL files according to style guidelines",
            "It encrypts the developer's private SSH keys",
            "It uploads the codebase to the public Terraform Registry"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-226",
          type: "MCQ",
          prompt: "How can you define custom validation rules for an input variable in Terraform?",
          options: [
            "By declaring a 'validation' block inside the variable definition containing a boolean 'condition' and an 'error_message' string",
            "By writing a separate Python unit test script",
            "By asking the user for confirmation via CLI prompts",
            "Validation rules cannot be defined in Terraform"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-227",
          type: "MCQ",
          prompt: "What is the difference between 'variable' and 'local' values in Terraform?",
          options: [
            "'variable' represents configurable input parameters passed from the caller; 'local' values are internal intermediate expressions computed inside the module to avoid duplication",
            "'local' values are stored in the host RAM; 'variables' are stored in the cloud",
            "'variables' can only be integers; 'locals' can only be strings",
            "There is no difference; they are interchangeable"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-228",
          type: "MCQ",
          prompt: "What does the command 'terraform fmt -check' execute in a CI/CD pipeline?",
          options: [
            "It checks whether all HCL files conform to canonical Terraform indentation and formatting conventions without modifying them, returning non-zero if misformatted",
            "It formats the hard drive of the runner machine",
            "It validates whether cloud credentials have expired",
            "It compiles Go code into binaries"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-229",
          type: "MCQ",
          prompt: "When should an explicit 'depends_on' directive be used on a resource?",
          options: [
            "Only when a hidden dependency exists between resources that cannot be inferred automatically by Terraform through attribute references",
            "On every single resource in the project",
            "Only on resources provisioned in the us-east-1 region",
            "Whenever deploying Docker containers"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-230",
          type: "MCQ",
          prompt: "What does setting 'sensitive = true' on an output block achieve?",
          options: [
            "It redacts the output value from raw CLI logs and 'terraform plan/apply' terminal output to prevent leaking credentials",
            "It encrypts the output value using AES-256",
            "It deletes the output value from the tfstate file",
            "It prevents the output from being used by other modules"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DVO-024",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-024",
      title: "Terraform State Architecture & Manipulation Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-231",
          type: "MCQ",
          prompt: "What is the critical function of the 'terraform.tfstate' file?",
          options: [
            "It records the mapping between declarative HCL configuration resources and real-world physical cloud API resource IDs and metadata",
            "It contains the compiled binary code of the application",
            "It tracks the developer's Git commit history",
            "It stores the user's terminal bash command history"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-232",
          type: "MCQ",
          prompt: "Why must teams use an S3 remote backend combined with a DynamoDB table for AWS Terraform deployments?",
          options: [
            "To enable centralized state sharing across engineers and CI pipelines, combined with atomic state locking via DynamoDB to prevent concurrent colliding applies",
            "Because AWS requires DynamoDB to run EC2 instances",
            "Because S3 makes Terraform apply 10 times faster",
            "To automatically convert HCL to CloudFormation"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-233",
          type: "MCQ",
          prompt: "What happens if two engineers execute 'terraform apply' simultaneously against the same state without state locking enabled?",
          options: [
            "A race condition occurs where both write conflicting state data, leading to state corruption and potentially orphaned or duplicate cloud resources",
            "Terraform merges the changes cleanly like Git",
            "The cloud provider shuts down the AWS account",
            "The engineer with higher IAM privilege wins automatically"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-234",
          type: "MCQ",
          prompt: "Which command brings an existing AWS VPC created manually in the AWS Console into Terraform state management?",
          options: [
            "terraform import aws_vpc.main vpc-0a1b2c3d4e5f",
            "terraform pull aws_vpc.main vpc-0a1b2c3d4e5f",
            "terraform adopt aws_vpc.main vpc-0a1b2c3d4e5f",
            "terraform fetch vpc-0a1b2c3d4e5f"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-235",
          type: "MCQ",
          prompt: "How can you refactor a resource name in HCL (e.g., from 'aws_instance.old' to 'aws_instance.new') without Terraform attempting to destroy and recreate the VM?",
          options: [
            "Using the 'terraform state mv aws_instance.old aws_instance.new' command or a 'moved' block in HCL",
            "By renaming the resource and running 'terraform apply --force'",
            "By manually editing the production JSON state file in Notepad",
            "It is impossible; Terraform must always recreate renamed resources"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-236",
          type: "MCQ",
          prompt: "What does the command 'terraform state rm aws_s3_bucket.logs' accomplish?",
          options: [
            "It removes the bucket from Terraform's state tracking so Terraform ceases managing it, without deleting the actual physical S3 bucket in AWS",
            "It deletes the physical S3 bucket and all its files from AWS",
            "It encrypts the bucket with KMS",
            "It creates a backup of the bucket"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-237",
          type: "MCQ",
          prompt: "Why is storing terraform.tfstate files in public Git repositories a catastrophic security vulnerability?",
          options: [
            "Because Terraform state files contain unencrypted, plain-text values of all resource attributes, including database root passwords and private TLS keys",
            "Because Git will automatically delete the file",
            "Because tfstate files exceed GitHub's 100 MB file limit",
            "Because state files corrupt Git merge algorithms"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-238",
          type: "MCQ",
          prompt: "What command displays all resources currently tracked inside the active Terraform state file?",
          options: ["terraform state list", "terraform show --all-resources", "terraform list-state", "terraform status -r"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-239",
          type: "MCQ",
          prompt: "What does 'terraform refresh' (or 'terraform apply -refresh-only') do?",
          options: [
            "It queries the cloud provider APIs to update the state file with the current real-world state of managed infrastructure without proposing changes to the code",
            "It reboots all cloud servers managed by Terraform",
            "It clears the DNS cache on the developer's laptop",
            "It upgrades all provider versions to latest"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-240",
          type: "MCQ",
          prompt: "How can an engineer force release a stale DynamoDB lock if a CI pipeline crashes mid-apply and leaves state locked?",
          options: [
            "terraform force-unlock <LOCK-ID>",
            "terraform break-lock --yes",
            "terraform unlock --all",
            "Delete the AWS account"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DVO-025",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-025",
      title: "Terraform Modular Architecture & DRY Patterns Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-241",
          type: "MCQ",
          prompt: "Why is directory-based environment segregation (e.g., environments/dev, environments/prod) preferred over Terraform Workspaces in enterprise production?",
          options: [
            "Directory segregation provides complete isolation of state backends, access credentials, and module versions, preventing accidental production overrides during dev testing",
            "Workspaces only function on Google Cloud",
            "Directory segregation is required by the Linux kernel",
            "Workspaces do not support variable files"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-242",
          type: "MCQ",
          prompt: "What is the primary advantage of using 'for_each' over 'count' when provisioning a list of resources (like subnets or IAM users)?",
          options: [
            "for_each binds resources to stable keys (maps/sets); removing an item from the middle of the list deletes only that specific item rather than re-indexing and recreating all subsequent items",
            "for_each executes 10x faster than count",
            "count is deprecated in modern Terraform",
            "for_each automatically creates DNS records"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-243",
          type: "MCQ",
          prompt: "What does a 'dynamic' block in HCL2 enable engineers to construct within a resource?",
          options: [
            "Repeatable nested configuration blocks (e.g., dynamic 'ingress' rules inside an aws_security_group) generated dynamically from a collection",
            "Dynamic IP addresses that change every hour",
            "Dynamic RAM allocation for virtual machines",
            "Dynamic compilation of JavaScript code"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-244",
          type: "MCQ",
          prompt: "What three foundational files make up the canonical structure of a reusable Terraform module?",
          options: ["main.tf, variables.tf, and outputs.tf", "index.js, package.json, and README.md", "Dockerfile, docker-compose.yml, and .env", "config.yaml, build.sh, and run.sh"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-245",
          type: "MCQ",
          prompt: "How can you pin a specific version of a module when sourcing it from a Git repository?",
          options: [
            "By appending '?ref=v2.1.0' to the repository source URL (e.g., git::https://github.com/org/modules.git?ref=v2.1.0)",
            "By setting version = 'v2.1.0' inside variables.tf",
            "By naming the folder 'module-v2.1.0'",
            "Git source modules cannot be version pinned"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-246",
          type: "MCQ",
          prompt: "What does the HCL function 'try()' do?",
          options: [
            "It evaluates a sequence of expressions and returns the first one that does not throw an error, useful for handling optional object attributes",
            "It attempts to reboot the server up to 3 times",
            "It runs a speculative compile step",
            "It creates a trial license for cloud software"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-247",
          type: "MCQ",
          prompt: "What is the purpose of the 'terraform-docs' utility in module development?",
          options: [
            "It automatically generates comprehensive markdown documentation tables for all inputs, outputs, providers, and requirements defined in a module",
            "It publishes documentation to Wikipedia",
            "It translates HCL code into English prose",
            "It converts PDF files into Terraform manifests"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-248",
          type: "MCQ",
          prompt: "What is an 'Abstracted Module' (or Wrapper Module)?",
          options: [
            "A company-standardized module that encapsulates multiple low-level cloud resources (e.g., VPC, subnets, NAT, routing, flow logs) enforcing corporate security policies out of the box",
            "A module with no code inside it",
            "A module that only provisions virtual memory",
            "A module that cannot be tested"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-249",
          type: "MCQ",
          prompt: "What occurs if you reference a child module output that was not explicitly defined in the child's 'outputs.tf'?",
          options: [
            "Terraform throws a validation error stating the child module has no output with that attribute name",
            "Terraform searches the child module files and guesses the attribute",
            "Terraform defaults the value to null",
            "Terraform downloads the value from the internet"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-250",
          type: "MCQ",
          prompt: "How does the 'can()' function differ from 'try()' in HCL2?",
          options: [
            "'can()' evaluates an expression and returns a boolean (true if evaluation succeeds, false if it throws an error); 'try()' returns the evaluated value itself",
            "'can()' runs only on AWS; 'try()' runs on Azure",
            "'can()' can only be used with numbers",
            "There is no difference; they are aliases"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DVO-026",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-026",
      title: "AWS Core Cloud Architecture & Network Topologies Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-251",
          type: "MCQ",
          prompt: "What fundamentally distinguishes a 'Public Subnet' from a 'Private Subnet' in an AWS VPC?",
          options: [
            "A public subnet has a direct route in its route table pointing to an Internet Gateway (0.0.0.0/0 -> igw-xxx); a private subnet does not",
            "A public subnet has no firewall rules; a private subnet has firewalls",
            "A public subnet is hosted in a different country than private subnets",
            "A public subnet uses 32-bit CPU instances only"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-252",
          type: "MCQ",
          prompt: "How do backend instances located in a Private Subnet securely initiate outbound internet traffic (e.g., to download OS security patches)?",
          options: [
            "Through a NAT Gateway situated in a Public Subnet that translates private IPs to an Elastic IP",
            "By assigning public IP addresses directly to the private instances",
            "By connecting via Bluetooth to the administrator's phone",
            "Through an inbound peering connection from Google Cloud"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-253",
          type: "MCQ",
          prompt: "What is the critical statefulness difference between AWS Security Groups and Network ACLs (NACLs)?",
          options: [
            "Security Groups are stateful (inbound permitted traffic automatically allows return outbound traffic); NACLs are stateless (inbound and outbound rules must be declared explicitly)",
            "Security Groups are stateless; NACLs are stateful",
            "Security Groups operate at the subnet level; NACLs operate at the ENI level",
            "NACLs only support IPv6"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-254",
          type: "MCQ",
          prompt: "Why should an enterprise production architecture deploy multiple NAT Gateways across Availability Zones (AZs) instead of a single shared NAT Gateway?",
          options: [
            "To achieve High Availability; if an AZ experiences a catastrophic outage, instances in surviving AZs maintain outbound internet access through their local NAT Gateway",
            "Because AWS forbids sharing a NAT Gateway across subnets",
            "Because a single NAT Gateway can only process 10 requests per minute",
            "To reduce AWS billing costs by 50%"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-255",
          type: "MCQ",
          prompt: "What is the role of an AWS IAM 'Trust Policy' (AssumeRolePolicyDocument)?",
          options: [
            "It defines which principals (e.g., an EC2 service, a Lambda function, or an external OIDC provider) are authorized to assume the IAM Role and obtain temporary credentials",
            "It guarantees that AWS will not disclose customer data to governments",
            "It configures SSL/TLS trust stores on worker nodes",
            "It verifies employee background checks before issuing credentials"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-256",
          type: "MCQ",
          prompt: "What does an AWS VPC Endpoint (PrivateLink) allow private subnets to achieve?",
          options: [
            "Privately connecting to AWS services (e.g., S3, DynamoDB, ECR) without requiring traffic to traverse the public internet or pass through a NAT Gateway",
            "Hosting public websites on private IP addresses",
            "Bypassing AWS data transfer billing completely",
            "Connecting physical office printers to EC2 instances"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-257",
          type: "MCQ",
          prompt: "What is an AWS Route 53 'Alias' record?",
          options: [
            "A specialized Route 53 DNS extension that routes traffic directly to AWS resources (ALBs, CloudFront, S3 buckets) without incurring DNS query charges and supporting zone apex records",
            "A fake domain name used for phishing testing",
            "A backup email address for account recovery",
            "A CNAME record that only resolves inside China"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-258",
          type: "MCQ",
          prompt: "In AWS IAM, what does an explicit 'Deny' statement do when evaluated against an 'Allow' statement for the same action?",
          options: [
            "An explicit Deny ALWAYS takes precedence and overrides any and all Allow statements",
            "The Allow statement overrides the Deny if the user is an Admin",
            "AWS averages the permissions and prompts the user",
            "The IAM policy compiler throws a syntax exception"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-259",
          type: "MCQ",
          prompt: "What is the function of AWS Transit Gateway in enterprise multi-account architectures?",
          options: [
            "It acts as a centralized regional network hub connecting hundreds of VPCs and on-premise networks through a single hub-and-spoke model, eliminating full-mesh peering complexity",
            "It provides public Wi-Fi on municipal transit buses",
            "It automates container deployments to Amazon ECS",
            "It encrypts hard drives on laptops"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-260",
          type: "MCQ",
          prompt: "What AWS service records all management, control plane, and API activities executed across an AWS account for compliance and security auditing?",
          options: ["AWS CloudTrail", "Amazon CloudWatch", "AWS X-Ray", "AWS Config standalone"],
          answer: 0,
          points: 10,
        },
      ],
    },
    {
      id: "ASM-DVO-027",
      courseId: "CRS-DVO-001",
      chapterId: "CH-DVO-027",
      title: "Automated IaC Pipelines & Testing Assessment",
      type: "MCQ",
      ownerId: "EMP-1002",
      approval: "Approved",
      difficulty: "Advanced",
      durationMinutes: 25,
      passScore: 70,
      questionLimit: 10,
      questions: [
        {
          id: "Q-DVO-261",
          type: "MCQ",
          prompt: "What is the primary role of static security analysis tools like Checkov and tfsec in IaC pipelines?",
          options: [
            "Scanning Terraform HCL manifests for security misconfigurations, compliance violations, and exposed secrets before any infrastructure is provisioned",
            "Decrypting customer credit card transactions",
            "Simulating distributed denial-of-service (DDoS) traffic",
            "Translating Terraform into Kubernetes manifests"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-262",
          type: "MCQ",
          prompt: "How does Terratest validate Terraform modules?",
          options: [
            "By executing automated Go tests that provision real cloud infrastructure, test HTTP/API responses, and automatically tear down the infrastructure via terraform destroy",
            "By checking spellings in README files",
            "By measuring how many lines of code are written per hour",
            "By compiling HCL into WebAssembly"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-263",
          type: "MCQ",
          prompt: "What is 'TFLint' and why is it run prior to 'terraform plan'?",
          options: [
            "A specialized linter that analyzes HCL code to catch cloud provider-specific errors (e.g., invalid EC2 instance types) and enforces company naming conventions",
            "A tool that compresses HCL code into binary format",
            "A plugin that changes terminal font size",
            "A database migration manager"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-264",
          type: "MCQ",
          prompt: "In a Pull Request (PR) workflow for IaC, what is a 'Speculative Plan'?",
          options: [
            "A non-destructive terraform plan executed automatically on PR creation that posts the proposed infrastructure additions, modifications, and deletions into the PR comments for peer review",
            "A plan created by an AI predicting future stock prices",
            "A plan that deletes test environments automatically",
            "A plan requiring payment to view"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-265",
          type: "MCQ",
          prompt: "Why should automated 'terraform apply' execution be restricted strictly to the default branch (main/master) post-merge?",
          options: [
            "To guarantee that real infrastructure modifications only take place after peer code review approval, automated security scans pass, and a permanent immutable commit is recorded in Git",
            "Because Terraform crashes if executed on feature branches",
            "To save internet bandwidth",
            "Because cloud providers reject API calls from non-main branches"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-266",
          type: "MCQ",
          prompt: "What is the primary function of Terragrunt in enterprise Terraform architectures?",
          options: [
            "Orchestrating multi-module environments, eliminating boilerplate remote state and provider declarations, and managing inter-module dependency execution order",
            "Replacing AWS EC2 with Docker containers",
            "Formatting markdown tables",
            "Generating mock data for unit tests"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-267",
          type: "MCQ",
          prompt: "What tool allows teams to visualize Terraform infrastructure plans as visual architectural diagrams inside CI/CD?",
          options: ["Inframap / Rover", "Postman", "Webpack", "Vite"],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-268",
          type: "MCQ",
          prompt: "What is 'Infracost' and how does it optimize cloud spending in IaC pipelines?",
          options: [
            "It parses Terraform plan diffs in CI/CD and posts an estimated monthly cloud cost breakdown (and delta) directly onto the pull request before changes are applied",
            "It automatically negotiates enterprise discounts with cloud sales reps",
            "It turns off developer laptops at 5 PM",
            "It mines cryptocurrency during build idle time"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-269",
          type: "MCQ",
          prompt: "Why should Terratests always use 'defer terraform.Destroy(t, terraformOptions)' in their test functions?",
          options: [
            "To ensure that all provisioned test cloud infrastructure is destroyed even if assertions fail or tests panic, preventing abandoned cloud resources and runaway costs",
            "Because Go compilers require defer statements to terminate",
            "To send test results to Slack",
            "To reboot the test server"
          ],
          answer: 0,
          points: 10,
        },
        {
          id: "Q-DVO-270",
          type: "MCQ",
          prompt: "What is Atlantis in the context of Terraform GitOps workflows?",
          options: [
            "A self-hosted server application that runs 'terraform plan' and 'terraform apply' directly in response to comments (e.g., 'atlantis apply') posted on Git pull requests",
            "A submerged datacenter off the coast of Scotland",
            "An open-source database engine",
            "A container scanning engine built by Google"
          ],
          answer: 0,
          points: 10,
        },
      ],
    },
  ],
};

