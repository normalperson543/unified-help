import "dotenv/config";
import { WebClient } from "@slack/web-api";
import { prisma } from "../app/lib/prisma";
import type { FlaronUserResponse } from "../app/lib/types";

const web = new WebClient(process.env["SLACK_BOT_TOKEN"]);

const SLEEP_MS = Number(process.env["REFETCH_SLEEP_MS"] ?? 200);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type FetchResult = {
  username: string;
  isBot?: boolean;
  source: "flaron" | "slack";
};

function pickName(
  ...candidates: (string | null | undefined)[]
): string | undefined {
  for (const c of candidates) {
    if (c && c.length > 0) return c;
  }
  return undefined;
}

async function fetchUsername(id: string): Promise<FetchResult> {
  try {
    const flaronUser = await fetch(`https://flaron.halceon.dev/user/${id}`);
    if (flaronUser && flaronUser.ok) {
      const respJson = (await flaronUser.json()) as FlaronUserResponse;
      const username =
        pickName(
          respJson.data.user.display_name,
          respJson.data.user.real_name,
          respJson.data.user.name,
        ) ?? "Unknown user";
      if (username === "Unknown user") {
        console.warn("WARNING: No username gathered from Flaron ", id);
      }
      return {
        username,
        isBot: respJson.data.user.is_bot ?? false,
        source: "flaron",
      };
    }
  } catch (err) {
    console.warn(
      `Flaron lookup threw for ${id}:`,
      err instanceof Error ? err.message : err,
    );
  }

  console.warn(
    `WARNING: Flaron lookup failed for ${id}, falling back to slack lookup`,
  );
  const slackUser = await web.users.info({ user: id });
  const username =
    pickName(
      slackUser.user?.profile?.display_name,
      slackUser.user?.real_name,
      slackUser.user?.name,
    ) ?? "Unknown user";
  if (username === "Unknown user") {
    console.warn("WARNING: No username gathered from Slack ", id);
  }
  return { username, source: "slack" };
}

async function main() {
  const users = await prisma.slackUser.findMany();
  console.log(`Refetching usernames for ${users.length} SlackUsers...`);

  let updated = 0;
  let failed = 0;
  let unchanged = 0;

  for (const u of users) {
    try {
      const { username, isBot, source } = await fetchUsername(u.id);
      const data =
        source === "flaron"
          ? { username, isBot }
          : { username };
      await prisma.slackUser.update({ where: { id: u.id }, data });
      if (username !== u.username) {
        console.log(`[${source}] ${u.id}: "${u.username}" -> "${username}"`);
        updated++;
      } else {
        unchanged++;
      }
    } catch (err) {
      failed++;
      console.error(
        `Failed to refetch ${u.id}:`,
        err instanceof Error ? err.message : err,
      );
    }
    await sleep(SLEEP_MS);
  }

  console.log(
    `\nDone. Updated: ${updated}, Unchanged: ${unchanged}, Failed: ${failed}, Total: ${users.length}`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
