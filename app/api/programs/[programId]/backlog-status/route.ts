import { getBacklogStatus, getUserAuthStatus, isOrg } from "@/app/lib/data";
import { BacklogStatus } from "@/app/lib/types";

import { type NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/programs/[programId]/backlog-status">,
) {
  const { programId } = await ctx.params;
  const authStatus = await getUserAuthStatus();
  if (authStatus.status === "unauthenticated") {
    return new Response(JSON.stringify({ status: "Unauthorized" }), {
      status: 401,
    });
  }

  const org = await isOrg(programId);
  if (!org) {
    return new Response(JSON.stringify({ status: "Unauthorized" }), {
      status: 401,
    });
  }

  const backlogStatus: BacklogStatus = await getBacklogStatus(programId);

  return new Response(JSON.stringify(backlogStatus));
}
