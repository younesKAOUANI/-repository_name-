#!/usr/bin/env bash
# Pharmapedia - Improved Automated Deployment Script
# Supports non-interactive (CI/CD) mode, modern `docker compose` plugin,
# readiness checks, secure .env handling, and safer defaults.
# Run this from the project root on your production server.

set -euo pipefail
IFS=$'\n\t'

# Default configuration
AUTO=false
COMPOSE_FILE="docker-compose.yml"
PROJECT_NAME="pharmapedia"
ENV_FILE=".env"
DB_SERVICE_NAME="postgres"
DB_USER="pharmapedia"
DB_NAME="pharmapedia"
MAX_DB_WAIT_SECONDS=120
PRUNE_AFTER_DEPLOY=false
INSTALL_CERTBOT=false

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

usage() {
  cat <<EOF
Usage: $0 [options]

Options:
  --auto                 Run non-interactive (CI/CD friendly). Skips prompts.
  --compose <file>       Use a specific docker compose file (default: docker-compose.yml).
  --project <name>       Docker compose project name (default: pharmapedia).
  --env <file>           Env file path (default: .env).
  --prune                Prune unused docker resources after deploy.
  --certbot              Attempt to run certbot for Let's Encrypt (only if Nginx setup selected and domain configured).
  -h, --help             Show this help and exit.

Examples:
  $0 --auto --compose docker-compose.nginx.yml --project pharmapedia
EOF
}

# Parse CLI args
while [[ ${#} -gt 0 ]]; do
  case "$1" in
    --auto) AUTO=true; shift ;;
    --compose) COMPOSE_FILE="$2"; shift 2 ;;
    --project) PROJECT_NAME="$2"; shift 2 ;;
    --env) ENV_FILE="$2"; shift 2 ;;
    --prune) PRUNE_AFTER_DEPLOY=true; shift ;;
    --certbot) INSTALL_CERTBOT=true; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo -e "${RED}Unknown option: $1${NC}"; usage; exit 1 ;;
  esac
done

