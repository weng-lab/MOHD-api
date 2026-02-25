import { sql } from "./db";
import { importAtac, createATACTables } from "./atac";
import { importMeta, createMetaTables } from "./meta";
import { importRna, createRNATables } from "./rna";

// ---------------------------
// Parse command-line arguments
// ---------------------------

const dataTypes: string[] = [];
let schema: string | undefined;

process.argv.forEach((arg, i, args) => {
  if (arg === "--datatype" && args[i + 1]) {
    dataTypes.push(args[i + 1].toLowerCase());
  }
  if (arg === "--schema" && args[i + 1]) {
    schema = args[i + 1].toLowerCase();
  }
});

if (dataTypes.length === 0) {
  console.error("At least one --datatype is required (rna, atac, meta)");
  process.exit(1);
}

if (!schema) {
  console.error("Please provide --schema argument");
  process.exit(1);
}

console.log(`Using schema: ${schema}`);
console.log(`Data types to process: ${dataTypes.join(", ")}`);

// ---------------------------
// Ensure schema exists
// ---------------------------
await sql`CREATE SCHEMA IF NOT EXISTS ${sql(schema)}`;
await sql`SET search_path TO ${sql(schema)}`;

// ---------------------------
// Process each datatype
// ---------------------------
for (const type of dataTypes) {
  switch (type) {
    case "rna":
      
      await createRNATables();
      console.log("Done creating RNA tables")
      console.log("Running RNA import...");
      await importRna();
      console.log("Finished RNA import...");
      //TODO: drop tables in public and move tables from schema to public
      break;
    case "atac":
      
      await createATACTables();
      console.log("Done creating ATAC tables")
      console.log("Running ATAC import...");
      await importAtac();
      console.log("Finished ATAC import...");
      //TODO: drop tables in public and move tables from schema to public
      break;
    case "meta":
      
      await createMetaTables();
      console.log("Done creating Meta tables")
      console.log("Running Meta import...");
      await importMeta();
      console.log("Finished Metadata import...");
      break;
    default:
      console.error(`Unknown data type: ${type}`);
      process.exit(1);
  }
}

console.log("All requested data types imported successfully.");
process.exit(0);