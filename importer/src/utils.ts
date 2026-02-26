import { sql } from "./db";

export async function streamImport(
  url: string,
  table: string,
  parseLine: (line: string) => Record<string, string>,
) {
  console.log(`streaming ${table} from ${url}...`);
  //const response = await fetch(url);
  //const reader = response.body!.getReader();

  const reader = await getReader(url);

  const decoder = new TextDecoder();

  let buffer = "";
  let isHeader = true;
  let batch: Record<string, string>[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop()!;

    for (const line of lines) {
      if (isHeader) {
        isHeader = false;
        continue;
      }
      if (line.trim().length === 0) continue;

      const row = parseLine(line);
      if (isValidRow(row)) batch.push(row);

      if (batch.length >= 500) {
        await insertRows(table, batch);
        total += batch.length;
        console.log(`${table}: ${total} rows inserted`);
        batch = [];
      }
    }
  }

  if (batch.length > 0) {
    await insertRows(table, batch);
    total += batch.length;
  }

  console.log(`inserted ${total} ${table} rows`);
}

async function getReader(source: string) {
  
  // HTTP or HTTPS
  if (source.startsWith("http://") || source.startsWith("https://")) {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${source}: ${response.statusText}`);
    }
    return response.body!.getReader();
  }

  // file:// path
  if (source.startsWith("file://")) {
    const path = source.replace("file://", "");
    const file = Bun.file(path);
    return file.stream().getReader();
  }

  // assume local file path
  const file = Bun.file(source);
  if (!(await file.exists())) {
    throw new Error(`Local file not found: ${source}`);
  }

  return file.stream().getReader();
}


async function insertRows(table: string, rows: Record<string, string>[]) {
  await sql`INSERT INTO ${sql(table)} ${sql(rows)}`;
}

function isValidRow(row: Record<string, string>): boolean {
  return Object.values(row).every((v) => v !== undefined && v !== "");
}
