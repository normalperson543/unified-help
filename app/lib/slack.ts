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
function escapeAngleBrackets(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function replyAsUser(
  threadTs: string,
  channel: string,
  username: string,
  userId: string,
  message: string,
  enableCtx: boolean,
  programId: string,
  ticketId: string,
) {
  const safeMessage = escapeAngleBrackets(message);
  const safeUserId = escapeAngleBrackets(userId);
  const safeProgramId = escapeAngleBrackets(programId);
  const safeTicketId = escapeAngleBrackets(ticketId);
  
  const ctx = {
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `<@${safeUserId}> | Sent with <https://unifiedhelp.normiecodes.dev|Unified Help> | <https://unifiedhelp.normiecodes.dev/programs/${safeProgramId}/ticket/${safeTicketId}|View ticket>`,
      },
    ],
  };
  return await web.chat.postMessage({
    thread_ts: threadTs,
    channel: channel,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: safeMessage,
          verbatim: true
        },
      },
      ...(enableCtx ? [ctx] : []),
    ],
    username: username,
    text: safeMessage,
    icon_url: `https://cachet.dunkirk.sh/users/${userId}/r`,
    unfurl_links: false,
  });
}
