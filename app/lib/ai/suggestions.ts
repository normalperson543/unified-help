"use server";

import { prisma } from "../prisma";
import { getOpenAIClient, OPENAI_MODEL } from "./config";
import { buildEmbeddingText, ensureTicketEmbedded, findSimilarTickets } from "./embeddings";
import { SUGGESTION_SYSTEM_PROMPT } from "./prompt";
import type { Suggestion, SuggestedSolutionResult } from "./types";

export async function generateSuggestions(
  ticketId: string,
): Promise<SuggestedSolutionResult> {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        replies: {
          orderBy: { dateCreated: "asc" },
          include: { slackUser: { include: { programs: true } } },
        },
        slackUser: true,
        program: true,
      },
    });
    if (!ticket) {
      return { status: "error", error: "Ticket not found", suggestions: [] };
    }

    await ensureTicketEmbedded(ticketId);

    const similar = await findSimilarTickets(ticketId, 5);
    if (similar.length === 0) {
      return {
        status: "ready",
        suggestions: [],
      };
    }

    const currentThreadText = buildEmbeddingText(ticket.message, ticket.replies);

    let sourcesText = "";
    for (const { ticket: source, similarity } of similar) {
      sourcesText += `\n--- Source ticket (ID: ${source.id}, similarity: ${(similarity * 100).toFixed(1)}%) ---\n`;
      sourcesText += `Original message: ${source.message}\n`;
      for (const reply of source.replies.slice(0, 15)) {
        const author = reply.slackUser.username;
        sourcesText += `Reply from ${author}: ${reply.message}\n`;
      }
    }

    const userPrompt = `Current ticket:\n${currentThreadText}\n\nSimilar resolved tickets:${sourcesText}`;

    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: OPENAI_MODEL!,
      messages: [
        { role: "system", content: SUGGESTION_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      console.error("[AI] Unexpected chat response:", {
        object: response.object,
        model: response.model,
        choices: response.choices,
        usage: response.usage,
      });
      return {
        status: "error",
        error: "No response from model",
        suggestions: [],
      };
    }

    const parsed = parseSuggestions(content);
    await persistSuggestions(ticketId, parsed);
    return parsed;
  } catch (e) {
    console.error("Error generating suggestions:", e);
    const error = e instanceof Error ? e.message : "Unknown error";
    const result: SuggestedSolutionResult = {
      status: "error",
      error,
      suggestions: [],
    };
    await persistSuggestions(ticketId, result);
    return result;
  }
}

export async function getCachedSuggestions(
  ticketId: string,
): Promise<SuggestedSolutionResult | null> {
  const cached = await prisma.suggestedSolution.findUnique({
    where: { ticketId },
  });
  if (!cached) return null;
  if (cached.status === "error") {
    return {
      status: "error",
      error: cached.errorMessage || "Unknown error",
      suggestions: cached.suggestions as Suggestion[],
    };
  }
  return {
    status: "ready",
    suggestions: cached.suggestions as Suggestion[],
  };
}

async function persistSuggestions(
  ticketId: string,
  result: SuggestedSolutionResult,
): Promise<void> {
  await prisma.suggestedSolution.upsert({
    where: { ticketId },
    create: {
      ticketId,
      status: result.status,
      suggestions: result.suggestions as never,
      errorMessage: result.status === "error" ? result.error : null,
    },
    update: {
      status: result.status,
      suggestions: result.suggestions as never,
      errorMessage: result.status === "error" ? result.error : null,
      generatedAt: new Date(),
    },
  });
}

function parseSuggestions(content: string): SuggestedSolutionResult {
  try {
    const raw = JSON.parse(content) as unknown;
    if (typeof raw !== "object" || raw === null) {
      return {
        status: "error",
        error: "Model returned non-object JSON",
        suggestions: [],
      };
    }
    const parsed = raw as { suggestions?: unknown };
    if (!Array.isArray(parsed.suggestions)) {
      return {
        status: "error",
        error: "Missing suggestions array",
        suggestions: [],
      };
    }
    const suggestions: Suggestion[] = [];
    for (const item of parsed.suggestions) {
      if (
        typeof item === "object" &&
        item !== null &&
        "sourceTicketId" in item &&
        "draftReply" in item &&
        "reasoning" in item &&
        typeof (item as { sourceTicketId: unknown }).sourceTicketId === "string" &&
        typeof (item as { draftReply: unknown }).draftReply === "string" &&
        typeof (item as { reasoning: unknown }).reasoning === "string"
      ) {
        suggestions.push(item as Suggestion);
      }
    }
    return { status: "ready", suggestions };
  } catch {
    return {
      status: "error",
      error: "Could not parse model response as JSON",
      suggestions: [],
    };
  }
}
