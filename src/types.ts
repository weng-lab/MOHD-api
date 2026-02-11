import z from "zod";

// zod object to validate against
export const genomicRange = z.object({
  chrom: z.string(),
  start: z.coerce.number().int(),
  end: z.coerce.number().int(),
});

// another zod object, extends genomic range
export const bedGraphRow = genomicRange.extend({
  value: z.coerce.number(),
});

// infer types from zod objects
type GenomicRange = z.infer<typeof genomicRange>;
type Row = z.infer<typeof bedGraphRow>;
