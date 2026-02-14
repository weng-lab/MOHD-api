import { SQL } from "bun";

export const sql = new SQL({
  url: process.env.POSTGRES_URL,
  path: process.env.POSTGRES_PATH,
});

const filePath = "https://users.wenglab.org/niship/Phase-0_RNA-TPM.tsv";
const file = await fetch(filePath);
const text = await file.text();

const rows = text.split("\n").slice(1).map(processLine);

for (let i = 0; i < rows.length; i += 500) {
  await insertRows(rows.slice(i, i + 500));
}
console.log("inserted rows");

async function insertRows(
  rows: {
    gene_id: string;
    tpm_values: string;
  }[],
) {
  try {
    await sql`INSERT INTO rna_tpm ${sql(rows)}`;
  } catch (e) {
    console.log(e);
  }
}

function processLine(line: string) {
  const columns = line.split("\t");
  const gene_id = columns[0]!.split(".")[0]!; // remove version number
  const values = columns.slice(1).map(Number);
  const pgArray = `{${values.join(",")}}`;

  return { gene_id: gene_id, tpm_values: pgArray };
}
