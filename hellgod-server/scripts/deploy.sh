#!/bin/bash
# HELLGOD Zero-Cost Cloud Deployment Script
# Supports: Render (Free Tier), Railway, Fly.io, Oracle Cloud Always-Free Tier

set -e

echo "=== HELLGOD SERVER DEPLOYMENT WIZARD ==="
echo "Step 1: Checking environment variables..."
if [ -z "$PORT" ]; then
    export PORT=3000
fi

echo "Step 2: Installing core dependencies..."
npm install

echo "Step 3: Building production frontend..."
npm run build

echo "Step 4: Initializing SQLite storage and permissions..."
mkdir -p hellgod-storage/databases hellgod-storage/logs
chmod 700 hellgod-storage

echo "Step 5: Launching HELLGOD Core Engine..."
echo "Server listening on 0.0.0.0:$PORT"
npm start
