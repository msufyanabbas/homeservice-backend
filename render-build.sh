#!/bin/bash
# Render.com Build Script

echo "🔨 Starting Render build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build application
echo "🏗️  Building NestJS application..."
npm run build

# Install TypeORM globally for migrations
echo "📊 Installing TypeORM..."
npm install -g typeorm ts-node

echo "✅ Build completed successfully!"