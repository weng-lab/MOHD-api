import { buildSchema } from "graphql";

export const schema = buildSchema(`
  type RnaSample {
    value: Float!
    sample_id: String!
    kit: String!
    site: String!
    status: String!
    sex: String!
  }

  type RnaGene {
    gene_id: String!
    samples: [RnaSample!]!
  }

  type Query {
    rna_tpm(gene_ids: [String!]!): [RnaGene!]!
  }
`);
