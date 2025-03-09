#!/bin/bash

# Exit on error
set -e

echo "🔨 Building Lambda layer..."

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Clean and prepare
rm -rf dist
mkdir -p dist/nodejs

# Install dependencies
echo "📦 Installing dependencies..."
yarn install

# Build TypeScript directly to the nodejs directory
echo "🔧 Compiling TypeScript..."
npx tsc --outDir dist/nodejs

# Copy package files to the nodejs directory
echo "📋 Setting up package structure..."
cp package.json dist/nodejs/

# Install production dependencies in the nodejs directory
cd dist/nodejs
echo "📦 Installing production dependencies..."
yarn install --production

# Clean up unnecessary files
rm -rf node_modules/.bin
rm -rf node_modules/@types
rm package*.json

echo "✅ Lambda layer build complete! Layer is ready in dist directory" 