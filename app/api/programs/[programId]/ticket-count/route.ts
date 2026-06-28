import { getProgramStatistics, getUserAuthStatus } from "@/app/lib/data";
import { type NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/programs/[programId]">,
) {
  const { programId } = await ctx.params;

  const authStatus = await getUserAuthStatus();
  if (authStatus.status === "unauthenticated") {
    return new Response(JSON.stringify({ status: "Unauthorized" }), {
      status: 401,
    });
  }

  const stats = await getProgramStatistics(programId);

  if (!stats)
    return new Response(JSON.stringify({ status: "Not found" }), {
      status: 404,
    });
  return new Response(JSON.stringify(stats));
}
