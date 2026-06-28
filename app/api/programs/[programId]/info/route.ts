import { getProgram } from "@/app/lib/data";
import { prisma } from "@/app/lib/prisma";
import { type NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/programs/[programId]">,
) {
  const { programId } = await ctx.params;
  const program = await getProgram(programId);
  return new Response(JSON.stringify(program));
}
