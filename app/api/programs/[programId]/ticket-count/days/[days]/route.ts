import { getProgramStatistics, getProgramStatisticsInLastDays, getUserAuthStatus } from "@/app/lib/data";
import { type NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/programs/[programId]/ticket-count/days/[days]">,
) {
  const { programId, days } = await ctx.params;

  const authStatus = await getUserAuthStatus();
  if (authStatus.status === "unauthenticated") {
    return new Response(JSON.stringify({ status: "Unauthorized" }), {
      status: 401,
    });
  }

  const stats = await getProgramStatisticsInLastDays(programId, Number(days));

  if (!stats)
    return new Response(JSON.stringify({ status: "Not found" }), {
      status: 404,
    });
  return new Response(JSON.stringify(stats));
}
