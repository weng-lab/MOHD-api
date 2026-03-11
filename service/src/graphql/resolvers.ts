import type { RootResolver } from "@hono/graphql-server";
import { sql } from "../db";
import z from "zod";

const omeEnumToDb: Record<string, string> = {
  ATAC_SEQ: "ATAC-seq",
  EXPOSOMICS: "Exposomics",
  LIPIDOMICS: "Lipidomics",
  METABOLOMICS: "Metabolomics",
  PROTEOMICS: "Proteomics",
  RNA_SEQ: "RNA-seq",
  WGBS: "WGBS",
  WGS: "WGS",
};
// Reverse mapping for returning GraphQL enum values
const dbToOmeEnum: Record<string, string> = Object.fromEntries(
  Object.entries(omeEnumToDb).map(([k, v]) => [v, k])
);

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
        ? tpmValues
            .filter((_: string, i: number) => samples[i])
            .map((value: string, i: number) => ({
              value: Number(value),
              metadata: samples[i]
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
        ? zscoreValues
            .filter((_: string, i: number) => samples[i])
            .map((value: string, i: number) => ({
              value: Number(value),
              metadata: samples[i], 
            }))
        : [],
    };
  });
}
/* ---------------- RNA METADATA ---------------- */

export async function rnaMetadataResolver() {
  const rows = await sql`
    SELECT
      sample_id,
      kit,
      site,
      status,
      sex,
      umap_x,
      umap_y
    FROM rna_metadata
    ORDER BY sample_id
  `;

  return rows;
}

/* ---------------- ATAC METADATA ---------------- */

export async function atacMetadataResolver() {
  const rows = await sql`
    SELECT
      sample_id,
      site,
      opc_id,
      protocol,
      status,
      sex,
      entity_id,
      umap_x,
      umap_y,
      biospecimen
    FROM atac_metadata
    ORDER BY sample_id
  `;

  return rows;
}

export async function wgsMetadataResolver() {
   const rows = await sql`
    SELECT
      sample_id,
      kit,
      site,
      status,
      sex
    FROM wgs_metadata
    ORDER BY sample_id
  `;

  return rows;

}
export async function wgbsMetadataResolver() {
   const rows = await sql`
    SELECT
      sample_id,
      kit,
      site,
      status,
      sex
    FROM wgbs_metadata
    ORDER BY sample_id
  `;

  return rows;

}
export async function exposomicsMetadataResolver() {
   const rows = await sql`
    SELECT
      sample_id,
      kit,
      site,
      status,
      sex
    FROM exposomics_metadata
    ORDER BY sample_id
  `;

  return rows;

}
export async function proteomicsMetadataResolver() {
   const rows = await sql`
    SELECT
      sample_id,
      kit,
      site,
      status,
      sex
    FROM proteomics_metadata
    ORDER BY sample_id
  `;

  return rows;

}
export async function lipidomicsMetadataResolver() {
   const rows = await sql`
    SELECT
      sample_id,
      kit,
      site,
      status,
      sex
    FROM lipidomics_metadata
    ORDER BY sample_id
  `;

  return rows;

}
export async function metabolomicsMetadataResolver() {
   const rows = await sql`
    SELECT
      sample_id,
      kit,
      site,
      status,
      sex
    FROM metabolomics_metadata
    ORDER BY sample_id
  `;

  return rows;

}

export async function fetchDownloadFilesResolver( args: { ome: string; sample_id?: string[] }) {
      const { ome, sample_id } = args;
      if (!ome) {
        throw new Error("Argument 'ome' is required");
      }

      // Convert GraphQL enum value to DB string
      const dbOmeValue = omeEnumToDb[ome];
      if (!dbOmeValue) {
        throw new Error(`Invalid ome enum value: ${ome}`);
      }
      // Base query
      let query = sql`
        SELECT sample_id, filename, file_type, size, file_ome, open_access
        FROM mohd_download_files
        WHERE file_ome = ${dbOmeValue}
      `;
      
      if (sample_id && sample_id.length > 0) {
        query = sql`${query} AND sample_id = ANY(${sql.array(sample_id, 'varchar')})`;
      }

      // Execute query
      const rows = await query;

      // Return results with GraphQL enum values
      return rows.map((row: any) => ({
        sample_id: row.sample_id,
        filename: row.filename,
        file_type: row.file_type,
        size: row.size,
        file_ome: dbToOmeEnum[row.file_ome] || row.file_ome,
        open_access: row.open_access,
      }));                       

  
}
export const rootResolver: RootResolver = () => {
  return {
    rna_tpm: rnaResolver,
    atac_zscore: atacResolver,
    rna_metadata: rnaMetadataResolver,
    atac_metadata: atacMetadataResolver,
    wgs_metadata: wgsMetadataResolver,
    wgbs_metadata: wgbsMetadataResolver,
    exposomics_metadata: exposomicsMetadataResolver,
    proteomics_metadata: proteomicsMetadataResolver,
    lipidomics_metadata: lipidomicsMetadataResolver,
    metabolomics_metadata: metabolomicsMetadataResolver,
    fetch_download_files: fetchDownloadFilesResolver
  };
};