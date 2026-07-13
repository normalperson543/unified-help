import { auth } from "@/app/lib/auth";
import { getUser } from "@/app/lib/data";
import NotLoggedIn from "@/app/ui/not-logged-in";
import TicketUI from "@/app/ui/ticket";
import { headers } from "next/headers";

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
  if (!user) return <NotLoggedIn />;

  return <TicketUI id={ticketId} programId={programId} />;
}
