import { streamImport } from "./utils";
import { sql } from "./db";

const filePath =
  "https://users.wenglab.org/niship/Phase_0_ATAC_zscores.tsv";

export async function createATACTables() {
   await sql`
    CREATE TABLE IF NOT EXISTS atac_zscore (
        accession VARCHAR(20) PRIMARY KEY,
        zscore_values NUMERIC(10, 2)[]
    )
  `;
}  
export async function importAtac() {
  await streamImport(filePath, "atac_zscore", (line) => {
    const columns = line.split("\t");
    const accession = columns[0]!;
    const values = columns.slice(1).map(Number);
    return { accession, zscore_values: `{${values.join(",")}}` };
  });
}
