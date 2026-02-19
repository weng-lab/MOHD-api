import { importAtac } from "./atac";
import { importMeta } from "./meta";
import { importRna } from "./rna";

const dataType = process.argv[2];
if (!dataType) {
  console.error("Data type is required");
  process.exit(1);
}

switch (dataType) {
  case "rna":
    await importRna();
    process.exit(0);
  case "atac":
    await importAtac();
    process.exit(0);
  case "meta":
    await importMeta();
    process.exit(0);
  default:
    console.error(`Unknown data type: ${dataType}`);
    process.exit(1);
}
