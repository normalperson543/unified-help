// REVIEWER NOTE: This route used for the profile page and program pages to get answer trends data was generated with Claude Code
import { getProgramReplyActivity, getUserAuthStatus } from "@/app/lib/data";

import { type NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/programs/[programId]/reply-activity">,
) {
  const { programId } = await ctx.params;
  const authStatus = await getUserAuthStatus();
  if (authStatus.status === "unauthenticated") {
    return new Response(JSON.stringify({ status: "Unauthorized" }), {
      status: 401,
    });
  }

  const params = req.nextUrl.searchParams;
  const oldest = params.get("oldest");
  const newest = params.get("newest");

  let oldestDate;
  if (oldest) {
    oldestDate = new Date(Number(oldest));
  } else {
    oldestDate = new Date("01-01-2000"); // idk vro
  }
  let newestDate;
  if (newest) {
    newestDate = new Date(Number(newest));
  } else {
    newestDate = new Date();
  }

  const activity = await getProgramReplyActivity(
    programId,
    oldestDate,
    newestDate,
  );
  return new Response(JSON.stringify(activity));
}
