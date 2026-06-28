import { getProgramStatistics } from "@/app/lib/data";
import { type NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/programs/[programId]">,
) {
  const { programId } = await ctx.params;

  const stats = await getProgramStatistics(programId);

  if (!stats)
    return new Response(JSON.stringify({ status: "Not found" }), {
      status: 404,
    });
  return new Response(JSON.stringify(stats));
}
