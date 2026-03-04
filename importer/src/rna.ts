import { streamImport } from "./utils";
import { sql } from "./db";
const filePath =  process.env.RNA_TPM_FILE || "https://users.wenglab.org/niship/Phase-0_RNA-TPM.tsv";

export async function createRNATables() {
   await sql`
    CREATE TABLE IF NOT EXISTS rna_tpm (
        gene_id VARCHAR(15) PRIMARY KEY,
        tpm_values NUMERIC(10, 2)[]
    )
  `;
}  

export async function importRna() {
  await streamImport(filePath, "rna_tpm", (line) => {
    const columns = line.split("\t");
    const gene_id = columns[0]!.split(".")[0]!;
    const values = columns.slice(1).map(Number);
    return { gene_id, tpm_values: `{${values.join(",")}}` };
  });
}
