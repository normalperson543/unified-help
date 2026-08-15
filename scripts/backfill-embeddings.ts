import { prisma } from "../app/lib/prisma";
import { ensureTicketEmbedded } from "../app/lib/ai/embeddings";
import { isAiEnabled } from "../app/lib/ai/config";

function parseArgs() {
  const args = process.argv.slice(2);
  let programId: string | undefined;
  let limit: number | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--programId" || arg === "-p") {
      programId = args[++i];
    } else if (arg === "--limit" || arg === "-l") {
      limit = parseInt(args[++i], 10);
      if (Number.isNaN(limit)) {
        console.error(`Invalid limit: ${args[i]}`);
        process.exit(1);
      }
    } else if (arg === "--help" || arg === "-h") {
      console.log(`Usage: pnpm backfill:embeddings [options]

Options:
  --programId, -p <id>  Only embed tickets for this program
  --limit, -l <n>       Stop after embedding this many tickets
  --help, -h            Show this help message
`);
      process.exit(0);
    }
  }

  return { programId, limit };
}

async function main() {
  if (!isAiEnabled()) {
    console.error("AI is not configured. Set OPENAI_API_KEY and OPENAI_MODEL.");
    process.exit(1);
  }

  const { programId, limit } = parseArgs();

  const resolvedTickets = await prisma.ticket.findMany({
    where: {
      status: 2,
      ...(programId ? { programId } : {}),
    },
    orderBy: { dateCreated: "desc" },
    select: { id: true, programId: true },
    take: limit,
  });

  console.log(
    `Found ${resolvedTickets.length} resolved tickets to embed` +
      (programId ? ` for program ${programId}` : "") +
      (limit ? ` (limited to ${limit})` : "") +
      ".",
  );

  for (let i = 0; i < resolvedTickets.length; i++) {
    const ticket = resolvedTickets[i];
    try {
      await ensureTicketEmbedded(ticket.id);
      console.log(`[${i + 1}/${resolvedTickets.length}] Embedded ${ticket.id}`);
    } catch (e) {
      console.error(
        `[${i + 1}/${resolvedTickets.length}] Failed to embed ${ticket.id}:`,
        e,
      );
    }
  }

  console.log("Backfill complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
