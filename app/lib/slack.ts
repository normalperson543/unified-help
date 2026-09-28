import { WebClient } from "@slack/web-api";
import { prisma } from "./prisma";
import { FlaronUserResponse, SlackAttachment } from "./types";

const web = new WebClient(process.env["SLACK_BOT_TOKEN"]);

const STATUS_REACTION_EMOJIS = ["white_check_mark", "thinking_face"];

export async function syncTicketReaction(
  channelId: string,
  messageTs: string,
  status: number,
) {
  const desiredEmoji = status === 2 ? "white_check_mark" : "thinking_face";

  try {
    const reactionsRes = await web.reactions.get({
      channel: channelId,
      timestamp: messageTs,
      full: true,
    });

    const reactions = reactionsRes.message?.reactions ?? [];
    const existingEmojis = new Set(
      reactions.map((r) => r.name).filter((name): name is string => !!name),
    );

    const hasDesired = existingEmojis.has(desiredEmoji);

    for (const name of STATUS_REACTION_EMOJIS) {
      if (name === desiredEmoji) continue;
      if (!existingEmojis.has(name)) continue;
      try {
        await web.reactions.remove({
          channel: channelId,
          timestamp: messageTs,
          name,
        });
      } catch (e) {
        console.warn(`Failed to remove reaction :${name}:`, e);
      }
    }

    if (!hasDesired) {
      await web.reactions.add({
        channel: channelId,
        timestamp: messageTs,
        name: desiredEmoji,
      });
    }
  } catch (e) {
    console.error("Error syncing ticket reaction:", e);
  }
}

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
export async function getThreadAttachments(
  channelId: string,
  threadTs: string,
): Promise<Record<string, SlackAttachment[]>> {
  const attachments: Record<string, SlackAttachment[]> = {};
  let cursor: string | undefined;

  try {
    do {
      const result = await web.conversations.replies({
        channel: channelId,
        ts: threadTs,
        limit: 200,
        cursor,
      });

      if (!result.messages) break;

      for (const message of result.messages) {
        const ts = message.ts;
        const files = (message as { files?: unknown[] }).files;
        if (!ts || !Array.isArray(files) || files.length === 0) continue;

        const mapped: SlackAttachment[] = files
          .filter(
            (
              f,
            ): f is {
              id?: string;
              name?: string;
              title?: string;
              mimetype?: string;
              filetype?: string;
              permalink?: string;
              permalink_public?: string;
              url_private?: string;
              thumb_360?: string;
              thumb_160?: string;
              mode?: string;
            } => typeof f === "object" && f !== null,
          )
          .filter((f) => f.id && f.mode !== "tombstone")
          .map((f) => {
            const mimetype = f.mimetype ?? "application/octet-stream";
            return {
              id: f.id as string,
              name: f.name ?? f.title ?? "Untitled",
              title: f.title ?? f.name ?? "Untitled",
              mimetype,
              filetype: f.filetype ?? "",
              permalink: f.permalink ?? "",
              permalinkPublic: f.permalink_public,
              urlPrivate: f.url_private ?? "",
              thumb360: f.thumb_360,
              thumb160: f.thumb_160,
              isImage: mimetype.startsWith("image/"),
            };
          });

        if (mapped.length > 0) attachments[ts] = mapped;
      }

      cursor = result.response_metadata?.next_cursor ?? undefined;
    } while (cursor);
  } catch (e) {
    console.error("Error fetching thread attachments:", e);
  }

  return attachments;
}

export async function replyAsUser(
  userToken: string,
  threadTs: string,
  channel: string,
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
        text: `<@${safeUserId}> | Sent with <https://unified.help.hackclub.com|Unified Help> | <https://unified.help.hackclub.com/programs/${safeProgramId}/ticket/${safeTicketId}|View ticket>`,
      },
    ],
  };

  const userWeb = new WebClient(userToken);
  try {
    return await userWeb.chat.postMessage({
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
      text: safeMessage,
      unfurl_links: false,
    });
  } catch (e) {
    const slackError = e as { data?: { error?: string } };
    const err = slackError.data?.error;
    if (
      err === "token_revoked" ||
      err === "invalid_auth" ||
      err === "not_authed" ||
      err === "account_inactive"
    ) {
      throw new Error("SLACK_TOKEN_INVALID");
    }
    throw e;
  }
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
export async function postMacroMessage(
  channelId: string,
  messageTs: string,
  username: string,
  iconUrl: string,
  message: string,
  ticketId: string,
  programId: string,
) {
  await web.chat.postMessage({
    channel: channelId,
    thread_ts: messageTs,
    username,
    icon_url: iconUrl,
    text: message,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: message,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "Reopen", emoji: true },
            value: ticketId,
            action_id: "reopen",
            style: "primary",
          },
        ],
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `<https://unified.help.hackclub.com/programs/${programId}/ticket/${ticketId}|Open with Unified Help>`,
          },
        ],
      },
    ],
    unfurl_links: false,
  });
}

export async function reopenMessage(
  channelId: string,
  messageTs: string,
  username: string,
  iconUrl: string,
  reopenerId: string,
  reopenMessage: string,
  ticketId: string,
  programId: string,
) {
  await web.chat.postMessage({
    channel: channelId,
    thread_ts: messageTs,
    username: username,
    icon_url: iconUrl,
    text: `This ticket was reopened by <@${reopenerId}>.`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: reopenMessage,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `This ticket was reopened by <@${reopenerId}>. To close it, click Resolve.`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Reopen",
              emoji: true,
            },
            value: ticketId,
            action_id: "reopen",
            style: "primary",
          },
        ],
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `<https://unified.help.hackclub.com/programs/${programId}/ticket/${ticketId}|Open with Unified Help>`,
          },
        ],
      },
    ],
    unfurl_links: false,
  });
}
