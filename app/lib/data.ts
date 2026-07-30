"use server";
import { headers } from "next/headers";
import { auth } from "./auth";
import { prisma } from "./prisma";
import { AnswerActivity } from "./types";

export async function getUserAuthStatus() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user || !session.user.id)
    return { status: "unauthenticated" };
  return { status: "authenticated" };
}
export async function throwIfNoAuth() {
  const authStatus = await getUserAuthStatus();
  if (authStatus.status !== "authenticated") {
    throw new Error("unauthenticated");
  }
}

export async function getSlackUser(id: string) {
  await throwIfNoAuth();
  return await prisma.slackUser.findUnique({
    where: {
      id: id,
    },
    include: {
      programs: true,
    },
  });
}
export async function getSlackUserDetailed(id: string, programId?: string) {
  await throwIfNoAuth();
  return await prisma.slackUser.findUnique({
    where: {
      id: id,
    },
    include: {
      programs: true,
      createdTickets: {
        where: {
          programId: programId,
        },
        include: {
          program: true,
          assignees: true,
          resolver: true,
          firstResponseUser: true,
        },
        orderBy: {
          dateCreated: "desc",
        },
      },
      resolvedTickets: {
        where: {
          programId: programId,
          assignees: {
            some: {
              id: id,
            },
          },
        },
        include: {
          program: true,
          assignees: true,
          resolver: true,
          firstResponseUser: true,
        },
        orderBy: {
          dateCreated: "desc",
        },
      },
      assignedTickets: {
        where: {
          programId: programId,
        },
        include: {
          program: true,
          assignees: true,
          resolver: true,
          firstResponseUser: true,
        },
        orderBy: {
          dateCreated: "desc",
        },
      },
      _count: {
        select: {
          programs: true,
          createdTickets: {
            where: {
              programId: programId,
            },
          },
          resolvedTickets: {
            where: {
              programId: programId,
              assignees: {
                some: {
                  id: id,
                },
              },
            },
          },
          assignedTickets: {
            where: {
              programId: programId,
            },
          },
          users: true,
        },
      },
    },
  });
}
export async function getAllAssignedAndResolvedTicketsCount(
  userId: string,
  programId?: string,
) {
  await throwIfNoAuth();
  return await prisma.ticket.count({
    where: {
      programId: programId,
      status: 2,
      assignees: {
        some: {
          id: userId,
        },
      },
    },
  });
}
export async function getUserRepliesCount(userId: string, programId?: string) {
  await throwIfNoAuth();
  return await prisma.reply.count({
    where: {
      slackUserId: userId,
      ticket: {
        programId: programId,
      },
    },
  });
}
export async function getUserFirstResponseTime(
  userId: string,
  oldest: Date,
  newest: Date,
  programId?: string,
) {
  await throwIfNoAuth();
  // just to clarify:
  // i count any ticket that has been claimed FIRST by the assigned user.
  // what is NOT counted: if you reply to a post after someone already claimed it
  const res = await prisma.ticket.aggregate({
    _avg: {
      responseTime: true,
    },
    where: {
      firstResponseUserId: userId,
      programId: programId,
      responseTime: {
        not: 0,
      },
      dateCreated: {
        gte: oldest,
        lte: newest,
      },
    },
  });
  return res._avg.responseTime;
}
export async function getUserResolveTime(
  userId: string,
  oldest: Date,
  newest: Date,
  programId?: string,
) {
  await throwIfNoAuth();
  const res = await prisma.ticket.aggregate({
    _avg: {
      resolveTime: true,
    },
    where: {
      programId: programId,
      resolverId: userId,
      resolveTime: {
        not: 0,
      },
      assignees: {
        some: {
          id: userId,
        },
      },
      dateCreated: {
        gte: oldest,
        lte: newest,
      },
    },
  });
  return res._avg.resolveTime;
}

// REVIEWER NOTE: The activity-bucketing code below was made with Claude Code.
// I didn't spend much tracked time on this.
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_MS = 86400000;

