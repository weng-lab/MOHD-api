import { graphqlServer } from "@hono/graphql-server";
import { Hono } from "hono";
import { sql } from "./db";
import { logger } from "hono/logger";
import { rootResolver } from "./graphql/resolvers";
import { schema } from "./graphql/schema";
import rows from "./routes/rows";

// create an instance of hono
const app = new Hono();

// use the logger middleware
app.use(logger());

app.use(
  "/graphql",
  graphqlServer({
    schema,
    rootResolver,
    graphiql: true,
  }),
);

app.route("/rows", rows);

app.get("/health", async (c) => {
  await sql`SELECT 1`;
  return c.text("ok");
});

// handle all errors and just output a generic message and status
app.onError((err, c) => {
  return c.text("an error occurred", 500);
});

export default app;
