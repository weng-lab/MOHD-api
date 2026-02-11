import { zValidator } from "@hono/zod-validator";
import { sql } from "bun";
import { Hono } from "hono";
import { bedGraphRow, genomicRange } from "../types";

const rows = new Hono();

// use zValidator to validate the query of the request aginst the genomicRange
rows.get("/rows", zValidator("query", genomicRange), async (c) => {
  // get the query params that are valid (type safe)
  const { chrom, start, end } = c.req.valid("query");

  // execute SQL and save output into rows
  const rows = await sql`
      SELECT chrom, chrom_start AS start, chrom_end AS end, data_value AS value from rows
      WHERE chrom = ${chrom}
      AND chrom_start >= ${start}
      AND chrom_end <= ${end}
  `;

  return c.json(rows);
});

rows.post("/rows", zValidator("json", bedGraphRow), async (c) => {
  const { chrom, start, end, value } = c.req.valid("json");

  await sql`
    INSERT INTO rows (chrom, chrom_start, chrom_end, data_value)
    VALUES (${chrom}, ${start}, ${end}, ${value})
  `;

  return c.text("complete");
});

export default rows;
