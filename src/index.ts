import { graphqlServer } from "@hono/graphql-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { sql } from "./db";
import { rootResolver } from "./graphql/resolvers";
import { schema } from "./graphql/schema";

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

app.get("/health", async (c) => {
  await sql`SELECT 1`;
  return c.text("ok");
});

// handle all errors and just output a generic message and status
app.onError((err, c) => {
  return c.text("an error occurred", 500);
});

export default app;
