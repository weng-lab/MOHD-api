# mohd-api

Bun + Hono GraphQL API for MOHD data.

Deployment on GCP with Cloud Run and Cloud SQL.

## Development

```bash
bun install
bun run dev
```

## Local Database (Docker)

```bash
cp .env.example .env
bun run db:start    # start postgres container
bun run db:up       # run migrations
bun run db:seed     # seed test data
```

Other commands: `db:down`, `db:stop`

## Testing

```bash
bun test
```

## Deployment

```bash
bun run deploy:api        # deploy API to Cloud Run
bun run deploy:importer   # deploy importer as Cloud Run job
```

Set these environment variables in Cloud Run:

```
POSTGRES_URL=postgresql://USER:PASSWORD@localhost:PORT/DATABASE
POSTGRES_PATH=/cloudsql/PROJECT:REGION:INSTANCE/.s.PGSQL.PORT
```

Requirements:
- Add Cloud SQL instance under "Connections" tab
- Service account needs `Cloud SQL Client` role

## Local Access to Cloud SQL

```bash
cloud-sql-proxy PROJECT:REGION:INSTANCE --port=PORT
```

```
POSTGRES_URL="postgresql://USER:PASSWORD@localhost:PORT/DATABASE"
```

## Importer

Run locally:
```bash
bun run importer/index.ts meta   # import metadata
bun run importer/index.ts rna    # import RNA TPM data
```
