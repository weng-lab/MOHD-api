import { sql } from "./db";

export async function fetchTsv(url: string): Promise<string[]> {
  const response = await fetch(url);
  const text = await response.text();
  return text.split("\n").slice(1).filter(Boolean);
}

export async function insertRows(
  table: string,
  rows: Record<string, string>[],
) {
  for (let i = 0; i < rows.length; i += 500) {
    await sql`INSERT INTO ${sql(table)} ${sql(rows.slice(i, i + 500))}`;
  }
  console.log(`inserted ${rows.length} ${table} rows`);
}
