import { importRna } from "./rna";

const dataType = process.argv[3];
if (!dataType) {
  console.error("Data type is required");
  process.exit(1);
}
const fileUrl = process.argv[4];
if (!fileUrl) {
  console.error("File URL is required");
  process.exit(1);
}
switch (dataType) {
  case "rna":
    await importRna(fileUrl);
    process.exit(0);
  default:
    console.error(`Unknown data type: ${dataType}`);
    process.exit(1);
}
