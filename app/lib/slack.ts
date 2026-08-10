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
function sanitize(text: string) {
  return neutralizeSpecialMentions(escapeAngleBrackets(text));
}
function escapeAngleBrackets(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function neutralizeSpecialMentions(text: string) {
  return text.replace(/@(channel|here|everyone)\b/gi, '@\u200B$1');
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
  const safeMessage = sanitize(message);
  const safeUserId = sanitize(userId);
  const safeProgramId = sanitize(programId);
  const safeTicketId = sanitize(ticketId);
  
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
        expand: "true",
        text: {
          type: "mrkdwn",
          text: safeMessage,
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
