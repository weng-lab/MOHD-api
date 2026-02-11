import { buildSchema } from "graphql";

export const schema = buildSchema(`
  type Row {
    chrom: String
    start: Int
    end: Int
    value: Float
  }

  type Query {
    rows(chrom: String, start: Int, end: Int): [Row]
  }
`);
