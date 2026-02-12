import { describe, expect, test } from "bun:test";
import app from "../src";

describe("health", () => {
  test("api and db running", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
  });
});

describe("rows", () => {
  test("zod error", async () => {
    const res = await app.request("/rows");
    expect(res.status).toBe(400);
    const body = (await res.json()) as any;
    expect(body.error.name).toBe("ZodError");
  });

  test("get some data", async () => {
    const res = await app.request(
      "http://localhost/rows?chrom=chr1&start=0&end=10",
    );
    const body = (await res.json()) as any;

    expect(body[0].chrom).toBe("chr1");
    expect(body[0].start).toBe(0);
    expect(body[0].end).toBe(10);
    expect(body[0].value).toBe(0);
  });
});

describe("gql", () => {
  test("post", async () => {
    const req = new Request("http://localhost/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query:
          '{ rows(chrom: "chr1", start: 0, end: 10) { chrom, start, end, value } }',
      }),
    });
    const res = await app.request(req);
    const body = (await res.json()) as any;

    expect(body.data.rows[0].chrom).toBe("chr1");
    expect(body.data.rows[0].start).toBe(0);
    expect(body.data.rows[0].end).toBe(10);
    expect(body.data.rows[0].value).toBe(0);
  });
});
