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

  type Query {
    rna_tpm(gene_id: String!): [RnaSample!]
  }
`);
