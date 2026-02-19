import { sql } from "../src/db";

const metadata = [
  {
    sample_id: "SAMPLE_001",
    kit: "kitA",
    site: "st1",
    status: "case",
    sex: "male",
  },
  {
    sample_id: "SAMPLE_002",
    kit: "kitB",
    site: "st2",
    status: "control",
    sex: "female",
  },
  {
    sample_id: "SAMPLE_003",
    kit: "kitA",
    site: "st1",
    status: "case",
    sex: "female",
  },
  {
    sample_id: "SAMPLE_004",
    kit: "kitB",
    site: "st2",
    status: "control",
    sex: "male",
  },
  {
    sample_id: "SAMPLE_005",
    kit: "kitA",
    site: "st1",
    status: "unknown",
    sex: "male",
  },
];

const rna_tpm = [];
for (let i = 0; i < 10; i++) {
  const values = metadata.map((_, j) => (i + j).toFixed(2));
  rna_tpm.push({
    gene_id: String(i),
    tpm_values: `{${values.join(",")}}`,
  });
}

try {
  await sql`INSERT INTO rna_metadata ${sql(metadata)}`;
  await sql`INSERT INTO rna_tpm ${sql(rna_tpm)}`;
} catch (e) {
  console.log(e);
}