function bucketReplyActivity(
  replies: { dateCreated: Date; ticketId: string }[],
  spanStart?: Date,
  spanEnd?: Date,
): AnswerActivity {
  const emptyWeekday = () => WEEKDAYS.map((day) => ({ day, average: 0 }));
  const emptyHour = () =>
    Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}:00`,
      average: 0,
    }));

  if (replies.length === 0) {
    return { byWeekday: emptyWeekday(), byHour: emptyHour() };
  }

  const perDay = new Map<string, Set<string>>(); // dateKey -> distinct ticketIds
  const perHour = new Map<string, Set<string>>(); // dateKey|hour -> distinct ticketIds

  let minTime = Infinity;
  let maxTime = -Infinity;

  for (const reply of replies) {
    const d = reply.dateCreated;
    const time = d.getTime();
    if (time < minTime) minTime = time;
    if (time > maxTime) maxTime = time;

    const dateKey = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
    const hourKey = `${dateKey}|${d.getUTCHours()}`;

    if (!perDay.has(dateKey)) perDay.set(dateKey, new Set());
    perDay.get(dateKey)!.add(reply.ticketId);
    if (!perHour.has(hourKey)) perHour.set(hourKey, new Set());
    perHour.get(hourKey)!.add(reply.ticketId);
  }

  const utcDayStart = (d: Date) =>
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const startDay = utcDayStart(spanStart ?? new Date(minTime));
  const endDay = utcDayStart(spanEnd ?? new Date(maxTime));
  const totalDays = Math.max(1, Math.round((endDay - startDay) / DAY_MS) + 1);

  const weekdayOccurrences = new Array(7).fill(0);
  for (let t = startDay; t <= endDay; t += DAY_MS) {
    weekdayOccurrences[new Date(t).getUTCDay()]++;
  }

  const weekdayTotals = new Array(7).fill(0);
  for (const [dateKey, ticketIds] of perDay) {
    const [y, m, day] = dateKey.split("-").map(Number);
    weekdayTotals[new Date(Date.UTC(y, m, day)).getUTCDay()] += ticketIds.size;
  }

  const hourTotals = new Array(24).fill(0);
  for (const [hourKey, ticketIds] of perHour) {
    hourTotals[Number(hourKey.split("|")[1])] += ticketIds.size;
  }

  const round = (n: number) => Math.round(n * 100) / 100;

  return {
    byWeekday: WEEKDAYS.map((day, i) => ({
      day,
      average: weekdayOccurrences[i]
        ? round(weekdayTotals[i] / weekdayOccurrences[i])
        : 0,
    })),
    byHour: hourTotals.map((total, hour) => ({
      hour: `${hour}:00`,
      average: round(total / totalDays),
    })),
  };
}

// REVIEWER NOTE: This function below used for the answer activity charts was made with Claude Code.
export async function getUserAnswerActivity(
  userId: string,
  programId?: string,
): Promise<AnswerActivity> {
  await throwIfNoAuth();
  const replies = await prisma.reply.findMany({
    where: {
      slackUserId: userId,
      ticket: programId ? { programId } : undefined,
    },
    select: { dateCreated: true, ticketId: true },
  });
  return bucketReplyActivity(replies);
}

// REVIEWER NOTE: This function below used for the answer activity charts was made with Claude Code.
export async function getProgramReplyActivity(
  programId: string,
  oldest: Date,
  newest: Date,
): Promise<AnswerActivity> {
  await throwIfNoAuth();
  const replies = await prisma.reply.findMany({
    where: {
      ticket: { programId },
      dateCreated: { gte: oldest, lte: newest },
    },
    select: { dateCreated: true, ticketId: true },
  });
  return bucketReplyActivity(replies, oldest, newest);
}
export async function getUser(id: string) {
  await throwIfNoAuth();
  return await prisma.user.findUnique({
    where: {
      id: id,
    },
    include: {
      slackUser: {
        include: {
          programs: {
            include: {
              _count: {
                select: {
                  tickets: true,
                  assignedUsers: true,
                },
              },
            },
          },
        },
      },
      programsOrganizing: true,
    },
  });
}
export async function getPrograms() {
  return await prisma.program.findMany({
    include: {
      _count: {
        select: {
          tickets: true,
          assignedUsers: true,
        },
      },
    },
  });
}
export async function getProgram(id: string) {
  await throwIfNoAuth();
  return await prisma.program.findUnique({
    where: {
      id: id,
    },
    include: {
      assignedUsers: {
        include: {
          users: {
            include: {
              programsOrganizing: true,
            },
          },
        },
      },
      usersOrganizing: true,
      tags: true,
    },
  });
}
export async function getProgramStatistics(
  id: string,
  oldest: Date,
  newest: Date,
) {
  await throwIfNoAuth();
  const session = await auth.api.getSession({
    // from better auth docs bc too lazy :
    headers: await headers(), // you need to pass the headers object.
  });

  const ticketsResolved = await prisma.ticket.count({
    where: {
      programId: id,
      status: 2,
      dateCreated: {
        gte: oldest,
        lte: newest,
      },
    },
  });
  const ticketsAssigned = await prisma.ticket.count({
    where: {
      programId: id,
      status: 1,
      dateCreated: {
        gte: oldest,
        lte: newest,
      },
    },
  });
  const ticketsOpen = await prisma.ticket.count({
    where: {
      programId: id,
      status: 0,
      dateCreated: {
        gte: oldest,
        lte: newest,
      },
    },
  });
  let ticketsAssignedToMe = 0;
  if (session?.user.slackId) {
    ticketsAssignedToMe = await prisma.ticket.count({
      where: {
        programId: id,
        status: 1,
        assignees: {
          some: {
            id: session.user.slackUserId as string,
          },
        },
        dateCreated: {
          gte: oldest,
          lte: newest,
        },
      },
    });
  }
  const totalTickets = await prisma.ticket.count({
    where: {
      programId: id,
      dateCreated: {
        gte: oldest,
        lte: newest,
      },
    },
  });
  const usersTicketCount = await prisma.slackUser.findMany({
    where: {
      programs: {
        some: {
          id: id,
        },
      },
    },
    include: {
      _count: {
        select: {
          assignedTickets: {
            where: {
              programId: id,
              dateCreated: {
                gte: oldest,
                lte: newest,
              },
            },
          },
        },
      },
    },
  });
  return {
    total: totalTickets,
    open: ticketsOpen,
    assigned: ticketsAssigned,
    assignedToMe: ticketsAssignedToMe,
    resolved: ticketsResolved,
    usersTicketCount: usersTicketCount,
  };
}
export async function getBacklogStatus(programId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user || !session.user.id)
    throw new Error("unauthenticated");
  const resp = await fetch(
    `${process.env["SCRAPER_API_URL"]}/api/backlog/${programId}/status`,
    {
      headers: {
        "x-api-key": process.env["SCRAPER_API_KEY"]!,
      },
    },
  );
  const respJson = await resp.json();
  if (!resp.ok) {
    throw new Error("Error fetching backlog status from backlogger");
  }
  return await respJson;
}

export async function getResolvedTicketsCount(
  programId: string,
  oldest: Date,
  newest: Date,
) {
  await throwIfNoAuth();
  return await prisma.slackUser.findMany({
    // this was made with help from claude
    where: {
      programs: {
        some: {
          id: programId,
        },
      },
    },
    select: {
      id: true,
      username: true,

      _count: {
        select: {
          programs: {
            where: {
              id: programId,
            },
          },
          createdTickets: {
            where: {
              programId: programId,
            },
          },
          resolvedTickets: {
            where: {
              programId: programId,
            },
          },
          users: true,
          assignedTickets: {
            where: {
              programId: programId,
              status: 2,
              dateCreated: {
                gte: oldest,
                lte: newest,
              },
            },
          },
        },
      },
    },
  });
}
export async function getHangTime(
  programId: string,
  oldest: Date,
  newest: Date,
) {
  await throwIfNoAuth();
  const res = await prisma.ticket.aggregate({
    _avg: {
      responseTime: true,
    },
    where: {
      programId: programId,
      responseTime: {
        not: 0,
      },
      dateCreated: {
        gte: oldest,
        lte: newest,
      },
    },
  });
  return res._avg.responseTime;
}
export async function getResolveTime(
  programId: string,
  oldest: Date,
  newest: Date,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user || !session.user.id) {
    return false;
  }
  const res = await prisma.ticket.aggregate({
    _avg: {
      resolveTime: true,
    },
    where: {
      programId: programId,
      responseTime: {
        not: 0,
      },
      assignees: {
        some: {},
      },
      dateCreated: {
        gte: oldest,
        lte: newest,
      },
    },
  });
  return res._avg.resolveTime;
}
export async function isOrg(programId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user || !session.user.id) {
    return false;
  }
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      programsOrganizing: true,
    },
  });
  return (
    user?.isAdmin || user?.programsOrganizing.some((p) => p.id === programId)
  );
}

export async function getAllStats() {
  const tickets = await prisma.ticket.count();
  const replies = await prisma.reply.count();
  const slackUsers = await prisma.slackUser.count();
  const helpers = await prisma.slackUser.count({
    where: {
      programs: {
        some: {},
      },
    },
  });
  const registered = await prisma.user.count();
  const programs = await prisma.program.count();
  return {
    programs: programs,
    tickets: tickets,
    replies: replies,
    helpers: helpers,
    registered: registered,
    slackUsers: slackUsers,
  };
}
export async function getTicketsWithRepliesFromUser(userId: string) {
  await throwIfNoAuth();
  return await prisma.ticket.findMany({
    where: {
      replies: {
        some: {
          slackUserId: userId,
        },
      },
    },
    include: {
      program: true,
      assignees: true,
      resolver: true,
      firstResponseUser: true,
    },
    orderBy: {
      dateCreated: "desc",
    },
  });
}
export async function getTicket(ticketId: string) {
  await throwIfNoAuth();
  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
    include: {
      replies: {
        include: {
          slackUser: {
            include: {
              programs: true,
            },
          },
        },
        orderBy: {
          dateCreated: "asc",
        },
      },
      slackUser: true,
      assignees: true,
      program: {
        include: {
          tags: true,
        },
      },
      tag: true,
    },
  });
  return ticket;
}
export async function isHelper(programId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user || !session.user.slackId) {
    return false;
  }
  const c = await prisma.slackUser.count({
    where: {
      programs: {
        some: {
          id: programId,
        },
      },
      id: session.user.slackId,
    },
  });
  return c > 0;
}
