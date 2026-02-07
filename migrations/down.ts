import { sql } from "bun";

const drop = sql`DROP TABLE IF EXISTS rows`;

try {
  await drop;
  console.log("dropped table");
} catch (e) {
  console.log(e);
}
