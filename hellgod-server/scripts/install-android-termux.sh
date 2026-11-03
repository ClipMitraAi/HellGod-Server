#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# HELLGOD - ANDROID TERMUX ZERO-BUDGET HOSTING SCRIPT
# Run this script directly inside Termux on any Android phone (Android 8.0+)
# ==============================================================================

echo "=================================================="
echo "      HELLGOD - ANDROID LOCAL HOST INSTALLER      "
echo "=================================================="

# 1. Update package manager
echo "[1/5] Updating Termux packages..."
pkg update -y && pkg upgrade -y

# 2. Install Python, Node.js, Git, and SQLite
echo "[2/5] Installing Node.js, Python, Git & SQLite3..."
pkg install -y nodejs-lts python git sqlite curl

# 3. Setup Project Directory
echo "[3/5] Setting up HELLGOD directory..."
mkdir -p ~/hellgod
cd ~/hellgod

# 4. Install dependencies
echo "[4/5] Installing dependencies..."
npm install

# 5. Launch HELLGOD Platform
echo "[5/5] Starting HELLGOD Platform on Android..."
echo "=================================================="
echo " HELLGOD Server active at: http://localhost:3000"
echo " Network IP: http://$(ifconfig | grep inet | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1):3000"
echo " Login: root / hellgod"
echo "=================================================="
npm run dev
