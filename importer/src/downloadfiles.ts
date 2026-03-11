import { streamImport } from "./utils";
import { sql } from "./db";

const filePath =
  process.env.DOWNLOAD_FILES || "https://users.wenglab.org/niship/mohd/mohd_phase_0_all_files.tsv";

export async function createDownloadFilesTables() {
   await sql`CREATE TYPE ome AS ENUM ('ATAC-seq','Exposomics','Lipidomics','Metabolomics','Proteomics','RNA-seq','WGBS','WGS');`;
   await sql`
     CREATE TABLE IF NOT EXISTS  mohd_download_files (
        sample_id VARCHAR(15) NOT NULL,
        filename TEXT NOT NULL,        
        file_type  TEXT NOT NULL,
        size TEXT NOT NULL,
        file_ome ome NOT NULL,
        open_access BOOLEAN  NOT NULL
    )
  `;
}  
export async function importDownloadFiles() {
 await streamImport(filePath, "mohd_download_files", (line) => {
     const [dataset, filename, file_type, size, file_ome, open_access] =
       line.split("\t");
     return {
       sample_id: dataset!.trim(),
       filename: filename!.trim(),
       file_type: file_type!.trim(),
       size: size!.trim(),
       file_ome: file_ome!.trim(),
       open_access: open_access!.trim().toLowerCase() === "true" ? "true" : "false" // as string
     };
   });
}
