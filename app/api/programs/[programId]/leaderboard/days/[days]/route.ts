import {
  getResolvedTicketsCount,
  getUserAuthStatus,
} from "@/app/lib/data";

import { type NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/programs/[programId]/leaderboard/days/[days]">,
) {
  const { programId, days } = await ctx.params;
  const authStatus = await getUserAuthStatus();
  if (authStatus.status === "unauthenticated") {
    return new Response(JSON.stringify({ status: "Unauthorized" }), {
      status: 401,
    });
  }
  const program = await getResolvedTicketsCount(programId, Number(days));
  return new Response(JSON.stringify(program));
}
