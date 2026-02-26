import { sql } from "../src/db";

try {
  // Drop all tables in the public schema
  const tables = await sql`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `;
  for (const { tablename } of tables) {
    await sql`DROP TABLE IF EXISTS ${sql(tablename)} CASCADE`;
  }

  // Drop all custom types (enums) in the public schema
  const types = await sql`
    SELECT typname FROM pg_type
    WHERE typnamespace = 'public'::regnamespace AND typtype = 'e'
  `;
  for (const { typname } of types) {
    await sql`DROP TYPE IF EXISTS ${sql(typname)} CASCADE`;
  }

  console.log(`dropped ${tables.length} tables and ${types.length} types`);
} catch (e) {
  console.log(e);
}
