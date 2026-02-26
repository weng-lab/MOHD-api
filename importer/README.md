# Importer for MOHD Data

This package downloads and inserts MOHD data into the database.

## How to run

Use bun to run the importer, and specify the data to be imported
```bash
bun run src/index.ts --datatype DATATYPE --schema SCHEMA
```

Datatypes allowed:
- rna (Gene RNA seq TPM)
- atac (ATAC z-scores)
- meta (metadata)
