#!/bin/bash

# cPanel Build Script with Timeout and Memory Management
# This script prevents build hangs and handles resource constraints

set -e  # Exit on error

echo "Starting cPanel build process..."
echo "Timestamp: $(date)"

# Set memory limits (adjust based on your cPanel limits)
export NODE_OPTIONS="--max-old-space-size=1536"
export SKIP_ENV_VALIDATION=true

# Clean previous build
echo "Cleaning previous build..."
rm -rf .next
rm -rf node_modules/.cache

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate || echo "Prisma generate failed, continuing..."

# Build with timeout (15 minutes max)
echo "Starting Next.js build (15 minute timeout)..."
timeout 900 npm run build:cpanel || {
    echo "Build timed out or failed!"
    echo "Trying lighter build..."
    NODE_OPTIONS="--max-old-space-size=1024" npm run build:light || {
        echo "Build failed completely. Check logs above."
        exit 1
    }
}

echo "Build completed successfully!"
echo "Timestamp: $(date)"

