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

describe("graphql atac_zscore", () => {
  test("fetch atac metadata", async () => {
    const res = await app.request(
      gql(
        '{ atac_metadata { sample_id, site, opc_id, protocol, status, sex, entity_id, umap_x, umap_y  } }',
      ),
    );
    const body = (await res.json()) as any;
    const atac_metadata = body.data.atac_metadata[0];
    expect(atac_metadata.sample_id).toBe("SAMPLE_001");    
    expect(atac_metadata.site).toBe("st1");
    expect(atac_metadata.opc_id).toBe("opcA");
    expect(atac_metadata.protocol).toBe("prtA");
    expect(atac_metadata.status).toBe("case");
    expect(atac_metadata.sex).toBe("male");
    expect(atac_metadata.entity_id).toBe("entA");
    expect(atac_metadata.umap_x).toBe(1.0);
    expect(atac_metadata.umap_y).toBe(2.0);

  })
  test("single accession returns samples with metadata", async () => {
    const res = await app.request(
      gql(
        '{ atac_zscore(accessions: ["0"]) { accession, samples { value, metadata { sample_id, site, opc_id, protocol, status, sex, entity_id, umap_x, umap_y } } } }',
      ),
    );
    const body = (await res.json()) as any;
    const acc = body.data.atac_zscore[0];

    expect(acc.accession).toBe("0");
    expect(acc.samples).toHaveLength(5);
    expect(acc.samples[0].value).toBe(0);
    expect(acc.samples[0].metadata.sample_id).toBe("SAMPLE_001");
    expect(acc.samples[0].metadata.site).toBe("st1");
    expect(acc.samples[0].metadata.opc_id).toBe("opcA");
    expect(acc.samples[0].metadata.protocol).toBe("prtA");
    expect(acc.samples[0].metadata.status).toBe("case");
    expect(acc.samples[0].metadata.sex).toBe("male");
    expect(acc.samples[0].metadata.entity_id).toBe("entA");
    expect(acc.samples[0].metadata.umap_x).toBe(1.0);
    expect(acc.samples[0].metadata.umap_y).toBe(2.0);
  });

  test("multiple accessions", async () => {
    const res = await app.request(
      gql(
        '{ atac_zscore(accessions: ["0", "1"]) { accession, samples { value } } }',
      ),
    );
    const body = (await res.json()) as any;
    const accs = body.data.atac_zscore;

    expect(accs).toHaveLength(2);
    expect(accs[0].accession).toBe("0");
    expect(accs[1].accession).toBe("1");
    // accession "1" first sample should be 1.00
    expect(accs[1].samples[0].value).toBe(1);
  });

  test("non-existent accession returns empty samples", async () => {
    const res = await app.request(
      gql(
        '{ atac_zscore(accessions: ["nonexistent"]) { accession, samples { value } } }',
      ),
    );
    const body = (await res.json()) as any;
    const acc = body.data.atac_zscore[0];

    expect(acc.accession).toBe("nonexistent");
    expect(acc.samples).toHaveLength(0);
  });

  test("empty accessions returns empty array", async () => {
    const res = await app.request(
      gql("{ atac_zscore(accessions: []) { accession } }"),
    );
    const body = (await res.json()) as any;

    expect(body.data.atac_zscore).toHaveLength(0);
  });

  test("missing accessions argument returns error", async () => {
    const res = await app.request(gql("{ atac_zscore { accession } }"));
    const body = (await res.json()) as any;

    expect(body.errors).toBeDefined();
    expect(body.errors.length).toBeGreaterThan(0);
  });
});

describe("graphql rna_tpm", () => {
    test("fetch rnaseq metadata", async () => {
    const res = await app.request(
      gql(
        '{ rna_metadata { sample_id, kit, site, status, sex, umap_x, umap_y  } }',
      ),
    );
    const body = (await res.json()) as any;
    const gene_metadata = body.data.rna_metadata[0];

    
    expect(gene_metadata.sample_id).toBe("SAMPLE_001");
    expect(gene_metadata.kit).toBe("kitA");
    expect(gene_metadata.site).toBe("st1");
    expect(gene_metadata.status).toBe("case");
    expect(gene_metadata.sex).toBe("male");
    expect(gene_metadata.umap_x).toBe(1.0);
    expect(gene_metadata.umap_y).toBe(2.0);
  });
  test("single gene returns tpm values with metadata", async () => {
    const res = await app.request(
      gql(
        '{ rna_tpm(gene_ids: ["0"]) { gene_id, samples { value, metadata {sample_id, kit, site, status, sex, umap_x, umap_y } } } }',
      ),
    );
    const body = (await res.json()) as any;
    const gene = body.data.rna_tpm[0];

    expect(gene.gene_id).toBe("0");
    expect(gene.samples).toHaveLength(5);
    expect(gene.samples[0].value).toBe(0);
    expect(gene.samples[0].metadata.sample_id).toBe("SAMPLE_001");
    expect(gene.samples[0].metadata.kit).toBe("kitA");
    expect(gene.samples[0].metadata.site).toBe("st1");
    expect(gene.samples[0].metadata.status).toBe("case");
    expect(gene.samples[0].metadata.sex).toBe("male");
    expect(gene.samples[0].metadata.umap_x).toBe(1.0);
    expect(gene.samples[0].metadata.umap_y).toBe(2.0);
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
