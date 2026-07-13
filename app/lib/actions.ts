"use server";

import { headers } from "next/headers";
import { auth } from "./auth";
import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";
import { createUser, indexUsersFromUserGroup } from "./slack";
import { group } from "console";
import { redirect } from "next/navigation";

async function throwIfNoAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user || !session.user.id) {
    throw new Error("unauthenticated");
  }
}
export async function startBacklog(
  programId: string,
  backlogTo?: string | null,
  backlogFrom?: string | null,
) {
  throwIfNoAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user || !session.user.id) {
    throw new Error("unauthenticated");
  }
  const resp = await fetch(
    `${process.env["SCRAPER_API_URL"]}/api/backlog/${programId}/start`,
    {
      method: "POST",
      body: JSON.stringify({
        programId: programId,
        backlogTo: backlogTo,
        backlogFrom: backlogFrom,
        actorId: session.user.id,
      }),
      headers: {
        "Content-type": "application/json",
      },
    },
  );
  if (!resp.ok) {
    const respText = await resp.text();
    console.log(respText);
    throw new Error("Could not start backlog job");
  }
  revalidatePath(`/programs/${programId}/settings`);
}

export async function stopBacklog(programId: string) {
  throwIfNoAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user || !session.user.id) {
    throw new Error("unauthenticated");
  }
  const resp = await fetch(
    `${process.env["SCRAPER_API_URL"]}/api/backlog/${programId}/stop`,
    {
      method: "POST",
      body: JSON.stringify({
        programId: programId,
        actorId: session.user.id,
      }),
      headers: {
        "Content-type": "application/json",
      },
    },
  );
  if (!resp.ok) {
    const respText = await resp.text();
    console.log(respText);
    throw new Error("Could not stop backlog job");
  }
  revalidatePath(`/programs/${programId}/settings`);
}

export async function addAsHelper(
  slackId: string,
  programId: string,
  revalidate: boolean = true,
) {
  throwIfNoAuth();
  await createUser(slackId);
  await prisma.slackUser.update({
    where: {
      id: slackId,
    },
    data: {
      programs: {
        connect: {
          id: programId,
        },
      },
    },
  });
  if (revalidate) {
    revalidatePath(`/programs/${programId}/settings`);
  }
}

export async function removeHelper(slackId: string, programId: string) {
  throwIfNoAuth();
  await prisma.slackUser.update({
    where: {
      id: slackId,
    },
    data: {
      programs: {
        disconnect: {
          id: programId,
        },
      },
    },
  });
  revalidatePath(`/programs/${programId}/settings`);
}

export async function saveUserGroup(groupId: string, programId: string) {
  throwIfNoAuth();
  await prisma.program.update({
    where: {
      id: programId,
    },
    data: {
      userGroup: groupId,
    },
  });
  indexUsersFromUserGroup(groupId, programId); // not async on purpose :p
  revalidatePath(`/programs/${programId}/settings`);
}
export async function updateInfo(
  programId: string,
  name: string,
  canAutoIndex: boolean,
) {
  throwIfNoAuth();
  await prisma.program.update({
    where: {
      id: programId,
    },
    data: {
      name: name,
      canAutoIndex: canAutoIndex,
    },
  });
  revalidatePath(`/programs/${programId}/settings`);
}
export async function createProgram(
  name: string,
  channelId: string,
  canAutoIndex: boolean,
) {
  throwIfNoAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const program = await prisma.program.create({
    data: {
      name: name,
      channelId: channelId,
      canAutoIndex: canAutoIndex,
      usersOrganizing: {
        connect: {
          id: session!.user?.id,
        },
      },
      assignedUsers: {
        connect: {
          id: session!.user.slackId as string,
        },
      },
    },
  });
  redirect(`/programs/${program.id}`);
}
