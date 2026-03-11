#!/bin/bash
set -e

cd "$(dirname "$(dirname "$0")")"

trap 'docker compose -f docker-compose.test.yml down -v' EXIT

# Setup Postgres
docker compose -f docker-compose.test.yml up -d postgres

until docker exec test-postgres psql -U postgres -d testdb -c "select 1" > /dev/null 2>&1; do
  sleep 2
done

# Setup importer
docker compose -f docker-compose.test.yml build --no-cache importer

# Seed database
docker compose -f docker-compose.test.yml run --rm importer \
    bun run src/index.ts \
    --datatype meta \
    --datatype atac \
    --datatype rna \
    --datatype downloadfiles \
    --schema test_schema_v1

# Run importer tests
docker compose -f docker-compose.test.yml run --rm --entrypoint "" importer bun test

# Setup service
docker compose -f docker-compose.test.yml build --no-cache service

# Run service tests
docker compose -f docker-compose.test.yml run --rm --entrypoint "" service bun test
