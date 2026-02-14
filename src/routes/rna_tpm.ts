import { Hono } from "hono";
import { sql } from "../db";
import z from "zod";
import { zValidator } from "@hono/zod-validator";

const rna_tpm = new Hono();

const RNA_TPM = z.object({
  gene_id: z.string(),
});

rna_tpm.get("/", zValidator("query", RNA_TPM), async (c) => {
  const { gene_id } = c.req.valid("query");

  const result =
    await sql`SELECT tpm_values FROM rna_tpm WHERE gene_id = ${gene_id}`;

  if (result.length === 0) {
    c.status(404);
    return c.text(`gene id ${gene_id} does not exist`);
  }

  return c.json(result[0].tpm_values.map(Number));
});

export default rna_tpm;
