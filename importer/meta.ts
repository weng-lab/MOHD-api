import { fetchTsv, insertRows } from "./utils";

const rnaFilePath = "https://users.wenglab.org/niship/Phase-0-Metadata.txt";
const atacFilePath =
  "https://users.wenglab.org/niship/Phase_0_ATAC_Metadata_with_entity.tsv";

const sexMap: Record<string, string> = { "1": "male", "2": "female" };

const validStatuses = new Set(["case", "control", "unknown"]);

function isValidRow(row: Record<string, string>): boolean {
  return (
    Object.values(row).every((v) => v !== undefined && v !== "") &&
    validStatuses.has(row.status!)
  );
}

export async function importMeta() {
  const rnaLines = await fetchTsv(rnaFilePath);
  const rnaRows = rnaLines.map(parseRnaLine).filter(isValidRow);
  await insertRows("rna_metadata", rnaRows);

  const atacLines = await fetchTsv(atacFilePath);
  const atacRows = atacLines.map(parseAtacLine).filter(isValidRow);
  await insertRows("atac_metadata", atacRows);
}

function parseRnaLine(line: string) {
  const [kit, site, status, sex, sample_id] = line.split("\t");
  return {
    sample_id: sample_id!.trim(),
    kit: kit!.trim(),
    site: site!.trim(),
    status: status!.trim(),
    sex: sexMap[sex!.trim()]!,
  };
}

function parseAtacLine(line: string) {
  const [sample_id, site, opc_id, protocol, status, sex, entity_id] =
    line.split("\t");
  return {
    sample_id: sample_id!.trim(),
    site: site!.trim(),
    opc_id: opc_id!.trim(),
    protocol: protocol!.trim(),
    status: status!.trim().toLowerCase(),
    sex: sexMap[sex!.trim()]!,
    entity_id: entity_id!.trim(),
  };
}
