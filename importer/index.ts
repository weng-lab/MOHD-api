import { file, sql } from "bun";

const filePath = process.argv[2];

if (!filePath) {
  console.error("Please provide a file path as an argument.");
  process.exit(1);
}

const f = file(filePath);
if (!(await f.exists())) {
  console.error(`File ${filePath} does not exist.`);
  process.exit(1);
}

const stream = f.stream();
const decoder = new TextDecoder();

let buffer = "";
let first = 1;
for await (const chunk of stream) {
  buffer += decoder.decode(chunk, { stream: true });
  const lines = buffer.split("\n");
  buffer = lines.pop() ?? "";

  for (const line of lines) {
    if (first) {
      first = 0;
      continue;
    }
    await processLine(line);
  }
}

if (buffer) {
  await processLine(buffer);
}

async function processLine(line: string) {
  const columns = line.split("\t");
  const accession = columns[0]!.split(".")[0]; // remove version number
  const values = columns.slice(1).map(Number);
  const pgArray = `{${values.join(",")}}`;

  try {
    sql`INSERT INTO rna_tpm (accession, values) VALUES (${accession}, ${pgArray}::REAL[])`;
    console.log(`Inserted ${accession}`);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
}
