import { getUserAuthStatus } from "@/app/lib/data";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const authStatus = await getUserAuthStatus();
  if (authStatus.status === "unauthenticated") {
    return new Response(JSON.stringify({ status: "Unauthorized" }), {
      status: 401,
    });
  }
  const programs = await prisma.program.findMany();
  return new Response(JSON.stringify(programs));
}
