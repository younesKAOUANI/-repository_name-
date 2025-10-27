#!/usr/bin/env bash
set -euo pipefail

usage() { cat <<EOF
Usage: $0 [output-file]

Creates a timestamped gzipped PostgreSQL dump (custom format) using either:
 - the docker-compose "postgres" service (if running), or
 - a remote/local Postgres via PGPASSWORD/DB_HOST/DB_USER/DB_NAME env vars.

Optional environment variables:
  DB_CONTAINER   docker-compose service name or container id (default: postgres)
  DB_USER        DB user (default: postgres)
  DB_NAME        DB name (default: pharmapedia)
  DB_PASSWORD    DB password (only used for direct host mode)
  DB_HOST        DB host for direct host mode (default: localhost)
  BACKUP_DIR     directory to store backups (default: ./prisma/backups)

Examples:
  # Use docker-compose postgres service (default)
  ./scripts/backup-db.sh

  # Provide an explicit filename
  ./scripts/backup-db.sh /tmp/my-backup.dump.gz

  # Backup a remote DB
  DB_HOST=db.example.com DB_USER=postgres DB_NAME=prod DB_PASSWORD=secret ./scripts/backup-db.sh
EOF
}

if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

OUTFILE="${1:-}"
BACKUP_DIR="${BACKUP_DIR:-./prisma/backups}"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d%H%M%S)
if [ -z "$OUTFILE" ]; then
  OUTFILE="$BACKUP_DIR/backup-$TIMESTAMP.dump.gz"
fi

DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-pharmapedia}"
DB_CONTAINER="${DB_CONTAINER:-postgres}"

# Detect a running docker-compose service named $DB_CONTAINER
CONTAINER_ID=""
if command -v docker-compose >/dev/null 2>&1; then
  CONTAINER_ID=$(docker-compose ps -q "$DB_CONTAINER" 2>/dev/null || true)
fi

if [ -n "$CONTAINER_ID" ]; then
  echo "Backing up from container $CONTAINER_ID -> $OUTFILE"
  # Use pg_dump in custom format and gzip the output
  docker exec -i "$CONTAINER_ID" pg_dump -U "$DB_USER" -Fc "$DB_NAME" | gzip > "$OUTFILE"
else
  echo "No running docker-compose postgres service detected. Using local/remote pg_dump -> $OUTFILE"
  if ! command -v pg_dump >/dev/null 2>&1; then
    echo "Error: pg_dump not found in PATH. Install postgres client tools or run the containerized backup." >&2
    exit 2
  fi
  export PGPASSWORD="${DB_PASSWORD:-}"
  pg_dump -h "${DB_HOST:-localhost}" -U "$DB_USER" -Fc "$DB_NAME" | gzip > "$OUTFILE"
fi

echo "Backup completed: $OUTFILE"
