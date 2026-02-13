import { Hono } from "hono";
import { sql } from "../db";
import z from "zod";
import { zValidator } from "@hono/zod-validator";

const rna_tpm = new Hono();

const RNA_TPM = z.object({
  accession: z.string(),
});

rna_tpm.get("/", zValidator("query", RNA_TPM), async (c) => {
  const { accession } = c.req.valid("query");

  try {
    const values =
      await sql`SELECT values FROM rna_tpm WHERE accession = ${accession}`;
    return c.json(values);
  } catch (e) {
    console.log(e);
  }
});

export default rna_tpm;
