import { buildSchema } from "graphql";

export const schema = buildSchema(`
  """
  Available omes
  """
  enum OmeEnum {
    ATAC_SEQ
    EXPOSOMICS
    LIPIDOMICS
    METABOLOMICS
    PROTEOMICS
    RNA_SEQ
    WGBS
    WGS
  }
  """
  Shared fields for all samples
  """
  interface SampleMetadata {
    sample_id: String!
    kit: String!
    site: String!
    status: String!
    sex: String!    
  }

  type WgsSampleMetadata implements SampleMetadata {
    sample_id: String!
    kit: String!
    site: String!
    status: String!
    sex: String!
  }
    
  type WgbsSampleMetadata implements SampleMetadata {
    sample_id: String!
    kit: String!
    site: String!
    status: String!
    sex: String!
  }
  type ExposomicsSampleMetadata implements SampleMetadata {
    sample_id: String!
    kit: String!
    site: String!
    status: String!
    sex: String!
  }

  type ProteomicsSampleMetadata implements SampleMetadata {
    sample_id: String!
    kit: String!
    site: String!
    status: String!
    sex: String!
  }

   type LipidomicsSampleMetadata implements SampleMetadata {
    sample_id: String!
    kit: String!
    site: String!
    status: String!
    sex: String!
  }
    type MetabolomicsSampleMetadata implements SampleMetadata {
    sample_id: String!
    kit: String!
    site: String!
    status: String!
    sex: String!
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
    kit: String!
    site: String!
    opc_id: String!
    protocol: String!
    status: String!
    sex: String!
    entity_id: String!
    umap_x: Float
    umap_y: Float
    biospecimen: String!
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

  type OmeDownloadFiles  {
    sample_id: String!
    filename: String!
    file_type: String!       
    size: String!   
    file_ome: OmeEnum!     
    open_access: Boolean       
  }
  type Query {
    rna_tpm(gene_ids: [String!]!): [RnaGene!]!
    atac_zscore(accessions: [String!]!): [AtacAccession!]!

    rna_metadata: [RnaSampleMetadata!]!
    atac_metadata: [AtacSampleMetadata!]!

    wgs_metadata: [WgsSampleMetadata!]!
    wgbs_metadata: [WgbsSampleMetadata!]!
    exposomics_metadata:  [ExposomicsSampleMetadata!]!
    proteomics_metadata:  [ProteomicsSampleMetadata!]!
    lipidomics_metadata:  [LipidomicsSampleMetadata!]!
    metabolomics_metadata:  [MetabolomicsSampleMetadata!]!

    fetch_download_files(ome: OmeEnum!, sample_id: [String]) : [OmeDownloadFiles]

  }
`);