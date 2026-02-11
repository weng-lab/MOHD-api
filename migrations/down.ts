import { sql } from "bun";

try {
  await sql`DROP TABLE IF EXISTS rows`;
  console.log("dropped table");
} catch (e) {
  console.log(e);
}
