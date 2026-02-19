import type { RootResolver } from "@hono/graphql-server";
import { sql } from "../db";
import z from "zod";

const rnaQuery = z.object({
  gene_id: z.string(),
});

export async function rnaResolver(args: unknown) {
  const { gene_id } = rnaQuery.parse(args);

  const genes = await sql`
    SELECT tpm_values FROM rna_tpm WHERE gene_id = ${gene_id}
  `;

  if (genes.length === 0) return null;

  const samples = await sql`
    SELECT * FROM rna_metadata ORDER BY sample_id
  `;

  return genes[0].tpm_values.map((value: string, i: number) => ({
    value: Number(value),
    ...samples[i],
  }));
}

export const rootResolver: RootResolver = () => {
  return {
    rna_tpm: rnaResolver,
  };
};
