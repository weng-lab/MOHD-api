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
    CREATE TABLE IF NOT EXISTS atac_metadata (
        sample_id VARCHAR(15) PRIMARY KEY,
        site VARCHAR(3) NOT NULL,
        opc_id VARCHAR(10) NOT NULL,
        protocol VARCHAR(20) NOT NULL,
        status status NOT NULL,
        sex sex NOT NULL,
        entity_id VARCHAR(20) NOT NULL,
        umap_x NUMERIC(10, 6),
        umap_y NUMERIC(10, 6)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS rna_metadata (
        sample_id VARCHAR(15) PRIMARY KEY,
        kit VARCHAR(10) NOT NULL,
        site VARCHAR(3) NOT NULL,
        status status NOT NULL,
        sex sex NOT NULL,
        umap_x NUMERIC(10, 6),
        umap_y NUMERIC(10, 6)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS atac_zscore (
        accession VARCHAR(20) PRIMARY KEY,
        zscore_values NUMERIC(10, 2)[]
    )
  `;
} catch (e) {
  console.log(e);
}
