import { getHangTime, getUserAuthStatus } from "@/app/lib/data";

import { type NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/programs/[programId]/hang-time/days/[days]">,
) {
  const { programId, days } = await ctx.params;
  const authStatus = await getUserAuthStatus();
  if (authStatus.status === "unauthenticated") {
    return new Response(JSON.stringify({ status: "Unauthorized" }), {
      status: 401,
    });
  }
  const hangTime = await getHangTime(programId, Number(days));
  return new Response(JSON.stringify({ time: hangTime }));
}
