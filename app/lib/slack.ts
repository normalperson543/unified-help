"use server";

import { WebClient } from "@slack/web-api";
import { prisma } from "./prisma";

const web = new WebClient(process.env["SLACK_BOT_TOKEN"]);

export async function createUser(id: string) {
  let dbUser;
  dbUser = await prisma.slackUser.findUnique({
    where: {
      id: id as string,
    },
  });
  let slackUser;
  if (!dbUser) {
    slackUser = await web.users.info({
      user: id as string,
    });

    dbUser = await prisma.slackUser.create({
      data: {
        id: id as string,
        username:
          slackUser.user?.real_name ?? slackUser.user?.name ?? "Unknown user",
      },
    });
  }
  return dbUser;
}
