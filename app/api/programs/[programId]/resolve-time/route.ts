import { getResolveTime, getUserAuthStatus } from "@/app/lib/data";
import { jsonResponse } from "@/app/lib/tools";

import { type NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/programs/[programId]/resolve-time">,
) {
  const { programId } = await ctx.params;
  const authStatus = await getUserAuthStatus();
  if (authStatus.status === "unauthenticated") {
    return jsonResponse({ status: "Unauthorized" }, { status: 401 });
  }

  const params = req.nextUrl.searchParams;
  const oldest = params.get("oldest");
  const newest = params.get("newest");

  let oldestDate;
  if (oldest) {
    oldestDate = new Date(Number(oldest));
  } else {
    oldestDate = new Date("2000-01-01T00:00:00Z");
  }
  let newestDate;
  if (newest) {
    newestDate = new Date(Number(newest));
  } else {
    newestDate = new Date();
  }
  const resolveTime = await getResolveTime(programId, oldestDate, newestDate);
  if (resolveTime === false) {
    return jsonResponse({ status: "Unauthorized" }, { status: 401 });
  }
  return jsonResponse(resolveTime);
}
