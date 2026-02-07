import { sql } from "bun";

try {
  const create = await sql`
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

let rows = [];
for (let i = 0; i < 100000; i += 10) {
  const start = i;
  rows.push({
    chrom: "chr1",
    chrom_start: i,
    chrom_end: start + 10,
    data_value: Math.floor(Math.random() * 1000),
  });
}

try {
  await sql`INSERT INTO rows ${sql(rows)}`;
} catch (e) {
  console.log(e);
}
