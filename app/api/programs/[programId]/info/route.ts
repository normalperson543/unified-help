import { getProgram, getUserAuthStatus } from "@/app/lib/data";
import { jsonResponse } from "@/app/lib/tools";
import { type NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/programs/[programId]">,
) {
  const { programId } = await ctx.params;
  const authStatus = await getUserAuthStatus();
  if (authStatus.status === "unauthenticated") {
    return jsonResponse({ status: "Unauthenticated" }, { status: 401 });
  }
  const program = await getProgram(programId);
  if (program === null) {
    return jsonResponse({ status: "Not found" }, { status: 404 });
  }
  return jsonResponse(program);
}
