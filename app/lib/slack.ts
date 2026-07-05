"use server";

import { WebClient } from "@slack/web-api";
import { prisma } from "./prisma";
import { addAsHelper } from "./actions";

const web = new WebClient(process.env["SLACK_API_TOKEN"]);

export async function createUser(id: string) {
  const user = await prisma.slackUser.findUnique({
    where: {
      id: id as string,
    },
  });
  let slackUser, dbUser;
  if (!user) {
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
export async function indexUsersFromUserGroup(
  groupId: string,
  programId: string,
) {
  const users = await web.usergroups.users.list({
    usergroup: groupId,
  });
  if (!users || !users.users) return;
  for (let i = 0; i < users.users.length; i++) {
    try {
      await addAsHelper(users.users[i], programId, false);
    } catch (e) {
      console.error(e)
      console.warn(`could not add user ${users.users[i]}`);
    }
  }
}
