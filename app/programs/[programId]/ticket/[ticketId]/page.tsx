import { auth } from "@/app/lib/auth";
import { getUser } from "@/app/lib/data";
import TicketUI from "@/app/ui/ticket";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Loading from "@/app/ui/loading";
import { Suspense } from "react";

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
