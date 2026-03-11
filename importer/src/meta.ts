import { streamImport } from "./utils";
import { sql } from "./db";

const rnaFilePath =  process.env.RNA_META_FILE  || "https://users.wenglab.org/niship/mohd/RNA/RNA-Phase-0-Metadata.txt";
const atacFilePath =  process.env.ATAC_META_FILE  || "https://users.wenglab.org/niship/mohd/ATAC/ATAC-Phase-0-Metadata.txt";
const wgsMetadataFilePath =    process.env.WGS_META_FILE  || "https://users.wenglab.org/niship/mohd/WGS/WGS-Phase-0-Metadata.txt"
const wgbsMetadataFilePath =    process.env.WGBS_META_FILE  || "https://users.wenglab.org/niship/mohd/WGBS/WGBS-Phase-0-Metadata.txt"
const proteomicsMetadataFilePath  = process.env.PROTEOMICS_META_FILE  || "https://users.wenglab.org/niship/mohd/Proteomics/Proteomics-Phase-0-Metadata.txt"
const lipidomicsMetadataFilePath  = process.env.LIPIDOMICS_META_FILE  || "https://users.wenglab.org/niship/mohd/Lipidomics/Lipidomics-Phase-0-Metadata.txt"
const exposomicsMetadataFilePath  = process.env.EXPOSOMICS_META_FILE  || "https://users.wenglab.org/niship/mohd/Exposomics/Exposomics-Phase-0-Metadata.txt"
const metabolomicsMetadataFilePath  = process.env.METABOlOMICS_META_FILE  || "https://users.wenglab.org/niship/mohd/Metabolomics/Metabolomics-Phase-0-Metadata.txt"

const sexMap: Record<string, string> = { "1": "female", "2": "male" };

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

   await sql`
    CREATE TABLE IF NOT EXISTS wgs_metadata (
        sample_id VARCHAR(15) PRIMARY KEY,
        kit VARCHAR(10) NOT NULL,
        site VARCHAR(3) NOT NULL,
        status status NOT NULL,
        sex sex NOT NULL
    )
  `;
   await sql`
    CREATE TABLE IF NOT EXISTS wgbs_metadata (
        sample_id VARCHAR(15) PRIMARY KEY,
        kit VARCHAR(10) NOT NULL,
        site VARCHAR(3) NOT NULL,
        status status NOT NULL,
        sex sex NOT NULL
    )
  `;

   await sql`
    CREATE TABLE IF NOT EXISTS exposomics_metadata (
        sample_id VARCHAR(15) PRIMARY KEY,
        kit VARCHAR(10) NOT NULL,
        site VARCHAR(3) NOT NULL,
        status status NOT NULL,
        sex sex NOT NULL
    )
  `;


   await sql`
    CREATE TABLE IF NOT EXISTS proteomics_metadata (
        sample_id VARCHAR(15) PRIMARY KEY,
        kit VARCHAR(10) NOT NULL,
        site VARCHAR(3) NOT NULL,
        status status NOT NULL,
        sex sex NOT NULL
    )
  `;

   await sql`
    CREATE TABLE IF NOT EXISTS metabolomics_metadata (
        sample_id VARCHAR(15) PRIMARY KEY,
        kit VARCHAR(10) NOT NULL,
        site VARCHAR(3) NOT NULL,
        status status NOT NULL,
        sex sex NOT NULL
    )
  `;

   await sql`
    CREATE TABLE IF NOT EXISTS lipidomics_metadata (
        sample_id VARCHAR(15) PRIMARY KEY,
        kit VARCHAR(10) NOT NULL,
        site VARCHAR(3) NOT NULL,
        status status NOT NULL,
        sex sex NOT NULL
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
      umap_y: umap_y?.trim() || ""
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

  await streamImport(wgsMetadataFilePath, "wgs_metadata", (line) => {
    const [kit, site, status, sex, sample_id] =
      line.split("\t");
    return {
      sample_id: sample_id!.trim(),
      kit: kit!.trim(),
      site: site!.trim(),
      status: status!.trim(),
      sex: sexMap[sex!.trim()]!
    };
  });

  await streamImport(wgbsMetadataFilePath, "wgbs_metadata", (line) => {
    const [kit, site, status, sex, sample_id] =
      line.split("\t");
    return {
      sample_id: sample_id!.trim(),
      kit: kit!.trim(),
      site: site!.trim(),
      status: status!.trim(),
      sex: sexMap[sex!.trim()]!
    };
  });

  await streamImport(proteomicsMetadataFilePath, "proteomics_metadata", (line) => {
    const [kit, site, status, sex, sample_id] =
      line.split("\t");
    return {
      sample_id: sample_id!.trim(),
      kit: kit!.trim(),
      site: site!.trim(),
      status: status!.trim(),
      sex: sexMap[sex!.trim()]!
    };
  });

   await streamImport(lipidomicsMetadataFilePath, "lipidomics_metadata", (line) => {
    const [kit, site, status, sex, sample_id] =
      line.split("\t");
    return {
      sample_id: sample_id!.trim(),
      kit: kit!.trim(),
      site: site!.trim(),
      status: status!.trim(),
      sex: sexMap[sex!.trim()]!
    };
  });

   await streamImport(metabolomicsMetadataFilePath, "metabolomics_metadata", (line) => {
    const [kit, site, status, sex, sample_id] =
      line.split("\t");
    return {
      sample_id: sample_id!.trim(),
      kit: kit!.trim(),
      site: site!.trim(),
      status: status!.trim(),
      sex: sexMap[sex!.trim()]!
    };
  });

  await streamImport(exposomicsMetadataFilePath, "exposomics_metadata", (line) => {
    const [kit, site, status, sex, sample_id] =
      line.split("\t");
    return {
      sample_id: sample_id!.trim(),
      kit: kit!.trim(),
      site: site!.trim(),
      status: status!.trim(),
      sex: sexMap[sex!.trim()]!
    };
  });
  
}
