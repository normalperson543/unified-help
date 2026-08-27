import "dotenv/config";
import { prisma } from "../app/lib/prisma";

const SCRAPER_API_URL = process.env["SCRAPER_API_URL"];
const SCRAPER_API_KEY = process.env["SCRAPER_API_KEY"];
const ACTOR_ID = process.env["BACKLOG_ACTOR_ID"] ?? "script";

// Default to backlogging the last 2 days. Override with a CLI arg, e.g.
//   pnpm start-backlog-all 3
const DAYS = Number(process.argv[2] ?? 2);

type StartResult = { ok: boolean; status: string };

async function startBacklogForProgram(
  programId: string,
  backlogTo: string,
  backlogFrom: string,
): Promise<StartResult> {
  const resp = await fetch(
    `${SCRAPER_API_URL}/api/backlog/${programId}/start`,
    {
      method: "POST",
      body: JSON.stringify({
        programId: programId,
        backlogTo: backlogTo,
        backlogFrom: backlogFrom,
        actorId: ACTOR_ID,
      }),
      headers: {
        "Content-type": "application/json",
        "x-api-key": SCRAPER_API_KEY as string,
      },
    },
  );
  const json = (await resp.json().catch(() => ({}))) as { status?: string };
  if (resp.ok) {
    return { ok: true, status: json.status ?? "created" };
  }
  if (resp.status === 400) {
    return { ok: false, status: json.status ?? "pending" };
  }
  return { ok: false, status: `error_${resp.status}` };
}

async function main() {
  if (!SCRAPER_API_URL || !SCRAPER_API_KEY) {
    throw new Error(
      "SCRAPER_API_URL and SCRAPER_API_KEY must be set in the environment",
    );
  }
  if (Number.isNaN(DAYS) || DAYS <= 0) {
    throw new Error(`Invalid number of days: ${process.argv[2] ?? 2}`);
  }

  const now = Date.now();
  // backlogTo is the oldest bound (start of range), backlogFrom is the latest
  // bound (end of range) -- see the scraper's backlogger.ts.
  const backlogTo = String(now - DAYS * 24 * 60 * 60 * 1000);
  const backlogFrom = String(now);

  const programs = await prisma.program.findMany({
    select: { id: true, name: true },
  });
  console.log(
    `Starting backlog (last ${DAYS} day(s)) for ${programs.length} program(s)...`,
  );

  let started = 0;
  let skipped = 0;
  let failed = 0;

  for (const program of programs) {
    try {
      const { ok, status } = await startBacklogForProgram(
        program.id,
        backlogTo,
        backlogFrom,
      );
      if (ok) {
        started++;
        console.log(`OK    ${program.name} (${program.id}): ${status}`);
      } else if (status === "pending") {
        skipped++;
        console.log(`SKIP  ${program.name} (${program.id}): already pending`);
      } else {
        failed++;
        console.log(`FAIL  ${program.name} (${program.id}): ${status}`);
      }
    } catch (err) {
      failed++;
      console.error(
        `FAIL  ${program.name} (${program.id}):`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  console.log(
    `\nDone. Started: ${started}, Skipped: ${skipped}, Failed: ${failed}, Total: ${programs.length}`,
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
