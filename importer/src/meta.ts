import { streamImport } from "./utils";
import { sql } from "./db";

const rnaFilePath =  process.env.RNA_META_FILE  || "https://users.wenglab.org/niship/Phase-0-Metadata.txt";
const atacFilePath =  process.env.ATAC_META_FILE  || "https://users.wenglab.org/niship/Phase_0_ATAC_Metadata_with_entity.tsv";


const sexMap: Record<string, string> = { "1": "male", "2": "female" };

export async function createMetaTables() {
  
  await sql`CREATE TYPE status AS ENUM ('case', 'control', 'unknown');`;
  await sql`CREATE TYPE sex AS ENUM ('male', 'female');`;

   await sql`
    CREATE TABLE IF NOT EXISTS atac_metadata (
        sample_id VARCHAR(15) PRIMARY KEY,
        site VARCHAR(3) NOT NULL,
        opc_id VARCHAR(10) NOT NULL,
        protocol VARCHAR(20) NOT NULL,        
        status status NOT NULL,
        sex sex NOT NULL,
        entity_id VARCHAR(20) NOT NULL,
        umap_x NUMERIC(10, 6),
        umap_y NUMERIC(10, 6),
        biospecimen VARCHAR(20) NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS rna_metadata (
        sample_id VARCHAR(15) PRIMARY KEY,
        kit VARCHAR(10) NOT NULL,
        site VARCHAR(3) NOT NULL,
        status status NOT NULL,
        sex sex NOT NULL,
        umap_x NUMERIC(10, 6),
        umap_y NUMERIC(10, 6)
    )
  `;

}


export async function importMeta() {
  await streamImport(rnaFilePath, "rna_metadata", (line) => {
    const [kit, site, status, sex, sample_id, umap_x, umap_y] =
      line.split("\t");
    return {
      sample_id: sample_id!.trim(),
      kit: kit!.trim(),
      site: site!.trim(),
      status: status!.trim(),
      sex: sexMap[sex!.trim()]!,
      umap_x: umap_x?.trim() || "",
      umap_y: umap_y?.trim() || "",
    };
  });

  await streamImport(atacFilePath, "atac_metadata", (line) => {
    const [sample_id, site, opc_id, protocol, status, sex, entity_id, umap_x, umap_y, biospecimen] =
      line.split("\t");
    return {
      sample_id: sample_id!.trim(),
      site: site!.trim(),
      opc_id: opc_id!.trim(),
      protocol: protocol!.trim(),
      status: status!.trim().toLowerCase(),
      sex: sexMap[sex!.trim()]!,
      entity_id: entity_id!.trim(),
      umap_x: umap_x?.trim() || "",
      umap_y: umap_y?.trim() || "",
      biospecimen: biospecimen!.trim()
    };
  });
}
