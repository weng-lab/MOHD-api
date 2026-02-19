import { describe, expect, test } from "bun:test";
import app from "../src";

function gql(query: string) {
  return new Request("http://localhost/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
}

describe("health", () => {
  test("returns 200 ok", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("ok");
  });
});

describe("not found", () => {
  test("returns 404 for unknown route", async () => {
    const res = await app.request("/nonexistent");
    expect(res.status).toBe(404);
  });
});

describe("graphql rna_tpm", () => {
  test("single gene returns samples with metadata", async () => {
    const res = await app.request(
      gql(
        '{ rna_tpm(gene_ids: ["0"]) { gene_id, samples { value, sample_id, kit, site, status, sex } } }',
      ),
    );
    const body = (await res.json()) as any;
    const gene = body.data.rna_tpm[0];

    expect(gene.gene_id).toBe("0");
    expect(gene.samples).toHaveLength(5);
    expect(gene.samples[0].value).toBe(0);
    expect(gene.samples[0].sample_id).toBe("SAMPLE_001");
    expect(gene.samples[0].kit).toBe("kitA");
    expect(gene.samples[0].site).toBe("st1");
    expect(gene.samples[0].status).toBe("case");
    expect(gene.samples[0].sex).toBe("male");
  });

  test("multiple genes", async () => {
    const res = await app.request(
      gql('{ rna_tpm(gene_ids: ["0", "1"]) { gene_id, samples { value } } }'),
    );
    const body = (await res.json()) as any;
    const genes = body.data.rna_tpm;

    expect(genes).toHaveLength(2);
    expect(genes[0].gene_id).toBe("0");
    expect(genes[1].gene_id).toBe("1");
    // gene "1" first sample should be 1.00
    expect(genes[1].samples[0].value).toBe(1);
  });

  test("non-existent gene returns empty samples", async () => {
    const res = await app.request(
      gql(
        '{ rna_tpm(gene_ids: ["nonexistent"]) { gene_id, samples { value } } }',
      ),
    );
    const body = (await res.json()) as any;
    const gene = body.data.rna_tpm[0];

    expect(gene.gene_id).toBe("nonexistent");
    expect(gene.samples).toHaveLength(0);
  });

  test("empty gene_ids returns empty array", async () => {
    const res = await app.request(gql("{ rna_tpm(gene_ids: []) { gene_id } }"));
    const body = (await res.json()) as any;

    expect(body.data.rna_tpm).toHaveLength(0);
  });

  test("missing gene_ids argument returns error", async () => {
    const res = await app.request(gql("{ rna_tpm { gene_id } }"));
    const body = (await res.json()) as any;

    expect(body.errors).toBeDefined();
    expect(body.errors.length).toBeGreaterThan(0);
  });
});
