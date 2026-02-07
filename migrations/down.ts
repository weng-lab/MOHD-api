import { sql } from "bun";

const drop = sql`DROP TABLE IF EXISTS bed_rows`;

try {
  await drop;
  console.log("dropped table");
} catch (e) {
  console.log(e);
}
