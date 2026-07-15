"use server";
import { headers } from "next/headers";
import { auth } from "./auth";
import { prisma } from "./prisma";

export async function getSlackUser(id: string) {
  return await prisma.slackUser.findUnique({
    where: {
      id: id,
    },
    include: {
      programs: true,
    },
  });
}
export async function getUser(id: string) {
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
      usersOrganizing: true
    },
  });
}
export async function getProgramStatistics(id: string) {
  const session = await auth.api.getSession({
    // from better auth docs bc too lazy :
    headers: await headers(), // you need to pass the headers object.
  });
  console.log(session?.user.slackUserId);

  const ticketsResolved = await prisma.ticket.count({
    where: {
      programId: id,
      status: 2,
    },
  });
  const ticketsAssigned = await prisma.ticket.count({
    where: {
      programId: id,
      status: 1,
    },
  });
  const ticketsOpen = await prisma.ticket.count({
    where: {
      programId: id,
      status: 0,
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
      },
    });
  }
  const totalTickets = await prisma.ticket.count({
    where: { programId: id },
  });
  return {
    total: totalTickets,
    open: ticketsOpen,
    assigned: ticketsAssigned,
    assignedToMe: ticketsAssignedToMe,
    resolved: ticketsResolved,
  };
}
export async function getProgramStatisticsInLastDays(id: string, days: number) {
  const session = await auth.api.getSession({
    // from better auth docs bc too lazy :
    headers: await headers(), // you need to pass the headers object.
  });
  console.log(session?.user.slackUserId);

  const lastDays = new Date();
  lastDays.setDate(lastDays.getDate() - days);

  const ticketsResolved = await prisma.ticket.count({
    where: {
      programId: id,
      status: 2,
      dateCreated: {
        gte: lastDays,
      },
    },
  });
  const ticketsAssigned = await prisma.ticket.count({
    where: {
      programId: id,
      status: 1,
      dateCreated: {
        gte: lastDays,
      },
    },
  });
  const ticketsOpen = await prisma.ticket.count({
    where: {
      programId: id,
      status: 0,
      dateCreated: {
        gte: lastDays,
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
      },
    });
  }
  const totalTickets = await prisma.ticket.count({
    where: { programId: id },
  });
  return {
    total: totalTickets,
    open: ticketsOpen,
    assigned: ticketsAssigned,
    assignedToMe: ticketsAssignedToMe,
    resolved: ticketsResolved,
  };
}
export async function getUserAuthStatus() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user || !session.user.id)
    return { status: "unauthenticated" };
  return { status: "authenticated" };
}
export async function getBacklogStatus(programId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user || !session.user.id)
    throw new Error("unauthenticated");
  const resp = await fetch(
    `${process.env["SCRAPER_API_URL"]}/api/backlog/${programId}/status`,
  );
  const respJson = await resp.json();
  if (!resp.ok) {
    console.log(respJson);
    throw new Error("Error fetching backlog status from backlogger");
  }
  console.log(respJson);
  return await respJson;
}

export async function getResolvedTicketsCount(programId: string, days: number) {
  const lastDays = new Date();
  lastDays.setDate(lastDays.getDate() - days);

  return await prisma.slackUser.findMany({
    // this was made with help from claude
    select: {
      id: true,
      username: true,
      _count: {
        select: {
          assignedTickets: {
            where: {
              programId: programId,
              status: 2,
              dateCreated: {
                gte: lastDays,
              },
            },
          },
        },
      },
    },
  });
}
export async function getHangTime(programId: string, days: number) {
  const lastDays = new Date();
  lastDays.setDate(lastDays.getDate() - days);

  const res = await prisma.ticket.aggregate({
    _avg: {
      responseTime: true,
    },
    where: {
      responseTime: {
        not: 0
      },
      dateCreated: {
        gte: lastDays
      }
    }
  })
  console.log(res);
  return res._avg.responseTime;
}
//todo: move all of the route data stuff into this file so it's more organized
