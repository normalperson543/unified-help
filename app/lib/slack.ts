import { WebClient } from "@slack/web-api";
import { prisma } from "./prisma";
import { FlaronUserResponse } from "./types";

const web = new WebClient(process.env["SLACK_BOT_TOKEN"]);

export async function createUser(id: string) {
  let dbUser;
  dbUser = await prisma.slackUser.findUnique({
    where: {
      id: id as string,
    },
  });
  if (!dbUser) {
    const flaronUser = await fetch(`https://flaron.halceon.dev/user/${id}`);
    if (flaronUser && flaronUser.ok) {
      const respJson = (await flaronUser.json()) as FlaronUserResponse;
      let username;
      if (
        respJson.data.user.display_name &&
        respJson.data.user.display_name.length > 0
      ) {
        username = respJson.data.user.display_name;
      } else if (
        respJson.data.user.real_name &&
        respJson.data.user.real_name.length > 0
      ) {
        username = respJson.data.user.real_name;
      } else if (
        respJson.data.user.name &&
        respJson.data.user.name.length > 0
      ) {
        username = respJson.data.user.name;
      } else {
        console.warn("WARNING: No username gathered from Flaron ", id);
        username = "Unknown user";
      }
      dbUser = await prisma.slackUser.create({
        data: {
          id: id as string,
          username: username,
          isBot: respJson.data.user.is_bot ?? false,
        },
      });
    } else {
      console.warn(
        `WARNING: Flaron lookup failed for ${id}, falling back to slack lookup`,
      );
      const slackUser = await web.users.info({
        user: id as string,
      });
      let username;
      if (
        slackUser.user?.profile?.display_name &&
        slackUser.user?.profile?.display_name.length > 0
      ) {
        username = slackUser.user?.profile?.display_name;
      } else if (
        slackUser.user?.real_name &&
        slackUser.user?.real_name.length > 0
      ) {
        username = slackUser.user?.real_name;
      } else if (slackUser.user?.name && slackUser.user?.name.length > 0) {
        username = slackUser.user?.name;
      } else {
        console.warn("WARNING: No username gathered from Flaron ", id);
        username = "Unknown user";
      }
      dbUser = await prisma.slackUser.create({
        data: {
          id: id as string,
          username: username,
        },
      });
    }
  }
  return dbUser;
}
function sanitize(text: string) {
  return neutralizeSpecialMentions(escapeAngleBrackets(text));
}
function escapeAngleBrackets(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function neutralizeSpecialMentions(text: string) {
  return text.replace(/@(channel|here|everyone)\b/gi, "@\u200B$1");
}
export async function isParentMessageDeleted(
  threadTs: string,
  channel: string,
): Promise<boolean> {
  try {
    const result = await web.conversations.replies({
      channel,
      ts: threadTs,
      limit: 1,
    });
    if (!result.messages || result.messages.length === 0) {
      return true;
    }
    return result.messages[0].ts !== threadTs;
  } catch (e) {
    const slackError = e as { data?: { error?: string } };
    if (slackError.data?.error === "message_not_found") {
      return true;
    }
    throw e;
  }
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
        expand: true,
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
export async function postMessageAsResolver(
  threadTs: string,
  channel: string,
  message: string,
  intro: string,
) {
  const safeMessage = sanitize(message);
  await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: `d=${process.env["SLACK_XOXD_TOKEN"]}`,
    },
    body: new URLSearchParams({
      token: process.env["SLACK_XOXC_TOKEN"]!,
      channel: channel,
      thread_ts: threadTs,
      text: intro,
    }),
  });
  await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: `d=${process.env["SLACK_XOXD_TOKEN"]}`,
    },
    body: new URLSearchParams({
      token: process.env["SLACK_XOXC_TOKEN"]!,
      channel: channel,
      thread_ts: threadTs,
      blocks: JSON.stringify([
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: safeMessage,
          },
        },
      ]),
    }),
  });
}
