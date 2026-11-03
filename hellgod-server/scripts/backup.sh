#!/bin/bash
# HELLGOD Automated Backup Snapshot Creator
BACKUP_DIR="hellgod-storage/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/hellgod_backup_$TIMESTAMP.tar.gz"

mkdir -p "$BACKUP_DIR"

echo "[HELLGOD BACKUP] Creating system snapshot..."
tar -czf "$BACKUP_FILE" hellgod-storage/databases hellgod-storage/hellgod.conf hellgod-storage/security.yaml

CHECKSUM=$(sha256sum "$BACKUP_FILE" | awk '{print $1}')
echo "[HELLGOD BACKUP] Snapshot created: $BACKUP_FILE"
echo "[HELLGOD BACKUP] SHA-256 Checksum: $CHECKSUM"
echo "[HELLGOD BACKUP] Status: SUCCESS"
