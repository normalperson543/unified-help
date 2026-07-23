import { ITEMS_PER_PAGE } from "@/app/lib/constants";
import { getUserAuthStatus } from "@/app/lib/data";
import { prisma } from "@/app/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const authStatus = await getUserAuthStatus();
  if (authStatus.status === "unauthenticated") {
    return new Response(JSON.stringify({ status: "Unauthenticated" }), {
      status: 401,
    });
  }

  const params = req.nextUrl.searchParams;

  const searchTerm = params.get("searchTerm");
  const page = params.get("page") ?? 1;
  const programs = params.get("programs")?.split(",");
  const order = params.get("order") ?? "username.asc";

  const field = order.split(".")[0];
  const direction = order.split(".")[1];

  // coded by claude
  const dir: Prisma.SortOrder = direction === "desc" ? "desc" : "asc";

  const orderByMap: Record<string, Prisma.SlackUserOrderByWithRelationInput> = {
    username: { username: dir },
    createdTickets: { createdTickets: { _count: dir } },
    assignedTickets: { assignedTickets: { _count: dir } },
    resolvedTickets: { resolvedTickets: { _count: dir } },
  };

  const orderBy = orderByMap[field] ?? { username: "asc" };
  // end of claude code

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
    orderBy,
    skip: ITEMS_PER_PAGE * (Number(page) - 1),
    take: ITEMS_PER_PAGE,
  });

  const usersCount = await prisma.slackUser.count({
    where: {
      ...(filters.length ? { AND: filters } : {}),
    },
  });
  return new Response(JSON.stringify({ users: users, total: usersCount }));
}