# Helpers
log() { echo -e "${GREEN}[INFO]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
err() { echo -e "${RED}[ERROR]${NC} $*"; }

# Ensure not running as root
if [ "${EUID:-$(id -u)}" -eq 0 ]; then
  err "Please do NOT run this script as root. Run as a regular user with sudo privileges."
  exit 1
fi

# Locate docker compose command: prefer `docker compose` plugin then fallback to `docker-compose`
COMPOSE_CMD=""
if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
else
  COMPOSE_CMD="docker compose" # we'll attempt to install plugin later if needed
fi

log "Using compose command: ${COMPOSE_CMD}"

# Print versions (if available)
if command -v docker >/dev/null 2>&1; then
  docker --version || true
fi
if ${COMPOSE_CMD} version >/dev/null 2>&1; then
  ${COMPOSE_CMD} version || true
fi

# Check and install Docker if missing (best-effort; assumes Debian/Ubuntu when installing via apt)
if ! command -v docker >/dev/null 2>&1; then
  warn "Docker not found. Attempting to install (interactive sudo may be required)."
  if [ "$AUTO" = true ]; then
    err "Automatic Docker install in --auto mode is disabled. Please install Docker manually and re-run.";
    exit 1
  fi

  read -p "Install Docker now using convenience script? [y/N]: " install_docker_choice || true
  install_docker_choice=${install_docker_choice:-N}
  if [[ "$install_docker_choice" =~ ^[Yy]$ ]]; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker "$USER" || true
    rm -f get-docker.sh
    log "Docker installed (you may need to logout/login for group changes to take effect)."
  else
    err "Docker is required. Aborting."
    exit 1
  fi
fi

# If compose plugin is not available, try to install fallback docker-compose binary (ask user unless --auto)
if ! ${COMPOSE_CMD} version >/dev/null 2>&1; then
  warn "Docker Compose plugin not available."
  if command -v docker-compose >/dev/null 2>&1; then
    COMPOSE_CMD="docker-compose"
  else
    if [ "$AUTO" = true ]; then
      warn "Attempting non-interactive install of docker-compose binary."
      sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
      sudo chmod +x /usr/local/bin/docker-compose
      COMPOSE_CMD="docker-compose"
    else
      read -p "Install docker-compose binary now? [y/N]: " install_compose_choice || true
      install_compose_choice=${install_compose_choice:-N}
      if [[ "$install_compose_choice" =~ ^[Yy]$ ]]; then
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        COMPOSE_CMD="docker-compose"
      else
        warn "You can also use Docker's compose plugin (docker compose). Aborting for now."
        exit 1
      fi
    fi
  fi
fi

log "Final compose command: ${COMPOSE_CMD}"

# Validate compose file exists
if [ ! -f "${COMPOSE_FILE}" ]; then
  err "Compose file ${COMPOSE_FILE} not found in $(pwd)."
  exit 1
fi

# Create .env if missing (with secure permissions). Non-interactive behavior respects --auto.
if [ ! -f "${ENV_FILE}" ]; then
  log "${ENV_FILE} not found — creating one with strong random secrets."
  POSTGRES_PASS=$(openssl rand -base64 24 || head -c 32 /dev/urandom | base64)
  REDIS_PASS=$(openssl rand -base64 24 || head -c 32 /dev/urandom | base64)
  NEXTAUTH_SECRET=$(openssl rand -base64 32 || head -c 48 /dev/urandom | base64)

  cat > "${ENV_FILE}" <<EOF
# Generated on $(date -u +"%Y-%m-%dT%H:%M:%SZ")
# Edit the values below before going to production (especially NEXTAUTH_URL, SMTP settings and domain).

# Database
POSTGRES_PASSWORD=${POSTGRES_PASS}
DATABASE_URL=postgresql://${DB_USER}:${POSTGRES_PASS}@${DB_SERVICE_NAME}:5432/${DB_NAME}

# Redis
REDIS_PASSWORD=${REDIS_PASS}
REDIS_URL=redis://:${REDIS_PASS}@redis:6379

# NextAuth
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=http://localhost

# Application
NODE_ENV=production
EOF

  chmod 600 "${ENV_FILE}"
  log "${ENV_FILE} created and chmod 600 applied."

  if [ "$AUTO" = false ]; then
    echo -e "${YELLOW}Please review and update ${ENV_FILE} (NEXTAUTH_URL, SMTP settings, domain names) before continuing.${NC}"
    read -p "Press Enter to continue after editing (or Ctrl+C to abort)..." || true
  else
    warn "Running in --auto mode: using generated ${ENV_FILE}. Remember to update NEXTAUTH_URL and SMTP settings later."
  fi
else
  log "${ENV_FILE} already exists — leaving it unchanged."
fi

# Ask user which deployment type if using interactive mode and compose file seems generic
if [ "$AUTO" = false ]; then
  if [[ "${COMPOSE_FILE}" == *nginx* ]]; then
    log "Nginx compose file detected: ${COMPOSE_FILE}"
  else
    log "Using compose file: ${COMPOSE_FILE}"
  fi
fi

# Build and start containers
log "Building Docker images..."
${COMPOSE_CMD} -f "${COMPOSE_FILE}" --project-name "${PROJECT_NAME}" build --pull

log "Starting containers in detached mode..."
${COMPOSE_CMD} -f "${COMPOSE_FILE}" --project-name "${PROJECT_NAME}" up -d

# Wait for DB readiness using pg_isready inside the db container (best-effort). We'll poll until timeout.
start_time=$(date +%s)
if ${COMPOSE_CMD} -f "${COMPOSE_FILE}" --project-name "${PROJECT_NAME}" ps --services | grep -q "${DB_SERVICE_NAME}"; then
  log "Waiting for database service '${DB_SERVICE_NAME}' to be ready (timeout: ${MAX_DB_WAIT_SECONDS}s)..."
  while true; do
    now=$(date +%s)
    elapsed=$((now - start_time))
    if [ $elapsed -ge ${MAX_DB_WAIT_SECONDS} ]; then
      warn "Timed out waiting for database readiness after ${MAX_DB_WAIT_SECONDS} seconds. Proceeding anyway; migrations may fail."
      break
    fi

    # Try pg_isready via docker compose exec. Use -T to avoid tty allocation in non-interactive contexts.
    if ${COMPOSE_CMD} -f "${COMPOSE_FILE}" --project-name "${PROJECT_NAME}" exec -T "${DB_SERVICE_NAME}" pg_isready -U "${DB_USER}" >/dev/null 2>&1; then
      log "Database appears ready (pg_isready ok)."
      break
    fi

    # Fallback: if pg_isready not present or exec fails, try connecting from host to the mapped port 5432
    sleep 3
  done
else
  warn "Database service '${DB_SERVICE_NAME}' not found in compose; skipping explicit readiness checks."
fi

# Run migrations (best-effort). Use docker compose exec -T to run commands in app container.
log "Running database migrations (prisma migrate deploy)..."
if ${COMPOSE_CMD} -f "${COMPOSE_FILE}" --project-name "${PROJECT_NAME}" exec -T app npx prisma migrate deploy; then
  log "Migrations finished successfully."
else
  warn "Migrations exited with non-zero status. Check logs: ${COMPOSE_CMD} -f ${COMPOSE_FILE} --project-name ${PROJECT_NAME} logs app"
fi

# Optional seeding in interactive mode
if [ "$AUTO" = false ]; then
  read -p "Do you want to seed the database with test data? (y/N): " seed_choice || true
  seed_choice=${seed_choice:-N}
  if [[ "$seed_choice" =~ ^[Yy]$ ]]; then
    log "Seeding database..."
    ${COMPOSE_CMD} -f "${COMPOSE_FILE}" --project-name "${PROJECT_NAME}" exec -T app npm run db:seed || warn "Seeding task exited with non-zero status."
  fi
fi

# Check container status
log "Container status:"
${COMPOSE_CMD} -f "${COMPOSE_FILE}" --project-name "${PROJECT_NAME}" ps

# Health check: test the app health endpoint. Try common URLs.
log "Performing HTTP health checks..."
sleep 3
if curl -fsS --max-time 5 http://localhost:3000/api/health >/dev/null 2>&1; then
  log "Health check OK at http://localhost:3000/api/health"
elif curl -fsS --max-time 5 http://localhost/api/health >/dev/null 2>&1; then
  log "Health check OK via proxy at http://localhost/api/health"
else
  warn "Health check failed. Check application logs: ${COMPOSE_CMD} -f ${COMPOSE_FILE} --project-name ${PROJECT_NAME} logs app"
fi

# Optional Certbot (only when nginx compose is used and domain configured). This is a helper prompt only.
if [ "$INSTALL_CERTBOT" = true ]; then
  if [[ "${COMPOSE_FILE}" == *nginx* ]]; then
    if [ "$AUTO" = true ]; then
      warn "--certbot requested in --auto mode: please ensure domain and nginx config are prepared. Skipping automatic certbot to avoid unsafe defaults."
    else
      read -p "Would you like to attempt to obtain Let's Encrypt certificates now using certbot? (y/N): " cert_choice || true
      cert_choice=${cert_choice:-N}
      if [[ "$cert_choice" =~ ^[Yy]$ ]]; then
        log "Attempting certbot flow (you must have domain's A record pointing to this server)."
        sudo apt-get update && sudo apt-get install -y certbot
        sudo certbot --nginx || warn "certbot exited with non-zero status or requires manual steps."
      fi
    fi
  else
    warn "--certbot specified but compose filename does not look like an nginx setup. Skipping."
  fi
fi

# Post-deploy prune
if [ "$PRUNE_AFTER_DEPLOY" = true ]; then
  if [ "$AUTO" = false ]; then
    read -p "Prune unused Docker objects to reclaim disk space? (This will remove unused images/volumes) (y/N): " prune_choice || true
    prune_choice=${prune_choice:-N}
    if [[ "$prune_choice" =~ ^[Yy]$ ]]; then
      sudo docker system prune -f
    fi
  else
    # non-interactive automatic prune
    sudo docker system prune -f
  fi
fi

# Summary
cat <<EOF
${GREEN}========================================${NC}
${GREEN}   Deployment Summary                  ${NC}
${GREEN}========================================${NC}
Compose File: ${COMPOSE_FILE}
Project Name: ${PROJECT_NAME}
Env File: ${ENV_FILE}

Useful Commands:
  • View logs:    ${YELLOW}${COMPOSE_CMD} -f ${COMPOSE_FILE} --project-name ${PROJECT_NAME} logs -f${NC}
  • Stop:         ${YELLOW}${COMPOSE_CMD} -f ${COMPOSE_FILE} --project-name ${PROJECT_NAME} down${NC}
  • Restart:      ${YELLOW}${COMPOSE_CMD} -f ${COMPOSE_FILE} --project-name ${PROJECT_NAME} restart${NC}
  • Update:       ${YELLOW}git pull && ${COMPOSE_CMD} -f ${COMPOSE_FILE} --project-name ${PROJECT_NAME} up -d --build${NC}

Next Steps:
  1. Update NEXTAUTH_URL and SMTP settings in ${ENV_FILE} with your real domain and credentials.
  2. Configure firewall: sudo ufw allow 80/tcp && sudo ufw allow 443/tcp
  3. If using Nginx: setup TLS (Let's Encrypt) and verify reverse proxy rules.

${GREEN}🎉 Deployment script finished.${NC}
EOF
