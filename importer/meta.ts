import { sql } from "./db";

export async function importMeta(filepath: string) {
  const file = await fetch(filepath);
  const text = await file.text();

  const data = JSON.parse(text);

  // await sql`
  //   INSERT INTO meta (id, name, description)
  //   VALUES (${data.id}, ${data.name}, ${data.description})
  // `;
}
