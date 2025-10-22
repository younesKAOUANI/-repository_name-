#!/bin/bash
# Restore PostgreSQL Database from Backup

# Configuration
BACKUP_DIR="/var/backups/pharmapedia"
CONTAINER_NAME="pharmapedia_postgres_1"
DB_USER="pharmapedia"
DB_NAME="pharmapedia"

# Check if backup file provided
if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -lh "$BACKUP_DIR"/pharmapedia_backup_*.sql.gz 2>/dev/null || echo "No backups found in $BACKUP_DIR"
    exit 1
fi

BACKUP_FILE="$1"

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Confirm restoration
echo "⚠️  WARNING: This will replace the current database with the backup!"
echo "Backup file: $BACKUP_FILE"
echo "Database: $DB_NAME"
read -p "Are you sure you want to continue? (type 'yes' to confirm): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# Perform restore
echo "Starting restore at $(date)"
echo "Restoring from: $BACKUP_FILE"

# Drop existing connections and restore
gunzip < "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" "$DB_NAME"

if [ $? -eq 0 ]; then
    echo "✅ Restore completed successfully at $(date)"
else
    echo "❌ ERROR: Restore failed!"
    exit 1
fi
