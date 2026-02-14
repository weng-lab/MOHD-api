import { sql } from "../src/db";

try {
  await sql`
    CREATE TABLE IF NOT EXISTS rna_tpm (
        gene_id VARCHAR(15) PRIMARY KEY,
        tpm_values NUMERIC(10, 2)[]
    )
  `;
  await sql`CREATE TYPE status AS ENUM ('case', 'control', 'unknown');`;
  await sql`CREATE TYPE sex AS ENUM ('male', 'female');`;
  await sql`
    CREATE TABLE IF NOT EXISTS metadata (
        kit VARCHAR(8) PRIMARY KEY,
        site VARCHAR(3),
        status status,
        sex sex,
        wgs VARCHAR(13),
        wgbs VARCHAR(13),
        atac VARCHAR(13),
        rna VARCHAR(13)
    )
  `;
} catch (e) {
  console.log(e);
}
