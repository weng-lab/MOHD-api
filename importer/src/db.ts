import { SQL } from "bun";

// Global instance of Bun SQL
export const sql = new SQL({
  url: process.env.POSTGRES_URL,
  path: process.env.POSTGRES_PATH,
});
