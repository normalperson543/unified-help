import { getUserAuthStatus } from "@/app/lib/data";
import { prisma } from "@/app/lib/prisma";
import { type NextRequest } from "next/server";

export async function GET(_req: NextRequest) {
  const authStatus = await getUserAuthStatus();
  if (authStatus.status === "unauthenticated") {
    return new Response(JSON.stringify({ status: "Unauthorized" }), {
      status: 401,
    });
  }
  const programs = await prisma.program.findMany();
  return new Response(JSON.stringify(programs));
}
