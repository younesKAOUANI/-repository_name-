#!/usr/bin/env bash
set -euo pipefail

usage() { cat <<EOF
Usage: $0 <backup-file>

Restores a gzipped PostgreSQL dump (created with pg_dump -Fc and gzipped) into the database.
Supports either the docker-compose "postgres" service (if running) or a remote/local DB via env vars.

Environment variables:
  DB_CONTAINER   docker-compose service name or container id (default: postgres)
  DB_USER        DB user (default: postgres)
  DB_NAME        DB name (default: pharmapedia)
  DB_PASSWORD    DB password (only used for direct host mode)
  DB_HOST        DB host for direct host mode (default: localhost)

Examples:
  # Restore into the docker-compose postgres service
  ./scripts/restore-db.sh /path/to/backup.dump.gz

  # Restore to a remote DB
  DB_HOST=db.example.com DB_USER=postgres DB_NAME=prod DB_PASSWORD=secret ./scripts/restore-db.sh /path/to/backup.dump.gz
EOF
}

if [ "${1:-}" == "-h" ] || [ "${1:-}" == "--help" ]; then
  usage
  exit 0
fi

if [ -z "${1:-}" ]; then
  echo "Error: backup file required" >&2
  usage
  exit 1
fi

BACKUP_FILE="$1"
if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: file not found: $BACKUP_FILE" >&2
  exit 2
fi

DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-pharmapedia}"
DB_CONTAINER="${DB_CONTAINER:-postgres}"

# Detect container
CONTAINER_ID=""
if command -v docker-compose >/dev/null 2>&1; then
  CONTAINER_ID=$(docker-compose ps -q "$DB_CONTAINER" 2>/dev/null || true)
fi

if [ -n "$CONTAINER_ID" ]; then
  echo "Restoring into container $CONTAINER_ID from $BACKUP_FILE"
  # Use pg_restore to restore custom-format dump. We stream the decompressed file into pg_restore inside the container.
  gunzip -c "$BACKUP_FILE" | docker exec -i "$CONTAINER_ID" pg_restore -U "$DB_USER" -d "$DB_NAME" --clean --no-owner --exit-on-error
else
  echo "No running docker-compose postgres service detected. Restoring using local/remote pg_restore"
  if ! command -v pg_restore >/dev/null 2>&1; then
    echo "Error: pg_restore not found in PATH. Install postgres client tools or run the containerized restore." >&2
    exit 3
  fi
  export PGPASSWORD="${DB_PASSWORD:-}"
  gunzip -c "$BACKUP_FILE" | pg_restore -h "${DB_HOST:-localhost}" -U "$DB_USER" -d "$DB_NAME" --clean --no-owner --exit-on-error
fi

echo "Restore completed"
