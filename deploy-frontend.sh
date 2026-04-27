#!/bin/bash
# =============================================================
# Carbon Grounds Frontend (Next.js) — EC2 Deployment Script
# Run this ONCE on the EC2 server after uploading the project
# =============================================================

set -e

echo "🚀 Starting Carbon Grounds Frontend Deployment..."

# Go to project directory (frontend root — one level up from backend)
cd ~/carbon-grounds-admin

# Install dependencies
npm install --omit=dev

# Build Next.js for production (uses .env.production automatically)
npm run build

# Start with PM2
pm2 start npm --name "carbon-grounds-admin" -- start

# Save PM2 config
pm2 save

echo ""
echo "=============================================="
echo "🎉 Frontend Deployment Complete!"
echo "=============================================="
echo "Admin Panel: http://43.204.144.76"
echo "=============================================="
