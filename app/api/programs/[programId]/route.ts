import { prisma } from "@/app/lib/prisma";
import { type NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/programs/[programId]">,
) {
  const { programId } = await ctx.params;
  const params = req.nextUrl.searchParams; //todo: searching stuff
  const ticket = await prisma.ticket.findMany({
    where: {
      programId: programId,
    },
    include: {
      replies: {
        include: {
          slackUser: true,
        },
      },
      slackUser: true,
      assignees: true
    },
  });
  if (!ticket)
    return new Response(JSON.stringify({ status: "Not found" }), {
      status: 404,
    });
  return new Response(JSON.stringify(ticket));
}
