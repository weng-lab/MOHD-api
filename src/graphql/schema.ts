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

  type AtacSample {
    value: Float!
    sample_id: String!
    site: String!
    opc_id: String!
    protocol: String!
    status: String!
    sex: String!
    entity_id: String!
  }

  type AtacAccession {
    accession: String!
    samples: [AtacSample!]!
  }

  type Query {
    rna_tpm(gene_ids: [String!]!): [RnaGene!]!
    atac_zscore(accessions: [String!]!): [AtacAccession!]!
  }
`);
