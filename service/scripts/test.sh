#!/usr/bin/env bash

set -e  # exit immediately if any command fails

echo "Starting test environment..."

# copy .env from example if does not exist
if [ ! -f .env ]; then
  echo "Creating .env from .env.example"
  cp .env.example .env
else
  echo ".env already exists"
fi


# Start DB only if not running already
if ! docker compose ps db | grep -q "Up"; then
  echo "Starting database container..."
  bun run db:start
else
  echo "Database already running"
fi

echo "Waiting for database to be ready..."
sleep 3

# Setup database
echo "Running migrations..."
bun run db:up

echo "Seeding database..."
bun run db:seed

# Run tests
echo "Running tests..."
bun test

echo "Tests passed!"

# Cleanup 
echo "Cleaning up database..."

bun run db:down
bun run db:stop
