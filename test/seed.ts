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

const atac_metadata = [
  {
    sample_id: "SAMPLE_001",
    site: "st1",
    opc_id: "opcA",
    protocol: "prtA",
    status: "case",
    sex: "male",
    entity_id: "entA",
  },
  {
    sample_id: "SAMPLE_002",
    site: "st2",
    opc_id: "opcB",
    protocol: "prtB",
    status: "control",
    sex: "female",
    entity_id: "entB",
  },
  {
    sample_id: "SAMPLE_003",
    site: "st1",
    opc_id: "opcA",
    protocol: "prtA",
    status: "case",
    sex: "female",
    entity_id: "entC",
  },
  {
    sample_id: "SAMPLE_004",
    site: "st2",
    opc_id: "opcB",
    protocol: "prtB",
    status: "control",
    sex: "male",
    entity_id: "entD",
  },
  {
    sample_id: "SAMPLE_005",
    site: "st1",
    opc_id: "opcA",
    protocol: "prtA",
    status: "unknown",
    sex: "male",
    entity_id: "entE",
  },
];

const atac_zscore = [];
for (let i = 0; i < 10; i++) {
  const values = atac_metadata.map((_, j) => (i + j).toFixed(2));
  atac_zscore.push({
    accession: String(i),
    zscore_values: `{${values.join(",")}}`,
  });
}

try {
  await sql`INSERT INTO rna_metadata ${sql(metadata)}`;
  await sql`INSERT INTO rna_tpm ${sql(rna_tpm)}`;
  await sql`INSERT INTO atac_metadata ${sql(atac_metadata)}`;
  await sql`INSERT INTO atac_zscore ${sql(atac_zscore)}`;
} catch (e) {
  console.log(e);
}
