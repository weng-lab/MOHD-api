import type { RootResolver } from "@hono/graphql-server";
import { sql } from "../db";
import z from "zod";

const rnaQuery = z.object({
  accession: z.string(),
});
export async function rnaResolver(args: any) {
  const { accession } = rnaQuery.parse(args);

  const values = await sql`
      SELECT * FROM rna_tpm WHERE accession = ${accession}
  `;

  return values;
}

export const rootResolver: RootResolver = (c) => {
  return {
    rows: rnaResolver,
  };
};
