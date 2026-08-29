import "dotenv/config";
import { WebClient } from "@slack/web-api";
import { prisma } from "../app/lib/prisma";
import type { FlaronUserResponse } from "../app/lib/types";

const web = new WebClient(process.env["SLACK_BOT_TOKEN"]);

const SLEEP_MS = Number(process.env["REFETCH_SLEEP_MS"] ?? 200);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "--";
  const totalSec = Math.round(ms / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const totalMin = Math.floor(totalSec / 60);
  const remSec = totalSec % 60;
  if (totalMin < 60) return `${totalMin}m ${remSec}s`;
  const totalHr = Math.floor(totalMin / 60);
  const remMin = totalMin % 60;
  return `${totalHr}h ${remMin}m`;
}

function progressTag(processed: number, total: number, elapsedMs: number): string {
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0;
  let eta = "--";
  if (processed > 0 && processed < total) {
    const avgPerUser = elapsedMs / processed;
    eta = formatDuration((total - processed) * avgPerUser);
  } else if (processed >= total) {
    eta = "0s";
  }
  return `[${processed}/${total} ${pct}% | ETA ${eta}]`;
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
  const total = users.length;
  console.log(`Refetching usernames for ${total} SlackUsers...`);

  let updated = 0;
  let failed = 0;
  let unchanged = 0;
  const start = Date.now();

  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    const tag = progressTag(i + 1, total, Date.now() - start);
    try {
      const { username, isBot, source } = await fetchUsername(u.id);
      const data =
        source === "flaron"
          ? { username, isBot }
          : { username };
      await prisma.slackUser.update({ where: { id: u.id }, data });
      if (username !== u.username) {
        console.log(
          `${tag} [${source}] ${u.id}: "${u.username}" -> "${username}"`,
        );
        updated++;
      } else {
        console.log(`${tag} [${source}] ${u.id} unchanged`);
        unchanged++;
      }
    } catch (err) {
      failed++;
      console.error(
        `${tag} FAILED ${u.id}:`,
        err instanceof Error ? err.message : err,
      );
    }
    await sleep(SLEEP_MS);
  }

  console.log(
    `\nDone in ${formatDuration(Date.now() - start)}. Updated: ${updated}, Unchanged: ${unchanged}, Failed: ${failed}, Total: ${total}`,
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
