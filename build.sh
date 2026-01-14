#!/bin/bash

echo ""
echo "========================================"
echo "  RocketMoon App - Build Script"
echo "========================================"
echo ""

# Exit on error
set -e

# Navigate to script directory
cd "$(dirname "$0")"

# Detect OS for runtime identifier
if [[ "$OSTYPE" == "darwin"* ]]; then
    RID="osx-x64"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    RID="linux-x64"
else
    RID="linux-x64"
fi

# Step 1: Build Frontend
echo "[1/3] Building Frontend..."
cd romo.client
npm install
npm run build
cd ..
echo "     Frontend build complete!"
echo ""

# Step 2: Publish Backend
echo "[2/3] Publishing Backend (Single-File for $RID)..."
cd RoMo.Server
dotnet publish -c Release -r $RID --self-contained -o ../publish
cd ..
echo "     Backend publish complete!"
echo ""

# Step 3: Done
echo "[3/3] Build Complete!"
echo ""
echo "========================================"
echo "  Output: publish/RoMo.Server"
echo "========================================"
echo ""
echo "Run with: ./publish/RoMo.Server"
