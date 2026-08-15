import { type NextRequest } from "next/server";
import { getCachedSuggestions, generateSuggestions } from "@/app/lib/ai/suggestions";
import { getTicket, getUserAuthStatus, isHelper } from "@/app/lib/data";
import { isAiEnabled } from "@/app/lib/ai/config";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/ticket/[ticketId]/suggestions">,
) {
  const authStatus = await getUserAuthStatus();
  if (authStatus.status === "unauthenticated") {
    return new Response(JSON.stringify({ status: "Unauthorized" }), {
      status: 401,
    });
  }

  const { ticketId } = await ctx.params;
  const ticket = await getTicket(ticketId);
  if (!ticket) {
    return new Response(JSON.stringify({ status: "Not found" }), {
      status: 404,
    });
  }

  const helper = await isHelper(ticket.program.id);
  if (!helper) {
    return new Response(JSON.stringify({ status: "Unauthorized" }), {
      status: 403,
    });
  }

  if (!isAiEnabled()) {
    return new Response(
      JSON.stringify({
        status: "error",
        error: "AI suggestions are not configured",
        suggestions: [],
      }),
      { status: 503 },
    );
  }

  try {
    let result = await getCachedSuggestions(ticketId);
    if (!result) {
      result = await generateSuggestions(ticketId);
    }
    return new Response(JSON.stringify(result));
  } catch (e) {
    console.error("Failed to generate suggestions:", e);
    return new Response(
      JSON.stringify({
        status: "error",
        error: "An unexpected error occurred while generating suggestions",
        suggestions: [],
      }),
      { status: 500 },
    );
  }
}

export async function POST(
  _req: NextRequest,
  ctx: RouteContext<"/api/ticket/[ticketId]/suggestions">,
) {
  const authStatus = await getUserAuthStatus();
  if (authStatus.status === "unauthenticated") {
    return new Response(JSON.stringify({ status: "Unauthorized" }), {
      status: 401,
    });
  }

  const { ticketId } = await ctx.params;
  const ticket = await getTicket(ticketId);
  if (!ticket) {
    return new Response(JSON.stringify({ status: "Not found" }), {
      status: 404,
    });
  }

  const helper = await isHelper(ticket.program.id);
  if (!helper) {
    return new Response(JSON.stringify({ status: "Unauthorized" }), {
      status: 403,
    });
  }

  if (!isAiEnabled()) {
    return new Response(
      JSON.stringify({
        status: "error",
        error: "AI suggestions are not configured",
        suggestions: [],
      }),
      { status: 503 },
    );
  }

  try {
    const result = await generateSuggestions(ticketId);
    return new Response(JSON.stringify(result));
  } catch (e) {
    console.error("Failed to generate suggestions:", e);
    return new Response(
      JSON.stringify({
        status: "error",
        error: "An unexpected error occurred while generating suggestions",
        suggestions: [],
      }),
      { status: 500 },
    );
  }
}
