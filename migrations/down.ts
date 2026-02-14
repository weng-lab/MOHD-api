import { sql } from "../src/db";

try {
  await sql`DROP TABLE IF EXISTS rna_tpm`;
  await sql`DROP TABLE IF EXISTS metadata`;
  await sql`DROP TYPE IF EXISTS sex`;
  await sql`DROP TYPE IF EXISTS status`;
  console.log("dropped tables and types");
} catch (e) {
  console.log(e);
}
