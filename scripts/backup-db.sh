#!/bin/bash

# ==============================================================================
# Faith Interactive - Database Backup Script
# ==============================================================================
#
# PURPOSE:
# Creates daily PostgreSQL database backups with automatic rotation.
#
# USAGE:
# - Manual: ./scripts/backup-db.sh
# - Cron (daily at 2 AM): 0 2 * * * /path/to/fi-app/scripts/backup-db.sh
#
# REQUIREMENTS:
# - PostgreSQL client tools (pg_dump)
# - DATABASE_URL environment variable set
# - Write access to backups/ directory
#
# BACKUP STRATEGY:
# - Daily compressed backups (.sql.gz)
# - 30-day retention (older backups auto-deleted)
# - Filename format: fi-YYYYMMDD-HHMMSS.sql.gz
#
# RESTORE:
# gunzip -c backups/fi-YYYYMMDD-HHMMSS.sql.gz | psql $DATABASE_URL
#
# ==============================================================================

set -e  # Exit on error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="fi-$TIMESTAMP.sql.gz"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Faith Interactive Database Backup ===${NC}"
echo "Timestamp: $TIMESTAMP"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    # Try to load from .env.local
    if [ -f "$PROJECT_DIR/.env.local" ]; then
        export $(grep -v '^#' "$PROJECT_DIR/.env.local" | xargs)
    fi

    if [ -z "$DATABASE_URL" ]; then
        echo -e "${RED}ERROR: DATABASE_URL environment variable is not set${NC}"
        exit 1
    fi
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Perform the backup
echo "Creating backup: $BACKUP_FILE"
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/$BACKUP_FILE"

# Verify backup was created
if [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}Backup created successfully: $BACKUP_FILE ($SIZE)${NC}"
else
    echo -e "${RED}ERROR: Backup file was not created${NC}"
    exit 1
fi

# Clean up old backups
echo "Cleaning up backups older than $RETENTION_DAYS days..."
DELETED=$(find "$BACKUP_DIR" -name "fi-*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete -print | wc -l)
echo "Deleted $DELETED old backup(s)"

# List current backups
echo ""
echo "Current backups:"
ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null || echo "No backups found"

echo ""
echo -e "${GREEN}Backup complete!${NC}"
