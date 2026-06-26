import { prisma } from "@/app/lib/prisma";
import { type NextRequest } from "next/server";

export async function GET(_req: NextRequest) {
  const programs = await prisma.program.findMany();
  return new Response(JSON.stringify(programs));
}
