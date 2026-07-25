import TicketUI from "@/app/ui/ticket";
import Loading from "@/app/ui/loading";
import { Suspense } from "react";
import { Metadata } from "next";
import { getTicket } from "@/app/lib/data";
import { getShortTitle } from "@/app/lib/tools";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}): Promise<Metadata> {
  const { ticketId } = await params;
  const ticket = await getTicket(ticketId);
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

  return (
    <Suspense fallback={<Loading />}>
      <TicketUI id={ticketId} programId={programId} />
    </Suspense>
  );
}
