import { prisma } from "../prisma";
import { EMBEDDING_DIMENSIONS } from "./config";

export async function ensureVectorSetup(): Promise<boolean> {
  try {
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector`);
  } catch {
    return false;
  }

  // Ensure the vector column matches the configured embedding dimension.
  // If it exists with the wrong dimension, drop it and recreate it.
  await prisma.$executeRawUnsafe(`
    DO $$
    DECLARE
      current_dim INTEGER;
    BEGIN
      SELECT atttypmod INTO current_dim
      FROM pg_attribute
      WHERE attrelid = '"TicketEmbedding"'::regclass AND attname = 'vector';

      IF current_dim IS NOT NULL AND current_dim != ${EMBEDDING_DIMENSIONS} THEN
        DROP INDEX IF EXISTS "TicketEmbedding_vector_idx";
        ALTER TABLE "TicketEmbedding" DROP COLUMN vector;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'TicketEmbedding' AND column_name = 'vector'
      ) THEN
        ALTER TABLE "TicketEmbedding" ADD COLUMN vector vector(${EMBEDDING_DIMENSIONS});
        CREATE INDEX IF NOT EXISTS "TicketEmbedding_vector_idx"
          ON "TicketEmbedding" USING hnsw (vector vector_cosine_ops);
      END IF;
    END
    $$;
  `);

  return true;
}

export function jsonToVector(embedding: unknown): string {
  if (!Array.isArray(embedding)) {
    throw new Error("Embedding is not an array");
  }
  return `[${embedding.join(",")}]`;
}


