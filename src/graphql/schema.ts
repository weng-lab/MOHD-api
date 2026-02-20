import { buildSchema } from "graphql";

export const schema = buildSchema(`
  """
  Shared fields for all samples
  """
  interface SampleMetadata {
    sample_id: String!
    site: String!
    status: String!
    sex: String!
    umap_x: Float
    umap_y: Float
  }

  """
  RNA sample metadata
  """
  type RnaSampleMetadata implements SampleMetadata {
    sample_id: String!
    kit: String!
    site: String!
    status: String!
    sex: String!
    umap_x: Float
    umap_y: Float
  }

  """
  RNA expression value for a gene in a sample
  """
  type RnaSample {
    value: Float!
    metadata: RnaSampleMetadata!
  }

  type RnaGene {
    gene_id: String!
    samples: [RnaSample!]!
  }

  """
  ATAC sample metadata
  """
  type AtacSampleMetadata implements SampleMetadata {
    sample_id: String!
    site: String!
    opc_id: String!
    protocol: String!
    status: String!
    sex: String!
    entity_id: String!
    umap_x: Float
    umap_y: Float
  }

  """
  ATAC z-score value for an accession in a sample
  """
  type AtacSample {
    value: Float!
    metadata: AtacSampleMetadata!
  }

  type AtacAccession {
    accession: String!
    samples: [AtacSample!]!
  }

  type Query {
    rna_tpm(gene_ids: [String!]!): [RnaGene!]!
    atac_zscore(accessions: [String!]!): [AtacAccession!]!

    rna_metadata: [RnaSampleMetadata!]!
    atac_metadata: [AtacSampleMetadata!]!
  }
`);