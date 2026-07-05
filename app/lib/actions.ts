"use server";

import { headers } from "next/headers";
import { auth } from "./auth";
import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";

export async function startBacklog(
  programId: string,
  backlogTo?: string | null,
  backlogFrom?: string | null,
) {
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

export async function addAsHelper(slackId: string, programId: string) {
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
  revalidatePath(`/programs/${programId}/settings`)
}

export async function removeHelper(slackId: string, programId: string) {
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
  revalidatePath(`/programs/${programId}/settings`)
}