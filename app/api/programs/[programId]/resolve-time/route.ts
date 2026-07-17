import { getResolveTime, getUserAuthStatus } from "@/app/lib/data";

import { type NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/programs/[programId]/resolve-time">,
) {
  const { programId } = await ctx.params;
  const authStatus = await getUserAuthStatus();
  if (authStatus.status === "unauthenticated") {
    return new Response(JSON.stringify({ status: "Unauthorized" }), {
      status: 401,
    });
  }

  const params = req.nextUrl.searchParams;
  console.log(params);
  const oldest = params.get("oldest");
  const newest = params.get("newest");

  let oldestDate;
  if (oldest) {
    oldestDate = new Date(Number(oldest));
  } else {
    oldestDate = new Date("01-01-2000") // idk vro
  }
  let newestDate;
  if (newest) {
    newestDate = new Date(Number(newest));
  } else {
    newestDate = new Date()
  }
  console.log(oldestDate);
  console.log(newestDate);
  const hangTime = await getResolveTime(programId, oldestDate, newestDate);
  return new Response(JSON.stringify({ time: hangTime }));
}
