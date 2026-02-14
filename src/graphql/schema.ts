import { buildSchema } from "graphql";

export const schema = buildSchema(`
  type Row {
    values: float[]
  }

  type Query {
    rna_tpm(accession: String): [Row]
  }
`);
