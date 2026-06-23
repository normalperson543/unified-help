import { prisma } from "@/app/lib/prisma";
import { type NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/ticket/[ticketId]">,
) {
  const { ticketId } = await ctx.params;
  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
    include: {
      replies: true
    }
  });
  if (!ticket)
    return new Response(JSON.stringify({ status: "Not found" }), {
      status: 404,
    });
  return new Response(JSON.stringify(ticket));
}
