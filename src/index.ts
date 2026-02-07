import { zValidator } from "@hono/zod-validator";
import { sql } from "bun";
import { Hono } from "hono";
import { logger } from "hono/logger";
import * as z from "zod";

const app = new Hono();

app.use(logger());

const genomicRange = z.object({
  chrom: z.string(),
  start: z.coerce.number(),
  end: z.coerce.number(),
});

const bedGraphRow = genomicRange.extend({
  value: z.coerce.number(),
});

app.get("/rows", zValidator("query", genomicRange), async (c) => {
  const { chrom, start, end } = c.req.valid("query");

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

app.onError((err, c) => {
  console.log(`${err}`);
  return c.text("an error occurred", 500);
});

export default app;
