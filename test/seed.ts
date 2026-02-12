import { sql } from "bun";

let rows = [];
for (let i = 0; i < 200; i += 10) {
  const start = i;
  rows.push({
    chrom: "chr1",
    chrom_start: i,
    chrom_end: start + 10,
    data_value: i,
  });
}

try {
  await sql`INSERT INTO rows ${sql(rows)}`;
} catch (e) {
  console.log(e);
}
