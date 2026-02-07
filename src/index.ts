import { zValidator } from "@hono/zod-validator";
import { sql } from "bun";
import { Hono } from "hono";
import { logger } from "hono/logger";
import * as z from "zod";

// create an instance of hono
const app = new Hono();

// use the logger middleware
app.use(logger());

// zod object to validate against
const genomicRange = z.object({
  chrom: z.string(),
  start: z.coerce.number(), // cast (coerce) from string to number
  end: z.coerce.number(),
});

// another zod object, extends genomic range
const bedGraphRow = genomicRange.extend({
  value: z.coerce.number(),
});

// get method /rows
// use zValidator to validate the query of the request aginst the genomicRange
app.get("/rows", zValidator("query", genomicRange), async (c) => {
  // get the query params that are valid (type safe)
  const { chrom, start, end } = c.req.valid("query");

  // execute SQL and save output into rows
  const rows = await sql`
      SELECT * from rows
      WHERE chrom = ${chrom}
      AND chrom_start >= ${start}
      AND chrom_end <= ${end}
  `;

  return c.json(rows);
});

app.post("/rows", zValidator("json", bedGraphRow), async (c) => {
  const { chrom, start, end, value } = c.req.valid("json");

  await sql`
    INSERT INTO rows (chrom, chrom_start, chrom_end, data_value)
    VALUES (${chrom}, ${start}, ${end}, ${value})
  `;

  return c.text("complete");
});

app.get("/health", async (c) => {
  await sql`SELECT 1`;
  return c.text("ok");
});

// handle all errors and just output a generic message and status
app.onError((err, c) => {
  console.log(`${err}`);
  return c.text("an error occurred", 500);
});

export default app;
