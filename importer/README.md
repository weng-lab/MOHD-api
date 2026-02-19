# Importer for MOHD Data

This package downloads and inserts MOHD data into the database.

## How to run

Use bun to run the index.ts file, and specify the data to be imported
```bash
bun run index.ts DATATYPE
```

Datatypes allowed:
- rna (Gene RNA seq TPM)
- meta (metadata)
