import { getProgram, getUserAuthStatus } from "@/app/lib/data";
import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { type NextRequest } from "next/server";

export async function GET(req: NextRequest, ctx: RouteContext<"/api/users">) {
  const params = req.nextUrl.searchParams;

  const searchTerm = params.get("searchTerm");
  const order = params.get("order");
  const page = params.get("page");
  const programs = params.get("programs")?.split(",");

  const authStatus = await getUserAuthStatus();
  if (authStatus.status === "unauthenticated") {
    return new Response(JSON.stringify({ status: "Unauthenticated" }), {
      status: 401,
    });
  }

  const filters: Prisma.SlackUserWhereInput[] = [];
  if (searchTerm && searchTerm.length > 0) {
    filters.push({ username: { contains: searchTerm, mode: "insensitive" } });
  }
  if (programs && programs[0].length > 0) {
    filters.push({ programs: { some: { id: { in: programs } } } });
  }

  const users = await prisma.slackUser.findMany({
    where: {
      ...(filters.length ? { AND: filters } : {}),
    },
    include: {
      programs: true,
      _count: {
        select: {
          programs: true,
          createdTickets: true,
          resolvedTickets: true,
          assignedTickets: {
            where: {
              status: 2,
            },
          },
          users: true,
        },
      },
    },
  });
  const usersCount = await prisma.slackUser.count({
    where: {
      ...(filters.length ? { AND: filters } : {}),
    },
  });
  return new Response(JSON.stringify({ users: users, total: usersCount }));
}
