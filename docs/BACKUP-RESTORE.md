# Backup and Restore Procedures

This document describes the backup and restore procedures for Faith Interactive.

## Overview

Faith Interactive uses PostgreSQL for data storage. The backup strategy includes:

- **Daily automated backups** via cron job
- **30-day retention** with automatic cleanup
- **Compressed SQL dumps** for efficient storage
- **Point-in-time recovery** capability

---

## Backup Procedures

### Automated Daily Backups

The backup script runs daily via cron at 2 AM:

```bash
# Add to crontab (crontab -e)
0 2 * * * /path/to/fi-app/scripts/backup-db.sh >> /var/log/fi-backup.log 2>&1
```

### Manual Backup

Run the backup script manually:

```bash
# Ensure DATABASE_URL is set
export DATABASE_URL="postgresql://user:pass@host:5432/fi_db"

# Run backup
./scripts/backup-db.sh
```

Backups are stored in: `./backups/fi-YYYYMMDD-HHMMSS.sql.gz`

### Backup Verification

```bash
# List current backups
ls -lh backups/*.sql.gz

# Verify backup integrity (inspect without restoring)
gunzip -c backups/fi-20250101-020000.sql.gz | head -100
```

---

## Restore Procedures

### Prerequisites

Before restoring:

1. **Stop the application** to prevent new writes during restore
2. **Notify users** if restoring to production
3. **Back up current state** before restoring (if applicable)

### Restore to Same Database

```bash
# 1. Stop the application
# (via your deployment platform: Vercel, Railway, etc.)

# 2. Set DATABASE_URL
export DATABASE_URL="postgresql://user:pass@host:5432/fi_db"

# 3. Restore from backup
gunzip -c backups/fi-YYYYMMDD-HHMMSS.sql.gz | psql $DATABASE_URL

# 4. Verify restoration
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Church\";"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"User\";"

# 5. Restart the application
```

### Restore to New Database (Fresh Instance)

```bash
# 1. Create new database
createdb fi_new_db

# 2. Restore backup
gunzip -c backups/fi-YYYYMMDD-HHMMSS.sql.gz | psql postgresql://user:pass@host:5432/fi_new_db

# 3. Update DATABASE_URL in environment
# 4. Run migrations to ensure schema is current
pnpm exec prisma migrate deploy

# 5. Start application with new database
```

### Restore to Different Environment

```bash
# 1. Copy backup to target environment
scp backups/fi-YYYYMMDD-HHMMSS.sql.gz user@target-server:/tmp/

# 2. SSH to target server
ssh user@target-server

# 3. Restore
export DATABASE_URL="postgresql://..."
gunzip -c /tmp/fi-YYYYMMDD-HHMMSS.sql.gz | psql $DATABASE_URL
```

---

## Disaster Recovery Scenarios

### Scenario 1: Corrupted Data

**Symptoms**: Application errors, missing records, inconsistent state

**Recovery Steps**:
1. Identify the time of corruption
2. Find the most recent clean backup (before corruption)
3. Stop the application
4. Restore from clean backup
5. Verify data integrity
6. Restart the application

### Scenario 2: Accidental Data Deletion

**Symptoms**: Users report missing content, empty lists

**Recovery Steps**:
1. Stop writes immediately (enable maintenance mode)
2. Identify what was deleted and when
3. Find backup from before deletion
4. Restore specific tables or full database
5. Verify restoration
6. Disable maintenance mode

### Scenario 3: Database Server Failure

**Symptoms**: Application 503 errors, health check failing

**Recovery Steps**:
1. Provision new database server
2. Update DATABASE_URL with new connection string
3. Restore from latest backup
4. Run migrations: `pnpm exec prisma migrate deploy`
5. Update application configuration
6. Restart application
7. Verify functionality

---

## Partial Restore (Single Tenant)

To restore data for a single church without affecting others:

```bash
# 1. Extract church-specific data from backup
gunzip -c backups/fi-YYYYMMDD-HHMMSS.sql.gz > /tmp/full-restore.sql

# 2. Create filtered restore script
# (Manual process - extract relevant INSERT statements for specific churchId)

# 3. Delete existing data for the church
psql $DATABASE_URL -c "DELETE FROM \"Page\" WHERE \"churchId\" = 'church_id_here';"
# Repeat for other tables...

# 4. Insert from backup
# (Apply filtered INSERT statements)
```

> **Note**: Partial restores are complex. Consider using application-level export/import for single-tenant recovery.

---

## Media Files

Media files are stored separately from the database:

- **Local development**: `./storage/` directory
- **Production**: Cloud storage (configure via `STORAGE_PATH`)

### Backup Media Files

```bash
# For local storage
tar -czf backups/media-YYYYMMDD.tar.gz storage/

# For cloud storage (S3 example)
aws s3 sync s3://your-bucket/fi-media/ ./backups/media/
```

### Restore Media Files

```bash
# For local storage
tar -xzf backups/media-YYYYMMDD.tar.gz

# For cloud storage
aws s3 sync ./backups/media/ s3://your-bucket/fi-media/
```

---

## Monitoring and Alerts

### Backup Health Checks

Verify backups are running:

```bash
# Check backup age
find backups/ -name "fi-*.sql.gz" -mtime -1 | wc -l
# Should return >= 1 (at least one backup in last 24 hours)

# Check backup sizes (detect empty/corrupt backups)
ls -la backups/*.sql.gz | awk '$5 < 1000 {print "WARNING: Small backup:", $0}'
```

### Recommended Alerts

1. **No backup in 24 hours**: Critical
2. **Backup size < 1KB**: Critical (likely failed)
3. **Backup size change > 50%**: Warning (investigate growth/shrinkage)

---

## Testing Backups

**Quarterly backup verification**:

1. Restore backup to a test database
2. Run application smoke tests against test DB
3. Verify data integrity
4. Document results
5. Delete test database

```bash
# Example test script
createdb fi_backup_test
gunzip -c backups/fi-latest.sql.gz | psql postgresql://localhost/fi_backup_test
# Run tests...
dropdb fi_backup_test
```

---

## Retention Policy

| Environment | Retention | Frequency |
|------------|-----------|-----------|
| Production | 30 days | Daily |
| Staging | 7 days | Daily |
| Development | 3 days | Manual |

To modify retention, edit `RETENTION_DAYS` in `scripts/backup-db.sh`.

---

## Security Considerations

1. **Encrypt backups at rest** for production
2. **Restrict backup access** to ops team only
3. **Never commit backups** to version control
4. **Rotate database credentials** after restore from backup
5. **Audit restore operations** via audit log

---

## Quick Reference

```bash
# Create backup
./scripts/backup-db.sh

# List backups
ls -lh backups/*.sql.gz

# Restore (full)
gunzip -c backups/fi-YYYYMMDD-HHMMSS.sql.gz | psql $DATABASE_URL

# Verify restore
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Church\";"
```
