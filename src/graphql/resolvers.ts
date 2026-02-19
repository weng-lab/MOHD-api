import type { RootResolver } from "@hono/graphql-server";
import { sql } from "../db";
import z from "zod";

const rnaQuery = z.object({
  gene_ids: z.array(z.string()),
});

export async function rnaResolver(args: unknown) {
  const { gene_ids } = rnaQuery.parse(args);

  if (gene_ids.length === 0) return [];

  const pgArray = `{${gene_ids.join(",")}}`;
  const genes = await sql`
    SELECT gene_id, tpm_values FROM rna_tpm WHERE gene_id = ANY(${pgArray}::text[])
  `;

  const tpmByGene = new Map<string, string[]>();
  for (const gene of genes) {
    tpmByGene.set(gene.gene_id, gene.tpm_values);
  }

  const samples = await sql`
    SELECT * FROM rna_metadata ORDER BY sample_id
  `;

  return gene_ids.map((gene_id: string) => {
    const tpmValues = tpmByGene.get(gene_id);
    return {
      gene_id,
      samples: tpmValues
        ? tpmValues.map((value: string, i: number) => ({
            value: Number(value),
            ...samples[i],
          }))
        : [],
    };
  });
}

const atacQuery = z.object({
  accessions: z.array(z.string()),
});

export async function atacResolver(args: unknown) {
  const { accessions } = atacQuery.parse(args);

  if (accessions.length === 0) return [];

  const pgArray = `{${accessions.join(",")}}`;
  const rows = await sql`
    SELECT accession, zscore_values FROM atac_zscore WHERE accession = ANY(${pgArray}::text[])
  `;

  const zscoreByAccession = new Map<string, string[]>();
  for (const row of rows) {
    zscoreByAccession.set(row.accession, row.zscore_values);
  }

  const samples = await sql`
    SELECT * FROM atac_metadata ORDER BY sample_id
  `;

  return accessions.map((accession: string) => {
    const zscoreValues = zscoreByAccession.get(accession);
    return {
      accession,
      samples: zscoreValues
        ? zscoreValues.map((value: string, i: number) => ({
            value: Number(value),
            ...samples[i],
          }))
        : [],
    };
  });
}

export const rootResolver: RootResolver = () => {
  return {
    rna_tpm: rnaResolver,
    atac_zscore: atacResolver,
  };
};
