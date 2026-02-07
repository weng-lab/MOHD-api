import { sql } from "bun";

const create = sql`
  CREATE TABLE IF NOT EXISTS bed_rows (
      id SERIAL PRIMARY KEY,
      chrom VARCHAR(5),
      chromStart INTEGER,
      chromEnd INTEGER,
      dataValue FLOAT
  )
`;

try {
  await create;
  console.log("created table");
} catch (e) {
  console.log(e);
}
