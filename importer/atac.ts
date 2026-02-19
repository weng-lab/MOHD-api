import { streamImport } from "./utils";

const filePath =
  "https://users.wenglab.org/niship/Phase_0_ATAC_zscores.tsv";

export async function importAtac() {
  await streamImport(filePath, "atac_zscore", (line) => {
    const columns = line.split("\t");
    const accession = columns[0]!;
    const values = columns.slice(1).map(Number);
    return { accession, zscore_values: `{${values.join(",")}}` };
  });
}
