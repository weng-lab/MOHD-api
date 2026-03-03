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

describe("RNA ZScore Tables Integration Tests", () => {
  test("Schema exists", async () => {
    const result = await sql`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = ${schema}
    `;
    expect(result.length).toBe(1);
  });

  test("rna_tpm table exists", async () => {
    const result = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = ${schema}
        AND table_name = 'rna_tpm'
    `;
    expect(result.length).toBe(1);
  });

 
  test("RNA TPM was inserted", async () => {
    const count = await sql`
      SELECT COUNT(*)::int AS total
      FROM ${sql(schema)}.rna_tpm
    `;
    expect(count[0].total).toBeGreaterThan(0);
  });
  
  test("First RNA tpm gene_id is correct when ordered", async () => {
    const result = await sql`
      SELECT *
      FROM ${sql(schema)}.rna_tpm ORDER BY gene_id LIMIT 1
    `;        
    expect(result[0].gene_id).toBe("ENSG00000000003");   
    expect(result[0].tpm_values.length).toBe(9);
    
  });


});