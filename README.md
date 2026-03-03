# mohd-api

Bun monorepo: GraphQL API + data importer for MOHD.

## Quick Start

```bash
bun install
bun run db:start
bun run db:reset
bun run dev
```

## Commands

| Command | What |
|---------|------|
| `dev` | Start API locally |
| `db:start` | Start Postgres |
| `db:reset` | Import test data |
| `db:stop` | Stop Postgres |
| `test:service` | Run local tests |
| `test:ci` | Run full test suite (CI) |
| `import` | Run data importer |
| `deploy:api` | Deploy API to Cloud Run |
| `deploy:importer` | Deploy importer job |

## Structure

- `service/` - GraphQL API
- `importer/` - Data import pipeline
- `migrations/` - Docker setup + test data

## Env

Copy `.env.example` to `.env` in each package.

Cloud Run needs:
- `POSTGRES_URL` - DB connection string
- `POSTGRES_PATH` - Cloud SQL socket (optional)

## Cloud SQL Proxy

Local access to Cloud SQL:

```bash
cloud-sql-proxy PROJECT:REGION:INSTANCE --port=5432
```

Set env:

```
POSTGRES_URL="postgresql://USER:PASSWORD@localhost:PORT/DATABASE"
```

## Importer

```bash
bun run import  # import all test data
```

Or manually:

```bash
cd importer
bun run src/index.ts --datatype meta --schema public
bun run src/index.ts --datatype rna --schema public
bun run src/index.ts --datatype atac --schema public
```
