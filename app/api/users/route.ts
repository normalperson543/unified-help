import { ITEMS_PER_PAGE } from "@/app/lib/constants";
import { getProgram, getUserAuthStatus } from "@/app/lib/data";
import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const searchTerm = params.get("searchTerm");
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
          assignedTickets: true,
          users: true,
        },
      },
    },
    take: ITEMS_PER_PAGE * (page ?? 1) ,
  });

  // Claude made this part to fix a bug regarding resolved ticket counts
  const resolvedCounts = await prisma.slackUser.findMany({
    where: { id: { in: users.map((u) => u.id) } },
    select: {
      id: true,
      _count: {
        select: {
          assignedTickets: {
            where: {
              status: 2,
            },
          },
        },
      },
    },
  });
  const resolvedById = new Map(
    resolvedCounts.map((u) => [u.id, u._count.assignedTickets]),
  );
  const usersWithStats = users.map((u) => ({
    ...u,
    resolvedAssignedCount: resolvedById.get(u.id) ?? 0,
  }));

  // End of Claude help

  const usersCount = await prisma.slackUser.count({
    where: {
      ...(filters.length ? { AND: filters } : {}),
    },
  });
  return new Response(
    JSON.stringify({ users: usersWithStats, total: usersCount }),
  );
}
