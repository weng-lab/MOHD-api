#!/bin/bash
set -e

cd "$(dirname "$0")/.."

echo "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if docker exec service-db-1 pg_isready -U postgres > /dev/null 2>&1; then
        echo "PostgreSQL is ready!"
        # Additional wait for initialization
        sleep 2
        break
    fi
    sleep 1
done

cd importer

export POSTGRES_URL="postgresql://postgres:postgres@localhost:5432/postgres"
export RNA_META_FILE="../migrations/test-data/Subset_Phase-0-Metadata.txt"
export ATAC_META_FILE="../migrations/test-data/Subset_Phase_0_ATAC_Metadata_with_entity.tsv"
export RNA_TPM_FILE="../migrations/test-data/Subset_Phase-0_RNA-TPM.tsv"
export ATAC_ZSCORE_FILE="../migrations/test-data/Subset_Phase_0_ATAC_zscores.tsv"

bun run src/index.ts --datatype meta --datatype atac --datatype rna --schema public
