import type { RootResolver } from "@hono/graphql-server";
import { sql } from "../db";
import { genomicRange } from "../types";

export async function rowsResolver(args: any) {
  const { chrom, start, end } = genomicRange.parse(args);

  const rows = await sql`
      SELECT chrom, chrom_start AS start, chrom_end AS end, data_value AS value from rows
      WHERE chrom = ${chrom}
      AND chrom_start >= ${start}
      AND chrom_end <= ${end}
  `;

  return rows;
}

export const rootResolver: RootResolver = (c) => {
  return {
    rows: rowsResolver,
  };
};
