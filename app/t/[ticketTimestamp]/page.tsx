import { notFound, redirect } from "next/navigation";
import { getTicketByTs } from "../../lib/data";

export default async function TicketRedirector({
  params,
}: {
  params: Promise<{ ticketTimestamp: string }>;
}) {
  const { ticketTimestamp } = await params;
  let ticket;
  try {
    ticket = await getTicketByTs(ticketTimestamp);
  } catch (e) {
    console.error(e);
    notFound();
  }
  console.log(ticket);
  if (ticket) {
    redirect(`/programs/${ticket.programId}/ticket/${ticket.id}`);
  } else notFound();
}
