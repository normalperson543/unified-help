import { getProgram, getUserAuthStatus } from "@/app/lib/data";
import { prisma } from "@/app/lib/prisma";
import { type NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/programs/[programId]">,
) {
  const { programId } = await ctx.params;
  const authStatus = await getUserAuthStatus();
  if (authStatus.status === "unauthenticated") {
    return new Response(JSON.stringify({ status: "Unauthenticated" }), {
      status: 401,
    });
  }
  const program = await getProgram(programId);
  if (program === null) {
    return new Response(JSON.stringify({ status: "Not found" }), {
      status: 404,
    });
  }
  return new Response(JSON.stringify(program));
}
