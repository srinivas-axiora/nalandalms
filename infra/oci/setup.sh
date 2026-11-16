#!/usr/bin/env bash
# ==============================================================================
# Nalanda LMS — Oracle Cloud Infrastructure (OCI) Automated Setup Script
# Target OS: Ubuntu 22.04 / 24.04 LTS (AArch64 ARM or x86_64)
# ==============================================================================
set -euo pipefail

echo "===================================================================="
echo "  🚀 Starting Nalanda LMS Production Setup on Oracle Cloud"
echo "===================================================================="

# 1. Ensure script is run with sudo or root
if [ "$EUID" -ne 0 ]; then
  echo "[-] Please run as root: sudo bash setup.sh"
  exit 1
fi

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_DIR"

# 2. Update packages and install prerequisites
echo "[+] Updating system packages and installing prerequisites..."
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release iptables-persistent netfilter-persistent openssl git

# 3. Configure Ubuntu host firewall for OCI (Ports 80 & 443)
# Note: Oracle Cloud Ubuntu images include default iptables rules that block incoming ports.
echo "[+] Opening ports 80 (HTTP) and 443 (HTTPS) in host firewall..."
if iptables -C INPUT -p tcp --dport 80 -j ACCEPT 2>/dev/null; then
  echo "    Port 80 already allowed in iptables"
else
  iptables -I INPUT 6 -p tcp --dport 80 -j ACCEPT
fi

if iptables -C INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null; then
  echo "    Port 443 already allowed in iptables"
else
  iptables -I INPUT 6 -p tcp --dport 443 -j ACCEPT
fi

netfilter-persistent save

# 4. Install Docker Engine if not installed
if ! command -v docker &> /dev/null; then
  echo "[+] Installing Docker Engine and Docker Compose plugin..."
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
  chmod a+r /etc/apt/keyrings/docker.gpg

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null

  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable docker
  systemctl start docker
  echo "[+] Docker installed successfully."
else
  echo "[+] Docker is already installed."
fi

# 5. Prepare production .env file
if [ ! -f .env ]; then
  echo "[+] Generating production .env with strong cryptographic secrets..."
  DB_PASSWORD=$(openssl rand -hex 24)
  REDIS_PASSWORD=$(openssl rand -hex 24)
  JWT_SECRET=$(openssl rand -hex 32)
  CERT_SECRET=$(openssl rand -hex 32)
  SUPERADMIN_PASSWORD=$(openssl rand -hex 12)

  cat <<EOF > .env
# Generated on $(date)
NODE_ENV=production
STANDALONE_MODE=1
PORT=8080

# Set your custom domain (e.g. lms.yourdomain.com) for automatic SSL, or leave empty for HTTP
DOMAIN=
ACME_EMAIL=admin@example.com

DB_USER=nalanda
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=nalanda
DATABASE_URL=postgresql://nalanda:${DB_PASSWORD}@postgres:5432/nalanda
PGSSL=disable

REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379

JWT_SECRET=${JWT_SECRET}
CERTIFICATE_SIGNING_SECRET=${CERT_SECRET}

# Seeded admin credentials
SEED_SUPERADMIN_PASSWORD=${SUPERADMIN_PASSWORD}
SEED_ADMIN_PASSWORD=${SUPERADMIN_PASSWORD}

BASE_URL=http://localhost
ALLOWED_ORIGINS=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
EOF
  echo "[+] Created .env file."
else
  echo "[+] Existing .env file found; preserving current credentials."
fi

# 6. Build and start Docker containers
echo "[+] Building and launching Nalanda containers via Docker Compose..."
docker compose pull --ignore-buildable || true
docker compose build
docker compose up -d

echo "[+] Waiting for database to initialize..."
sleep 10

# 7. Apply database schema and seed questions, courses, and intern hiring assessments
echo "[+] Running database bootstrap and seed backfill inside container..."
docker compose exec -T app node backend/src/db/bootstrap.js || {
  echo "[!] Retrying bootstrap after 5s..."
  sleep 5
  docker compose exec -T app node backend/src/db/bootstrap.js
}

docker compose exec -T app node backend/src/db/backfill.js || {
  echo "[!] Retrying backfill after 5s..."
  sleep 5
  docker compose exec -T app node backend/src/db/backfill.js
}

PUBLIC_IP=$(curl -s https://ifconfig.me || curl -s https://api.ipify.org || echo "YOUR-SERVER-IP")

ADMIN_PASS=$(grep '^SEED_SUPERADMIN_PASSWORD=' .env 2>/dev/null | cut -d '=' -f2- || echo "${SUPERADMIN_PASSWORD:-check .env}")

echo "===================================================================="
echo "  🎉 Nalanda LMS is successfully deployed on Oracle Cloud!"
echo "===================================================================="
echo "  • Access URL: http://${PUBLIC_IP}"
echo "  • Super Admin Credentials:"
echo "      - Username: SAnalanda  (or sanalanda@nalanda.local)"
echo "      - Password: ${ADMIN_PASS}"
echo "  • To enable HTTPS with your domain:"
echo "      1. Point your domain DNS (A record) to ${PUBLIC_IP}"
echo "      2. Edit .env and set DOMAIN=lms.yourdomain.com"
echo "      3. Run: docker compose restart caddy"
echo "  • Monitor logs: docker compose logs -f app"
echo "===================================================================="
