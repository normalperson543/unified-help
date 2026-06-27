import TicketUI from "@/app/ui/ticket";

export default async function ThreadUI({
  params,
}: {
  params: Promise<{ ticketId: string, programId: string }>;
}) {
  const { ticketId, programId } = await params;

  return <TicketUI id={ticketId} programId={programId} />;
}
