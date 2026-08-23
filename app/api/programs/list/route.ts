import { getUserAuthStatus } from "@/app/lib/data";
import { prisma } from "@/app/lib/prisma";
import { jsonResponse } from "@/app/lib/tools";

export async function GET() {
  const authStatus = await getUserAuthStatus();
  if (authStatus.status === "unauthenticated") {
    return jsonResponse({ status: "Unauthorized" }, { status: 401 });
  }
  const programs = await prisma.program.findMany();
  return jsonResponse(programs);
}
