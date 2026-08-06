import TicketUI from "@/app/ui/ticket";
import Loading from "@/app/ui/loading";
import { cache, Suspense } from "react";
import { Metadata } from "next";
import { getTicket, getSlackUser, isHelper, getINotes } from "@/app/lib/data";
import { getShortTitle } from "@/app/lib/tools";
import { notFound } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import { INoteWithSlackUser } from "@/app/lib/types";
import Unauthorized from "@/app/ui/unauthorized";

const getTicketCached = cache(async (ticketId: string) => {
  const ticket = await getTicket(ticketId);
  return ticket;
});
export async function generateMetadata({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}): Promise<Metadata> {
  const { ticketId } = await params;
  let ticket;
  try {
    ticket = await getTicketCached(ticketId);
  } catch {
    return {
      title: "View ticket",
    };
  }
  return {
    title: `${ticket ? (getShortTitle(ticket.message).length > 0 ? getShortTitle(ticket.message) : "View ticket") : "View ticket"} | ${ticket ? ticket.program.name : ""}`,
    description: ticket
      ? ticket.message
      : "View this ticket from Unified Help.",
  };
}
export default async function ThreadUI({
  params,
}: {
  params: Promise<{ ticketId: string; programId: string }>;
}) {
  const { ticketId, programId } = await params;

  const session = await auth.api.getSession({
    // from better auth docs bc too lazy :
    headers: await headers(), // you need to pass the headers object.
  });
  let user;
  if (!session) return <Unauthorized />
  if (session?.user.slackId) user = await getSlackUser(session?.user.slackId);

  const ticket = await getTicketCached(ticketId);
  if (ticket) {
    const helper = await isHelper(ticket.program.id);
    let inotes: INoteWithSlackUser[] = [];
    if (helper) {
      inotes = await getINotes(ticketId, ticket.programId);
    }
    return (
      <Suspense fallback={<Loading />}>
        <TicketUI
          id={ticketId}
          programId={programId}
          isHelper={helper}
          signedInUser={user}
          inotes={inotes}
        />
      </Suspense>
    );
  } else {
    notFound();
  }
}
