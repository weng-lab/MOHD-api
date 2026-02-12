import { sql } from "../src/db";

try {
  await sql`
    CREATE TABLE IF NOT EXISTS rows (
        id SERIAL PRIMARY KEY,
        chrom VARCHAR(5),
        chrom_start INTEGER,
        chrom_end INTEGER,
        data_value FLOAT
    )
  `;
  console.log("created table");
} catch (e) {
  console.log(e);
}
