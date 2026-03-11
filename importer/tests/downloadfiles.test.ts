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

describe("Download Files Tables Integration Tests", () => {
  test("Schema exists", async () => {
    const result = await sql`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = ${schema}
    `;
    expect(result.length).toBe(1);
  });

  test("mohd_download_files table exists", async () => {
    const result = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = ${schema}
        AND table_name = 'mohd_download_files'
    `;
    expect(result.length).toBe(1);
  });

 
  test("mohd download files was inserted", async () => {
    const count = await sql`
      SELECT COUNT(*)::int AS total
      FROM ${sql(schema)}.mohd_download_files
    `;
    expect(count[0].total).toBeGreaterThan(0);
  });
  
  test("mohd_download_files data insertion is correct when ordered", async () => {
    const result = await sql`
      SELECT *
      FROM ${sql(schema)}.mohd_download_files ORDER BY sample_id LIMIT 1
    `;        
    expect(result[0].sample_id).toBe("MOHD_EA100001");   
    expect(result[0].filename).toBe("MOHD_EA100001_R1.fastq.gz");
    expect(result[0].file_type).toBe("Sequenced reads");
    expect(result[0].size).toBe("1428076625");
    expect(result[0].file_ome).toBe("ATAC-seq");
    expect(result[0].open_access).toBe(false);
    
  });


});