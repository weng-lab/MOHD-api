# AGENTS.md

> Instructions for AI coding agents operating in this repository.

## Project Overview

Bun + Hono REST/GraphQL API for MOHD data.
PostgreSQL database accessed via Bun's built-in SQL driver (no ORM).
Zod v4 for runtime validation. TypeScript in strict mode.

## Tech Stack

- **Runtime**: Bun (not Node.js)
- **Framework**: Hono v4
- **Language**: TypeScript (strict)
- **Database**: PostgreSQL via `import { SQL } from "bun"`
- **Validation**: Zod v4 (`zod@^4.3`)
- **GraphQL**: `@hono/graphql-server` + `graphql`
- **Package manager**: Bun (`bun.lock`)

## Commands

### Development

```bash
bun install                  # Install dependencies
bun run dev                  # Dev server with hot reload (port 3000)
bun run build                # Build to dist/
bun run start                # Run production build
```

### Database

```bash
bun run db:start             # Start PostgreSQL via Docker
bun run db:up                # Run migrations (create tables)
bun run db:seed              # Seed test data
bun run db:down              # Drop tables
bun run db:reset             # Full reset: down + up + seed
bun run db:stop              # Stop Docker containers
```

### Deployment

```bash
bun run deploy:api           # Deploy API to Google Cloud Run
bun run deploy:importer      # Deploy importer as Cloud Run job
```

### Testing

```bash
bun test                         # Run all tests
bun test test/integration.test.ts   # Run a single test file
bun test --filter "health"       # Run tests matching a pattern
```

Tests use `bun:test` (built-in). Test files live in `test/` with `*.test.ts` naming.

**Prerequisites:** Tests run against a live PostgreSQL database with seeded data.
Before running tests: `bun run db:start && bun run db:up && bun run db:seed`.

### Linting / Formatting

No linter or formatter is configured. There are no ESLint, Prettier, or Biome configs.
Follow the existing code style conventions described below.

## Project Structure

```
src/
  index.ts              # Entry point: Hono app, middleware, global error handler
  db.ts                 # Database connection (exports sql instance)
  routes/
    rna_tpm.ts          # REST routes for /rna_tpm (GET)
  graphql/
    schema.ts           # GraphQL SDL schema (RnaSample, RnaGene, rna_tpm query)
    resolvers.ts        # GraphQL resolvers (rnaResolver)
test/
  integration.test.ts   # Integration tests (health, rows, gql)
  seed.ts               # Database seeding script
  up.ts                 # Create tables (migration up)
  down.ts               # Drop tables (migration down)
importer/
  index.ts              # CLI entry point (dispatches by data type: rna, meta)
  db.ts                 # Database connection for importer
  rna.ts                # RNA TPM data import from TSV
  meta.ts               # RNA + ATAC metadata import from TSV
  utils.ts              # Shared helpers (fetchTsv, insertRows, isValidRow)
  Dockerfile            # Container image for Cloud Run job
```

## Database Schema

Three tables, two custom enum types:

```sql
-- Enum types
CREATE TYPE status AS ENUM ('case', 'control', 'unknown');
CREATE TYPE sex AS ENUM ('male', 'female');

-- RNA expression data (TPM values stored as a numeric array per gene)
CREATE TABLE rna_tpm (
    gene_id VARCHAR(15) PRIMARY KEY,
    tpm_values NUMERIC(10, 2)[]
);

-- RNA sample metadata
CREATE TABLE rna_metadata (
    sample_id VARCHAR(15) PRIMARY KEY,
    kit VARCHAR(10) NOT NULL,
    site VARCHAR(3) NOT NULL,
    status status NOT NULL,
    sex sex NOT NULL
);

-- ATAC sample metadata
CREATE TABLE atac_metadata (
    sample_id VARCHAR(15) PRIMARY KEY,
    site VARCHAR(3) NOT NULL,
    opc_id VARCHAR(10) NOT NULL,
    protocol VARCHAR(20) NOT NULL,
    status status NOT NULL,
    sex sex NOT NULL,
    entity_id VARCHAR(20) NOT NULL
);
```

## Code Style

### Formatting

- 2-space indentation
- Double quotes for strings
- Semicolons required
- Trailing commas in multi-line objects/arrays

### Imports

- ES Modules only (no CommonJS `require()`)
- Use `import type { X }` for type-only imports (required by `verbatimModuleSyntax`)
- Relative imports without `.ts` extensions: `"../db"`, `"./graphql/resolvers"`
- Order: external packages first, then relative imports

```typescript
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { RootResolver } from "@hono/graphql-server";
import { sql } from "../db";
```

### Naming Conventions

| Element            | Convention   | Example                          |
| ------------------ | ------------ | -------------------------------- |
| Variables/functions| camelCase    | `rnaResolver`, `rootResolver`    |
| Types              | PascalCase   | `RootResolver`                   |
| Zod schemas        | camelCase    | `rnaQuery`                       |
| Files              | lowercase    | `db.ts`, `resolvers.ts`          |
| Directories        | lowercase    | `routes/`, `graphql/`            |
| DB columns         | snake_case   | `gene_id`, `sample_id`, `tpm_values` |

