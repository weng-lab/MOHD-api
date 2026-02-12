# AGENTS.md

> Instructions for AI coding agents operating in this repository.

## Project Overview

Bun + Hono REST/GraphQL API template for genomic data (BedGraph rows).
PostgreSQL database accessed via Bun's built-in SQL driver (no ORM).
Zod v4 for runtime validation. TypeScript in strict mode.

## Tech Stack

- **Runtime**: Bun (not Node.js)
- **Framework**: Hono v4
- **Language**: TypeScript (strict)
- **Database**: PostgreSQL via `import { sql } from "bun"`
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

### Testing

```bash
bun test                     # Run all tests
bun test test/endpoint.test.ts   # Run a single test file
bun test --filter "health"       # Run tests matching a pattern
```

Tests use `bun:test` (built-in). Test files live in `test/` with `*.test.ts` naming.
Note: Endpoint tests expect 500 responses when no real database is connected.

### Linting / Formatting

No linter or formatter is configured. There are no ESLint, Prettier, or Biome configs.
Follow the existing code style conventions described below.

## Project Structure

```
src/
  index.ts              # Entry point: Hono app, middleware, global error handler
  types.ts              # Zod schemas + inferred TypeScript types
  routes/
    rows.ts             # REST routes for /rows (GET, POST)
  graphql/
    schema.ts           # GraphQL SDL schema
    resolvers.ts        # GraphQL resolvers
test/
  endpoint.test.ts      # Endpoint tests (bun:test)
  integration.test.ts   # Integration tests (currently empty)
  seed.ts               # Database seeding script
migrations/
  up.ts                 # Create tables
  down.ts               # Drop tables
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
- Relative imports without `.ts` extensions: `"../types"`, `"./graphql/resolvers"`
- Order: external packages first, then relative imports

```typescript
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { RootResolver } from "@hono/graphql-server";
import { genomicRange } from "../types";
```

### Naming Conventions

| Element            | Convention   | Example                          |
| ------------------ | ------------ | -------------------------------- |
| Variables/functions| camelCase    | `rowsResolver`, `genomicRange`   |
| Types              | PascalCase   | `GenomicRange`, `Row`            |
| Zod schemas        | camelCase    | `genomicRange`, `bedGraphRow`    |
| Files              | lowercase    | `types.ts`, `resolvers.ts`       |
| Directories        | lowercase    | `routes/`, `graphql/`            |
| DB columns         | snake_case   | `chrom_start`, `data_value`      |

### Types

- TypeScript strict mode is enabled with additional flags:
  `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`
- Define Zod schemas in `src/types.ts`, infer types with `z.infer<typeof schema>`
- Prefer type inference over explicit annotations where possible
- Use `@hono/zod-validator` for request validation in route handlers

```typescript
// Define schema and infer type together
const genomicRange = z.object({
  chrom: z.string(),
  start: z.coerce.number(),
  end: z.coerce.number(),
});
type GenomicRange = z.infer<typeof genomicRange>;
```

### Error Handling

- Global error handler in `src/index.ts` catches all unhandled errors:
  returns `c.text("an error occurred", 500)` -- no error details leaked
- Use `zValidator()` middleware for request validation (auto-returns 400 on failure)
- In GraphQL resolvers, use `schema.parse(args)` for validation (throws on invalid input)
- In scripts (migrations, seeds), use simple `try/catch` with `console.log(e)`
- No custom error classes -- keep it simple

### Database Queries

- Use Bun's built-in SQL tagged template literals: `` sql`SELECT ...` ``
- Always use parameterized queries via template interpolation for safety:
  `` sql`WHERE chrom = ${chrom}` ``
- Bulk insert pattern: `` sql`INSERT INTO table ${sql(rows)}` ``
- Connection is configured via `POSTGRES_URL` environment variable

### Routing Patterns

- Create sub-routers as `new Hono()` instances, export as default
- Mount sub-routers with `app.route("/path", router)`
- Use `c.json()` for JSON responses, `c.text()` for plain text
- Validate with `zValidator("query", schema)` or `zValidator("json", schema)`

```typescript
const rows = new Hono();
rows.get("/", zValidator("query", genomicRange), async (c) => {
  const { chrom, start, end } = c.req.valid("query");
  // ... query database
  return c.json(result);
});
export default rows;
```

### Functional Style

- No classes -- use functions and plain objects throughout
- Export `default` for route modules and the main app
- Export named for schemas, types, and resolvers

## Environment

- Bun natively loads `.env.local` (no dotenv package needed)
- Key variable: `POSTGRES_URL` (PostgreSQL connection string)
- Default dev URL: `postgresql://postgres:example@localhost:5432/postgres`
- API runs on port 3000 (Bun default)

## CI

GitHub Actions (`.github/workflows/build.yaml`) runs on PRs to `main`:
`bun install --frozen-lockfile && bun run build`. No test step in CI currently.
