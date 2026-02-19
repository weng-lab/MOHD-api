import { fetchTsv, insertRows } from "./utils";

const filePath = "https://users.wenglab.org/niship/Phase-0_RNA-TPM.tsv";

export async function importRna() {
  const lines = await fetchTsv(filePath);
  const rows = lines.map(processLine);
  await insertRows("rna_tpm", rows);
}

function processLine(line: string) {
  const columns = line.split("\t");
  const gene_id = columns[0]!.split(".")[0]!;
  const values = columns.slice(1).map(Number);
  return { gene_id, tpm_values: `{${values.join(",")}}` };
}
