import { sql } from "../src/db";

try {
  await sql`
    CREATE TABLE IF NOT EXISTS rna_tpm (
        accession VARCHAR(15) PRIMARY KEY,
        values REAL[]
    )
  `;
  console.log("created table");
} catch (e) {
  console.log(e);
}
