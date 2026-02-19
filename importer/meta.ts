import { streamImport } from "./utils";

const rnaFilePath = "https://users.wenglab.org/niship/Phase-0-Metadata.txt";
const atacFilePath =
  "https://users.wenglab.org/niship/Phase_0_ATAC_Metadata_with_entity.tsv";

const sexMap: Record<string, string> = { "1": "male", "2": "female" };

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
    const [sample_id, site, opc_id, protocol, status, sex, entity_id, umap_x, umap_y] =
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
    };
  });
}