### Types

- TypeScript strict mode is enabled with additional flags:
  `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`
- Zod schemas are defined locally in the files that use them (route handlers, resolvers)
- Infer types with `z.infer<typeof schema>` when needed
- Use `@hono/zod-validator` for request validation in route handlers

```typescript
// Define schema inline where used
const rnaQuery = z.object({
  gene_ids: z.array(z.string()),
});
```

### Error Handling

- Global error handler in `src/index.ts` catches all unhandled errors:
  returns `c.text("an error occurred", 500)` -- no error details leaked
- Use `zValidator()` middleware for request validation (auto-returns 400 on failure)
- In GraphQL resolvers, use `schema.parse(args)` for validation (throws on invalid input)
- In scripts (migrations, seeds), use simple `try/catch` with `console.log(e)`
- No custom error classes -- keep it simple

### Database

- Database connection is defined in `src/db.ts` using Bun's `SQL` class:
  ```typescript
  import { SQL } from "bun";
  export const sql = new SQL({
    url: process.env.POSTGRES_URL,
    path: process.env.POSTGRES_PATH,
  });
  ```
- Import the shared instance: `import { sql } from "../db"`
- Use parameterized queries via template interpolation for safety:
  `` sql`WHERE gene_id = ${gene_id}` ``
- Bulk insert pattern: `` sql`INSERT INTO table ${sql(rows)}` ``

### Routing Patterns

- Create sub-routers as `new Hono()` instances, export as default
- Mount sub-routers with `app.route("/path", router)`
- Use `c.json()` for JSON responses, `c.text()` for plain text
- Validate with `zValidator("query", schema)` or `zValidator("json", schema)`

```typescript
const rna_tpm = new Hono();
rna_tpm.get("/", zValidator("query", schema), async (c) => {
  const { gene_id } = c.req.valid("query");
  // ... query database
  return c.json(result);
});
export default rna_tpm;
```

### Functional Style

- No classes -- use functions and plain objects throughout
- Export `default` for route modules and the main app
- Export named for schemas, types, and resolvers

## Environment

- Bun natively loads `.env` (no dotenv package needed)
- Key variables:
  - `POSTGRES_URL` -- PostgreSQL connection string
  - `POSTGRES_PATH` -- optional, used by Bun's SQL driver for Unix socket path
- Default dev URL: `postgresql://postgres:postgres@localhost:5432/postgres`
- API runs on port 3000 (Bun default), but can be set with `PORT` environment variable

## Docker

- `Dockerfile` (root) -- multi-stage build for the API: install, build, release
- `importer/Dockerfile` -- simple image for the data importer CLI
- `docker-compose.yml` -- local dev services:
  - `db`: PostgreSQL on port 5432 (password: `postgres`)
  - `api`: the API container on port 3000

## Testing

This is primarily a GraphQL API. Tests focus on the `/graphql` endpoint.

### Setup

Tests run against a live PostgreSQL database with seeded data. Before running:

```bash
bun run db:start && bun run db:up && bun run db:seed
```

### Patterns

- Import `app` from `../src` and use `app.request()` to test without starting an HTTP server
- Use `describe`/`test`/`expect` from `bun:test`
- A `gql()` helper builds GraphQL POST requests:

```typescript
import { describe, expect, test } from "bun:test";
import app from "../src";

function gql(query: string) {
  return new Request("http://localhost/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
}
```

- Send GraphQL queries via `app.request(gql(...))` and assert on the parsed JSON body:

```typescript
describe("graphql rna_tpm", () => {
  test("single gene returns samples with metadata", async () => {
    const res = await app.request(
      gql('{ rna_tpm(gene_ids: ["0"]) { gene_id, samples { value, sample_id } } }'),
    );
    const body = (await res.json()) as any;
    const gene = body.data.rna_tpm[0];

    expect(gene.gene_id).toBe("0");
    expect(gene.samples).toHaveLength(5);
  });
});
```

### Test Coverage

Current test suites in `test/integration.test.ts`:

| Suite              | What it tests                                       |
| ------------------ | --------------------------------------------------- |
| `health`           | `/health` returns 200 with database connectivity    |
| `not found`        | Unknown routes return 404                           |
| `graphql rna_tpm`  | Single gene, multiple genes, missing genes, empty input, missing args |

### Conventions

- Tests assert against seed data (gene IDs `"0"`--`"9"`, samples `SAMPLE_001`--`SAMPLE_005`)
- Cast `res.json()` as `any` for untyped GraphQL response bodies
- Keep tests focused: one assertion concept per `test()` block
- GraphQL error cases check `body.errors` is defined

## CI

GitHub Actions (`.github/workflows/build.yaml`) runs on PRs to `main`:
`bun install --frozen-lockfile && bun run build`. No test step in CI currently.
