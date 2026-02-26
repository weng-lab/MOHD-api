import { SQL } from "bun";

export const sql = new SQL({
  url: process.env.POSTGRES_URL,
  path: process.env.POSTGRES_PATH,
});
