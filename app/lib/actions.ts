"use server";

import { headers } from "next/headers";
import { auth } from "./auth";
import { revalidatePath } from "next/cache";

export async function startBacklog(
  programId: string,
  backlogTo: string,
  backlogFrom: string,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user || !session.user.id)
    throw new Error("unauthenticated");
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
  if (!resp.ok) throw new Error("Could not start backlog job");
  revalidatePath(`/programs/${programId}/settings`);
}
