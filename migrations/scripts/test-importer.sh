#!/bin/bash
set -e

cd "$(dirname "$(dirname "$0")")"

trap 'docker compose -f docker-compose.test.yml down -v' EXIT

docker compose -f docker-compose.test.yml up -d postgres

# Wait for postgres
until docker exec test-postgres psql -U postgres -d testdb -c "select 1" > /dev/null 2>&1; do
  sleep 2
done

docker compose -f docker-compose.test.yml build --no-cache importer

docker compose -f docker-compose.test.yml build --no-cache importer
# Seed database
docker compose -f docker-compose.test.yml run --rm importer \
  bun run src/index.ts --datatype meta --datatype atac --datatype rna --schema test_schema_v1

# Run tests
docker compose -f docker-compose.test.yml run --rm --entrypoint "" importer bun test

docker compose -f docker-compose.test.yml build --no-cache service

docker compose -f docker-compose.test.yml run --rm --entrypoint "" service bun test 