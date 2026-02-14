# Bun Hono GQL API template

Template for Bun + Hono REST/GraphQL APIs with PostgreSQL.

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

Other commands: `db:down`, `db:reset`, `db:stop`

## Testing

```bash
bun test
```

## Cloud Run Deployment

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

Build and push image
```bash
# get project information
gcloud artifacts repositories list

# IMAGE_URL = REGION-docker.pkg.dev/PROJECT_ID/REPOSITORY/IMAGE_NAME

gcloud builds submit --tag IMAGE_URL
```
