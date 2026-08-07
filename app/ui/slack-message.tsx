// REVIEWER NOTE: THis part was coded by Claude Code and Kimi K2.7 Code
// For some reason, Zed Wakatime logged 9 extra minutes for this, so
// feel free to deflate by 9 minutes.

"use client";

import { Fragment, ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import {
  resolveSlackUser,
  resolveSlackChannel,
  resolveSlackEmoji,
} from "../lib/resolve-slack-entity";
import type {
  ResolvedSlackUser,
  ResolvedSlackChannel,
  ResolvedSlackEmoji,
} from "../lib/resolve-slack-entity";

const SLACK_WORKSPACE_URL =
  process.env["NEXT_PUBLIC_SLACK_WORKSPACE_URL"] ??
  "https://hackclub.enterprise.slack.com";

// ---------- Types ----------

interface SlackPattern {
  re: RegExp;
  render: (match: RegExpMatchArray, key: number) => ReactNode;
}

export interface SlackMessageProps {
  text: string;
}

interface EntityCache<T> {
  [key: string]: T | null | undefined;
}

// ---------- Client-side cache ----------

const userCache: EntityCache<ResolvedSlackUser> = {};
const channelCache: EntityCache<ResolvedSlackChannel> = {};
const emojiCache: EntityCache<ResolvedSlackEmoji> = {};

function getCachedUser(id: string): ResolvedSlackUser | null | undefined {
  return userCache[id];
}

function getCachedChannel(id: string): ResolvedSlackChannel | null | undefined {
  return channelCache[id];
}

function getCachedEmoji(name: string): ResolvedSlackEmoji | null | undefined {
  return emojiCache[name];
}

// ---------- Entity resolution ----------

const USER_MENTION_RE = /<@([A-Z0-9]+)(?:\|([^>]*))?>/g;
const CHANNEL_MENTION_RE = /<#([A-Z0-9]+)(?:\|([^>]*))?>/g;
const EMOJI_RE = /:([a-z0-9_+\-]+):/g;

function extractEntities(text: string) {
  const userIds = new Set<string>();
  const channelIds = new Set<string>();
  const emojiNames = new Set<string>();

  let m: RegExpExecArray | null;

  USER_MENTION_RE.lastIndex = 0;
  while ((m = USER_MENTION_RE.exec(text))) {
    userIds.add(m[1]);
  }

  CHANNEL_MENTION_RE.lastIndex = 0;
  while ((m = CHANNEL_MENTION_RE.exec(text))) {
    channelIds.add(m[1]);
  }

  // Broadcast and subteam mentions don't need API resolution.

  EMOJI_RE.lastIndex = 0;
  while ((m = EMOJI_RE.exec(text))) {
    emojiNames.add(m[1]);
  }

  return {
    userIds: Array.from(userIds),
    channelIds: Array.from(channelIds),
    emojiNames: Array.from(emojiNames),
  };
}

function useResolvedEntities(text: string) {
  const [users, setUsers] = useState<EntityCache<ResolvedSlackUser>>(() => {
    const snapshot: EntityCache<ResolvedSlackUser> = {};
    for (const id of extractEntities(text).userIds) {
      const cached = getCachedUser(id);
      if (cached !== undefined) snapshot[id] = cached;
    }
    return snapshot;
  });

  const [channels, setChannels] = useState<EntityCache<ResolvedSlackChannel>>(
    () => {
      const snapshot: EntityCache<ResolvedSlackChannel> = {};
      for (const id of extractEntities(text).channelIds) {
        const cached = getCachedChannel(id);
        if (cached !== undefined) snapshot[id] = cached;
      }
      return snapshot;
    },
  );

  const [emojis, setEmojis] = useState<EntityCache<ResolvedSlackEmoji>>(() => {
    const snapshot: EntityCache<ResolvedSlackEmoji> = {};
    for (const name of extractEntities(text).emojiNames) {
      const cached = getCachedEmoji(name);
      if (cached !== undefined) snapshot[name] = cached;
    }
    return snapshot;
  });

  useEffect(() => {
    const { userIds, channelIds, emojiNames } = extractEntities(text);

    const missingUserIds = userIds.filter((id) => userCache[id] === undefined);
    const missingChannelIds = channelIds.filter(
      (id) => channelCache[id] === undefined,
    );
    const missingEmojiNames = emojiNames.filter(
      (name) => emojiCache[name] === undefined,
    );

    if (
      missingUserIds.length === 0 &&
      missingChannelIds.length === 0 &&
      missingEmojiNames.length === 0
    ) {
      return;
    }

    let cancelled = false;

    async function resolve() {
      await Promise.all([
        Promise.all(
          missingUserIds.map(async (id) => {
            const resolved = await resolveSlackUser(id);
            userCache[id] = resolved;
          }),
        ),
        Promise.all(
          missingChannelIds.map(async (id) => {
            const resolved = await resolveSlackChannel(id);
            channelCache[id] = resolved;
          }),
        ),
        Promise.all(
          missingEmojiNames.map(async (name) => {
            const resolved = await resolveSlackEmoji(name);
            emojiCache[name] = resolved;
          }),
        ),
      ]);

      if (cancelled) return;

      setUsers((prev) => ({
        ...prev,
        ...Object.fromEntries(
          userIds.map((id) => [id, userCache[id]]),
        ),
      }));
      setChannels((prev) => ({
        ...prev,
        ...Object.fromEntries(
          channelIds.map((id) => [id, channelCache[id]]),
        ),
      }));
      setEmojis((prev) => ({
        ...prev,
        ...Object.fromEntries(
          emojiNames.map((name) => [name, emojiCache[name]]),
        ),
      }));
    }

    resolve();

    return () => {
      cancelled = true;
    };
  }, [text]);

  return { users, channels, emojis };
}

// ---------- Parser ----------

let keyCounter = 0;

function parseSlackText(
  text: string,
  resolvedUsers: EntityCache<ResolvedSlackUser>,
  resolvedChannels: EntityCache<ResolvedSlackChannel>,
  resolvedEmojis: EntityCache<ResolvedSlackEmoji>,
): ReactNode {
  if (!text) return null;

  const patterns: SlackPattern[] = [
    {
      re: /```([\s\S]+?)```/,
      render: (m, key) => (
        <pre key={key} className="slack-codeblock">
          <code>{m[1]}</code>
        </pre>
      ),
    },
    {
      re: /`([^`]+)`/,
      render: (m, key) => (
        <code key={key} className="slack-inline-code">
          {m[1]}
        </code>
      ),
    },
    {
      re: /\*([^*\n]+)\*/,
      render: (m, key) => (
        <strong key={key}>
          {parseSlackText(m[1], resolvedUsers, resolvedChannels, resolvedEmojis)}
        </strong>
      ),
    },
    {
      re: /_([^_\n]+)_/,
      render: (m, key) => (
        <em key={key}>
          {parseSlackText(m[1], resolvedUsers, resolvedChannels, resolvedEmojis)}
        </em>
      ),
    },
    {
      re: /~([^~\n]+)~/,
      render: (m, key) => (
        <s key={key}>
          {parseSlackText(m[1], resolvedUsers, resolvedChannels, resolvedEmojis)}
        </s>
      ),
    },
    {
      re: /<(https?:\/\/[^|>]+)\|([^>]+)>/,
      render: (m, key) => (
        <a key={key} href={m[1]} target="_blank" rel="noopener noreferrer">
          {m[2]}
        </a>
      ),
    },
    {
      re: /<(https?:\/\/[^>]+)>/,
      render: (m, key) => (
        <a key={key} href={m[1]} target="_blank" rel="noopener noreferrer">
          {m[1]}
        </a>
      ),
    },
    {
      re: /<@([A-Z0-9]+)(?:\|([^>]*))?>/,
      render: (m, key) => {
        const id = m[1];
        const fallback = m[2] ?? id;
        const user = resolvedUsers[id] ?? getCachedUser(id);
        return (
          <a
            key={key}
            href={`${SLACK_WORKSPACE_URL}/team/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="slack-mention font-medium text-blue-600 hover:underline"
          >
            @{user?.name ?? fallback}
          </a>
        );
      },
    },
    {
      re: /<#([A-Z0-9]+)(?:\|([^>]*))?>/,
      render: (m, key) => {
        const id = m[1];
        const fallback = m[2] ?? id;
        const channel = resolvedChannels[id] ?? getCachedChannel(id);
        return (
          <span className="inline-flex items-center gap-1">
            <a
              key={key}
              href={`${SLACK_WORKSPACE_URL}/archives/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="slack-channel font-medium text-green-600 hover:underline"
            >
              #{channel?.name ?? fallback}
            </a>
            {channel?.programId && (
              <Link
                href={`/programs/${channel.programId}`}
                title="Open program home"
                className="inline-flex items-center text-green-600 hover:text-green-700"
              >
                <ArrowRightIcon size={14} />
              </Link>
            )}
          </span>
        );
      },
    },
    {
      re: /<!(here|channel|everyone)>/,
      render: (m, key) => (
        <span
          key={key}
          className="slack-mention font-medium text-blue-600"
        >
          @{m[1]}
        </span>
      ),
    },
    {
      re: /<!subteam\^([A-Z0-9]+)(?:\|([^>]*))?>/,
      render: (m, key) => {
        const fallback = m[2] ?? m[1];
        return (
          <span
            key={key}
            className="slack-mention font-medium text-blue-600"
          >
            @{fallback}
          </span>
        );
      },
    },
    {
      re: /:([a-z0-9_+\-]+):/,
      render: (m, key) => {
        const name = m[1];
        const emoji = resolvedEmojis[name] ?? getCachedEmoji(name);
        if (emoji?.url) {
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={key}
              src={emoji.url}
              alt={`:${name}:`}
              title={name}
              className="slack-emoji inline-block align-middle"
              width={20}
              height={20}
            />
          );
        }
        return <span key={key}>:{name}:</span>;
      },
    },
  ];

  let earliest: { pattern: SlackPattern; match: RegExpMatchArray } | null =
    null;

  for (const pattern of patterns) {
    const match = text.match(pattern.re);
    if (match && match.index !== undefined) {
      if (earliest === null || match.index < (earliest.match.index as number)) {
        earliest = { pattern, match };
      }
    }
  }

  if (!earliest) return text;

  const { pattern, match } = earliest;
  const index = match.index as number;
  const before = text.slice(0, index);
  const after = text.slice(index + match[0].length);

  return (
    <Fragment key={keyCounter++}>
      {before}
      {pattern.render(match, keyCounter++)}
      {parseSlackText(after, resolvedUsers, resolvedChannels, resolvedEmojis)}
    </Fragment>
  );
}

// ---------- Component ----------

export function SlackMessage({ text }: SlackMessageProps) {
  const { users, channels, emojis } = useResolvedEntities(text);
  const lines = text.split("\n");

  return (
    <div className="slack-message">
      {lines.map((line, i) => {
        if (line.startsWith("&gt;") || line.startsWith(">")) {
          const quoteText = line.replace(/^&gt;|^>/, "").trim();
          return (
            <blockquote key={i} className="slack-quote">
              {parseSlackText(quoteText, users, channels, emojis)}
            </blockquote>
          );
        }
        return <div key={i}>{parseSlackText(line, users, channels, emojis)}</div>;
      })}
    </div>
  );
}

export default SlackMessage;
