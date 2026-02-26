import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { SQL } from "bun";

const schema = "test_schema_v1";

const sql = new SQL({
  url: "postgresql://postgres:postgres@postgres:5432/testdb",
  max: 1,
  connectionTimeout: 3,
});

beforeAll(async () => {
  await sql`SET search_path TO ${sql(schema)}`;
});
afterAll(async () => {
  await sql.end();
});

describe("Metadata Tables Integration Tests", () => {
  test("Schema exists", async () => {
    const result = await sql`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = ${schema}
    `;
    expect(result.length).toBe(1);
  });

  test("atac_metadata table exists", async () => {
    const result = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = ${schema}
        AND table_name = 'atac_metadata'
    `;
    expect(result.length).toBe(1);
  });

  test("rna_metadata table exists", async () => {
    const result = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = ${schema}
        AND table_name = 'rna_metadata'
    `;
    expect(result.length).toBe(1);
  });



  test("RNA Metadata was inserted", async () => {
    const count = await sql`
      SELECT COUNT(*)::int AS total
      FROM ${sql(schema)}.rna_metadata
    `;
    expect(count[0].total).toBeGreaterThan(0);
  });

  test("atac Metadata was inserted", async () => {
    const count = await sql`
      SELECT COUNT(*)::int AS total
      FROM ${sql(schema)}.atac_metadata
    `;
    expect(count[0].total).toBeGreaterThan(0);
  });
});