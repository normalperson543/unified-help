"use server";

import { prisma } from "./prisma";

const FLARON_API_URL =
  process.env["FLARON_API_URL"] ?? "https://flaron.halceon.dev";

export interface ResolvedSlackUser {
  id: string;
  name: string;
  source: "db" | "api";
}

export interface ResolvedSlackChannel {
  id: string;
  name: string;
  source: "db" | "api";
  programId?: string;
}

export interface ResolvedSlackEmoji {
  name: string;
  url: string;
}

async function fetchFlaron<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${FLARON_API_URL}${path}`);
    if (!res.ok) return null;
    const json = (await res.json()) as Record<string, unknown>;
    if (json.error) return null;
    return json as T;
  } catch (e) {
    console.error(`Flaron API fetch failed: ${path}`, e);
    return null;
  }
}

export async function resolveSlackUser(
  id: string,
): Promise<ResolvedSlackUser | null> {
  const dbUser = await prisma.slackUser.findUnique({
    where: { id },
  });

  if (dbUser) {
    return { id, name: dbUser.username, source: "db" };
  }

  const json = await fetchFlaron<{ data?: { user?: { name?: string; real_name?: string; display_name?: string } } }>(
    `/user/${encodeURIComponent(id)}`,
  );
  const user = json?.data?.user;
  if (!user) return null;

  const name = user.display_name || user.real_name || user.name || id;
  return { id, name, source: "api" };
}

export async function resolveSlackChannel(
  id: string,
): Promise<ResolvedSlackChannel | null> {
  const program = await prisma.program.findFirst({
    where: {
      OR: [{ channelId: id }, { helperChannelId: id }],
    },
  });

  if (program) {
    return { id, name: program.name, source: "db", programId: program.id };
  }

  const json = await fetchFlaron<{ name?: string }>(
    `/cid/${encodeURIComponent(id)}`,
  );
  if (!json?.name) return null;

  return { id, name: json.name, source: "api" };
}

export async function resolveSlackEmoji(
  name: string,
): Promise<ResolvedSlackEmoji | null> {
  const json = await fetchFlaron<{ data?: { url?: string } }>(
    `/emoji/${encodeURIComponent(name)}`,
  );
  if (!json?.data?.url) return null;

  return { name, url: json.data.url };
}
