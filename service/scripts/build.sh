#!/usr/bin/env bash

set -e  # exit on error

echo "Starting build process..."

# --------------------------------------------------
# Ensure .env exists (optional but helpful locally)
# --------------------------------------------------
if [ ! -f .env ]; then
  echo "Creating .env from .env.example"
  cp .env.example .env
fi

# --------------------------------------------------
# Install dependencies if missing
# --------------------------------------------------
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  bun install
fi

# --------------------------------------------------
# Type check (if TypeScript present)
# --------------------------------------------------
if [ -f "tsconfig.json" ]; then
  echo "Type checking..."
  bunx tsc --noEmit
fi

# --------------------------------------------------
# Build project
# --------------------------------------------------
echo "Building project..."
bun run build

echo "Build completed successfully!"