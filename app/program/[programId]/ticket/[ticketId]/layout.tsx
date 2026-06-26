"use client";

import { fetcher } from "@/app/lib/swr";
import { getShortTitle } from "@/app/lib/tools";
import { TicketWithReplies } from "@/app/lib/types";
import { Avatar, Card } from "@heroui/react";
import Link from "next/link";
import useSWR from "swr";
import { useParams } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const params = useParams();
  const {
    data: programTickets,
    error: programError,
    isLoading: programIsLoading,
  } = useSWR<TicketWithReplies[]>(`/api/programs/${params.programId}`, fetcher);
  return (
    <div className="flex w-full text-sm">
      <div className="flex flex-col p-2 gap-2 w-1/2 h-svh overflow-scroll">
        {programTickets &&
          programTickets.map((ticket) => (
            <Link
              href={`/program/${ticket.programId}/ticket/${ticket.id}`}
              key={ticket.id}
            >
              <Card className="flex flex-row gap-2 items-center">
                <Avatar size="sm">
                  <Avatar.Image alt="Profile picture" />
                  <Avatar.Fallback>
                    {ticket.slackUser.username.substring(0, 1)}
                  </Avatar.Fallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  {getShortTitle(ticket.message)}
                  <div className="text-muted">
                    {ticket.slackUser.username} - Opened{" "}
                    {new Date(ticket.dateCreated).toLocaleDateString()}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
      </div>
      <div className="flex flex-col p-4 gap-4 w-full h-svh overflow-scroll">
        {children}
      </div>
    </div>
  );
}
