import { type NextRequest } from "next/server";
import { getTicket, getUserAuthStatus } from "@/app/lib/data";
import { getThreadAttachments } from "@/app/lib/slack";
import { withSignedProxyUrls } from "@/app/lib/slack-file";
import { jsonResponse } from "@/app/lib/tools";

interface AttachmentsRouteContext {
  params: Promise<{ ticketId: string }>;
}

export async function GET(
  _req: NextRequest,
  ctx: AttachmentsRouteContext,
) {
  const authStatus = await getUserAuthStatus();
  if (authStatus.status === "unauthenticated") {
    return jsonResponse({ status: "Unauthorized" }, { status: 401 });
  }

  const { ticketId } = await ctx.params;
  const ticket = await getTicket(ticketId);

  if (!ticket) {
    return jsonResponse({ status: "Not found" }, { status: 404 });
  }

  const attachments = await getThreadAttachments(
    ticket.program.channelId,
    ticket.messageId,
  );

  return jsonResponse({ attachments: withSignedProxyUrls(attachments) });
}
