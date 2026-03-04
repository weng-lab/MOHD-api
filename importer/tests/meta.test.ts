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

  test("ATAC Metadata was inserted", async () => {
    const count = await sql`
      SELECT COUNT(*)::int AS total
      FROM ${sql(schema)}.atac_metadata
    `;
    expect(count[0].total).toBeGreaterThan(0);
  });

  test("ATAC sex column only contains valid enum values", async () => {
    const result = await sql`
      SELECT DISTINCT sex::text
      FROM ${sql(schema)}.atac_metadata
    `;
    
    for (const row of result) {
      expect(["male", "female"]).toContain(row.sex);
    }
  });

  
  test("First ATAC sample_id is correct when ordered", async () => {
    const result = await sql`
      SELECT *
      FROM ${sql(schema)}.atac_metadata ORDER BY sample_id LIMIT 1
    `;        
    expect(result[0].sample_id).toBe("MOHD_EA100001");    
    expect(result[0].site).toBe("CCH");
    expect(result[0].opc_id).toBe("CCH_0001");
    expect(result[0].protocol).toBe("Buffy Coat method");
    expect(result[0].status).toBe("case");
    expect(result[0].sex).toBe("female");
    expect(result[0].entity_id).toBe("CCH_0001_BC_01");
    expect(result[0].umap_x).toBe("4.974631");
    expect(result[0].umap_y).toBe("1.925901");
    expect(result[0].biospecimen).toBe("buffy coat");
    
  });

   test("First RNA sample_id is correct when ordered", async () => {
    const result = await sql`
      SELECT *
      FROM ${sql(schema)}.rna_metadata ORDER BY sample_id LIMIT 1
    `;        
    expect(result[0].sample_id).toBe("MOHD_ER100001");
    expect(result[0].kit).toBe("CCH_0001");
    expect(result[0].site).toBe("CCH");
    expect(result[0].status).toBe("case");
    expect(result[0].sex).toBe("female");
    expect(result[0].umap_x).toBe("7.639448");
    expect(result[0].umap_y).toBe("22.995956");
    
  });


});