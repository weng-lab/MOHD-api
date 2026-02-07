import { sql } from "bun";
import { Hono } from "hono";

const app = new Hono();

app.get("/", async (c) => {
  return c.text("yo");
});

app.get("/health", async (c) => {
  try {
    await sql`
      SELECT 1
    `;
    return c.text("ok");
  } catch (e) {
    c.status(500);
    return c.text("failed to connect to database");
  }
});

export default app;
