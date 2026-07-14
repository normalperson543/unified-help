import { auth } from "@/app/lib/auth";
import { getUser } from "@/app/lib/data";
import TicketUI from "@/app/ui/ticket";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

export default async function ThreadUI({
  params,
}: {
  params: Promise<{ ticketId: string; programId: string }>;
}) {
  const { ticketId, programId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  let user;
  if (session?.user.id) user = await getUser(session?.user.id);
  if (!user) notFound();

  return <TicketUI id={ticketId} programId={programId} />;
}
