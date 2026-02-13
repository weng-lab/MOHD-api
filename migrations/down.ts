import { sql } from "../src/db";

try {
  await sql`DROP TABLE IF EXISTS rna_tpm`;
  console.log("dropped table");
} catch (e) {
  console.log(e);
}
