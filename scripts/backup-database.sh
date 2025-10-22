#!/bin/bash
# Automated PostgreSQL Backup Script for Pharmapedia

# Configuration
BACKUP_DIR="/var/backups/pharmapedia"
CONTAINER_NAME="pharmapedia_postgres_1"
DB_USER="pharmapedia"
DB_NAME="pharmapedia"
RETENTION_DAYS=30  # Keep backups for 30 days

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/pharmapedia_backup_$TIMESTAMP.sql.gz"

# Perform backup
echo "Starting backup at $(date)"
docker exec -t "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup completed successfully: $BACKUP_FILE"
    echo "Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"
    
    # Remove old backups (older than RETENTION_DAYS)
    find "$BACKUP_DIR" -name "pharmapedia_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
    echo "Old backups cleaned up (retention: $RETENTION_DAYS days)"
else
    echo "ERROR: Backup failed!"
    exit 1
fi

echo "Backup process completed at $(date)"
