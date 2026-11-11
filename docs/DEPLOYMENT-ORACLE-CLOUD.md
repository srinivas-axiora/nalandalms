# Nalanda LMS — Oracle Cloud Infrastructure (OCI) Deployment Guide

This guide walks you through deploying Nalanda LMS on **Oracle Cloud Infrastructure (OCI) Always Free Tier**.

With OCI's Always Free tier, you can run the complete system (React Frontend, Node.js API, PostgreSQL 16, Redis 7, and Caddy Reverse Proxy with Automatic SSL) at **$0/month indefinitely**, backed by enterprise-grade hardware (up to 4 ARM cores and 24 GB RAM).

---

## 1. Prerequisites & Specifications

* **Oracle Cloud Account**: Sign up at [oracle.com/cloud/free](https://www.oracle.com/cloud/free/) (Free Tier).
* **Recommended Free Shape**:
  - **Instance Shape**: `VM.Standard.A1.Flex` (Ampere Altra ARM64 processor)
  - **OCPUs**: 2 to 4 cores (Always Free covers up to 4 cores)
  - **Memory**: 12 to 24 GB RAM (Always Free covers up to 24 GB)
  - **Boot Volume**: 100 GB to 200 GB NVMe (Always Free covers up to 200 GB)
  - **Operating System**: **Ubuntu 24.04 Minimal LTS** (aarch64)

---

## 2. Step 1: Provision the VM Instance in OCI Console

1. Log into your [Oracle Cloud Console](https://cloud.oracle.com/).
2. Navigate to **Compute** &rarr; **Instances** &rarr; Click **Create Instance**.
3. **Configure the Instance**:
   * **Name**: `nalanda-production`
   * **Placement**: Select any Availability Domain that shows *Always Free Eligible*.
   * **Image and Shape**:
     - Image: Click **Change Image** &rarr; Select **Canonical Ubuntu 24.04** (or 22.04).
     - Shape: Click **Change Shape** &rarr; Select **Ampere** &rarr; `VM.Standard.A1.Flex` &rarr; Set OCPUs to **4** and Memory to **24 GB** (or 2 OCPU / 12 GB).
   * **Networking**: Select your default Virtual Cloud Network (VCN) and public subnet. Ensure **Assign a public IPv4 address** is set to **Yes**.
   * **Add SSH Keys**: Select **Generate a key pair for me** &rarr; Click **Save Private Key** (download `ssh-key-*.key` to your computer).
   * **Boot Volume**: Set size to `100` or `200` GB.
4. Click **Create** and wait 60 seconds for the state to turn **Running**. Note your **Public IP Address**.

---

## 3. Step 2: Open Ingress Ports 80 and 443 in OCI Security List

By default, OCI blocks incoming web traffic. You must add an Ingress rule:

1. In the Instance details page, click on your **Subnet** (e.g. `Public Subnet-...`).
2. Click on the **Default Security List for ...**.
3. Under **Ingress Rules**, click **Add Ingress Rules**:
   * **Source CIDR**: `0.0.0.0/0`
   * **IP Protocol**: `TCP`
   * **Destination Port Range**: `80, 443`
   * **Description**: `HTTP and HTTPS for Nalanda LMS`
4. Click **Add Ingress Rules**.

---

## 4. Step 3: Connect to the Server via SSH

Open your terminal (PowerShell, macOS Terminal, or Linux):

```bash
# Set proper permissions on your private key (Linux/macOS)
chmod 400 /path/to/your-private-key.key

# Connect as ubuntu user
ssh -i /path/to/your-private-key.key ubuntu@<YOUR_OCI_PUBLIC_IP>
```

---

## 5. Step 4: Run the One-Command Setup Script

Once logged into your Ubuntu VM, run the following commands:

```bash
# 1. Clone the repository
git clone https://github.com/ntor-TJ/nalandalms.git /home/ubuntu/nalanda
cd /home/ubuntu/nalanda

# 2. Make the setup script executable and run it
chmod +x infra/oci/setup.sh
sudo bash infra/oci/setup.sh
```

### What `setup.sh` does automatically:
1. Installs Docker Engine and the Docker Compose plugin.
2. Configures the Ubuntu host firewall (`iptables`) to accept traffic on ports 80 and 443.
3. Generates high-entropy cryptographic keys for `JWT_SECRET`, `CERTIFICATE_SIGNING_SECRET`, PostgreSQL, and Redis in `.env`.
4. Builds the production multi-stage Docker container.
5. Starts PostgreSQL, Redis, Nalanda, and Caddy reverse proxy.
6. Executes `bootstrap.js` and `backfill.js` to seed:
   - All **18 Industry Specialization Courses** (Java, Python, React, AI/ML, DevOps, etc.).
   - The **312 Question & Answer Library** across 12 domains.
   - The **4 Intern Hiring Draft Assessments**.

---

## 6. Step 5: Accessing Your Application

Immediately after the script finishes, Nalanda is live:

* **Direct HTTP**: Open `http://<YOUR_OCI_PUBLIC_IP>` in your browser.
* **Super Admin Login**:
  - Email: `admin@nalanda.edu` (or `SAnalanda`)
  - Password: `Password123!` (or the configured `SEED_SUPERADMIN_PASSWORD`).

---

## 7. Step 6: Setting Up Free Automatic HTTPS (SSL) with Your Custom Domain

To enable automatic SSL/TLS via Let's Encrypt:

1. **Point your domain DNS**: In your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.), add an **A Record**:
   - Host / Name: `lms` (or `@`)
   - Value / Points to: `<YOUR_OCI_PUBLIC_IP>`
2. **Update `.env`**:
   ```bash
   nano /home/ubuntu/nalanda/.env
   ```
   Set your domain and email:
   ```env
   DOMAIN=lms.yourdomain.com
   ACME_EMAIL=your-email@example.com
   BASE_URL=https://lms.yourdomain.com
   ALLOWED_ORIGINS=https://lms.yourdomain.com
   ```
3. **Restart Caddy**:
   ```bash
   docker compose restart caddy
   ```
   Caddy automatically provisions a trusted Let's Encrypt SSL certificate and redirects HTTP to HTTPS.

---

## 8. Management & Operations Runbook

### View Live Container Logs
```bash
# Real-time application logs
docker compose logs -f app

# Caddy web server logs
docker compose logs -f caddy

# Database logs
docker compose logs -f postgres
```

### Database Backups (pg_dump)
```bash
# Create an instant timestamped backup
docker compose exec -T postgres pg_dump -U nalanda nalanda > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore a backup
docker compose exec -T postgres psql -U nalanda nalanda < backup_file.sql
```

### Updating to the Latest Code
```bash
cd /home/ubuntu/nalanda
git pull origin main
docker compose up -d --build
```
