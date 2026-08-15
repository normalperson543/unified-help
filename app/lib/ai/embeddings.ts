import { prisma } from "../prisma";
import {
  EMBEDDING_DIMENSIONS,
  getOpenAIClient,
  OPENAI_API_ENDPOINT,
  OPENAI_EMBEDDING_MODEL,
} from "./config";
import { ensureVectorSetup, jsonToVector } from "./vector";
import type { Ticket, Reply, SlackUser, Program } from "@/generated/prisma/client";

const MAX_SOURCE_TEXT_LENGTH = 6000;
const FALLBACK_SEARCH_LIMIT = 200;

export type SimilarTicket = {
  ticket: Ticket & {
    program: Program;
    slackUser: SlackUser;
    replies: Array<
      Reply & {
        slackUser: SlackUser & { programs: Program[] };
      }
    >;
  };
  similarity: number;
};

export async function ensureTicketEmbedded(ticketId: string): Promise<void> {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { replies: { orderBy: { dateCreated: "asc" } } },
  });
  if (!ticket) throw new Error("Ticket not found");

  const existing = await prisma.ticketEmbedding.findUnique({
    where: { ticketId },
  });

  if (existing) {
    await syncVectorColumn(ticketId, existing.embedding as number[]);
    return;
  }

  const text = buildEmbeddingText(ticket.message, ticket.replies);
  const embedding = await createEmbedding(text);

  await prisma.ticketEmbedding.create({
    data: {
      ticketId,
      embedding: embedding as never,
      model: OPENAI_EMBEDDING_MODEL,
    },
  });

  await syncVectorColumn(ticketId, embedding);
}

async function syncVectorColumn(
  ticketId: string,
  embedding: number[],
): Promise<void> {
  if (!(await ensureVectorSetup())) return;
  await prisma.$executeRawUnsafe(
    `UPDATE "TicketEmbedding" SET vector = $1::vector WHERE "ticketId" = $2`,
    jsonToVector(embedding),
    ticketId,
  );
}

export async function findSimilarTickets(
  ticketId: string,
  limit = 5,
): Promise<SimilarTicket[]> {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      replies: {
        orderBy: { dateCreated: "asc" },
        include: { slackUser: true },
      },
      program: true,
      slackUser: true,
    },
  });
  if (!ticket) throw new Error("Ticket not found");

  await ensureTicketEmbedded(ticketId);

  const sourceEmbedding = await getEmbedding(ticketId);

  // Try pgvector first; fall back to in-memory cosine similarity.
  if (await ensureVectorSetup()) {
    const similar = await findSimilarWithVector(
      ticketId,
      ticket.programId,
      sourceEmbedding,
      limit,
    );
    if (similar.length > 0) return similar;
  }

  return findSimilarInMemory(ticketId, ticket.programId, sourceEmbedding, limit);
}

async function findSimilarWithVector(
  currentTicketId: string,
  programId: string,
  embedding: number[],
  limit: number,
): Promise<SimilarTicket[]> {
  await ensureVectorSetup();

  const vector = jsonToVector(embedding);
  const rows = (await prisma.$queryRawUnsafe(
    `
    SELECT t.id, te.vector <=> $1::vector AS distance
    FROM "TicketEmbedding" te
    JOIN "Ticket" t ON t.id = te."ticketId"
    WHERE t."programId" = $2
      AND t.status = 2
      AND t.id != $3
      AND te.vector IS NOT NULL
    ORDER BY te.vector <=> $1::vector
    LIMIT $4
    `,
    vector,
    programId,
    currentTicketId,
    limit,
  )) as Array<{ id: string; distance: number }>;

  const tickets = await fetchTicketsWithReplies(rows.map((r) => r.id));
  return rows
    .map((row) => {
      const ticket = tickets.find((t) => t.id === row.id);
      if (!ticket) return null;
      return { ticket, similarity: 1 - Number(row.distance) };
    })
    .filter((item): item is SimilarTicket => item !== null);
}

async function findSimilarInMemory(
  currentTicketId: string,
  programId: string,
  embedding: number[],
  limit: number,
): Promise<SimilarTicket[]> {
  const candidates = await prisma.ticketEmbedding.findMany({
    where: {
      ticket: {
        programId,
        status: 2,
        id: { not: currentTicketId },
      },
    },
    orderBy: { createdAt: "desc" },
    take: FALLBACK_SEARCH_LIMIT,
  });

  const scored = candidates
    .map((candidate) => ({
      ticketId: candidate.ticketId,
      similarity: cosineSimilarity(embedding, candidate.embedding as number[]),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  const tickets = await fetchTicketsWithReplies(scored.map((s) => s.ticketId));
  return scored
    .map((s) => {
      const ticket = tickets.find((t) => t.id === s.ticketId);
      if (!ticket) return null;
      return { ticket, similarity: s.similarity };
    })
    .filter((item): item is SimilarTicket => item !== null);
}

async function getEmbedding(ticketId: string): Promise<number[]> {
  const record = await prisma.ticketEmbedding.findUnique({
    where: { ticketId },
  });
  if (!record) throw new Error("Embedding not found");
  return record.embedding as number[];
}

async function fetchTicketsWithReplies(
  ticketIds: string[],
): Promise<SimilarTicket["ticket"][]> {
  if (ticketIds.length === 0) return [];
  return prisma.ticket.findMany({
    where: { id: { in: ticketIds } },
    include: {
      program: true,
      slackUser: true,
      replies: {
        orderBy: { dateCreated: "asc" },
        include: {
          slackUser: { include: { programs: true } },
        },
      },
    },
  });
}

export async function createEmbedding(text: string): Promise<number[]> {
  const client = getOpenAIClient();
  const input = text.slice(0, MAX_SOURCE_TEXT_LENGTH);
  console.error("[AI] Creating embedding", {
    endpoint: OPENAI_API_ENDPOINT || "https://api.openai.com/v1",
    model: OPENAI_EMBEDDING_MODEL,
    inputLength: input.length,
  });
  try {
    const response = await client.embeddings.create({
      model: OPENAI_EMBEDDING_MODEL,
      input,
    });
    const embedding = response.data?.[0]?.embedding;
    if (!embedding) {
      console.error("[AI] Unexpected embedding response:", {
        object: response.object,
        model: response.model,
        data: response.data,
        usage: response.usage,
      });
      throw new Error("No embedding returned from OpenAI");
    }
    if (embedding.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(
        `Unexpected embedding dimensions: ${embedding.length} (expected ${EMBEDDING_DIMENSIONS})`,
      );
    }
    return embedding;
  } catch (e) {
    if (e instanceof Error && "status" in e) {
      console.error("[AI] Embedding API error:", e.message, e);
    } else {
      console.error("[AI] Embedding request failed:", e);
    }
    throw e;
  }
}

export function buildEmbeddingText(
  message: string,
  replies: Array<{ message: string; slackUser?: { username: string } }>,
): string {
  let text = `Ticket: ${message}\n`;
  for (const reply of replies.slice(0, 20)) {
    const author = reply.slackUser?.username ?? "helper";
    text += `Reply from ${author}: ${reply.message}\n`;
  }
  return text;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
