"use client";

import { fetcher } from "@/app/lib/swr";
import { getShortTitle } from "@/app/lib/tools";
import { TicketWithReplies } from "@/app/lib/types";
import { Avatar, Card, Input, Spinner } from "@heroui/react";
import Link from "next/link";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";

let savedSidebarScrollTop = 0;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const params = useParams();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // this useLayoutEffect thing was created with Claude
  useLayoutEffect(() => {
    if (sidebarRef.current) {
      sidebarRef.current.scrollTop = savedSidebarScrollTop;
    }
  });

  const {
    data: programTickets,
    error: programError,
    isLoading: programIsLoading,
  } = useSWR<TicketWithReplies[]>(`/api/programs/${params.programId}`, fetcher);

  return (
    <div className="flex w-full text-sm flex-1 min-h-0">
      <div
        ref={sidebarRef}
        onScroll={(e) => {
          savedSidebarScrollTop = e.currentTarget.scrollTop; // this was also Claude
        }}
        className="flex flex-col gap-2 w-1/2 h-full overflow-scroll border-r border-accent-background relative"
      >
        <div className="flex gap-2 items-center sticky top-0 z-10 bg-background px-4 py-2">
          <SearchIcon width={16} />
          <Input
            type="text"
            className="w-full"
            placeholder="Search by name or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2 px-4 py-2">
          {(!programTickets || programIsLoading) && (
            <div className="flex justify-center items-center w-full h-full">
              <Spinner />
            </div>
          )}
          {programTickets &&
            programTickets.map((ticket) => (
              <Link
                href={`/programs/${ticket.programId}/ticket/${ticket.id}`}
                key={ticket.id}
                scroll={false}
              >
                <Card
                  className={`flex flex-row gap-2 items-center border-l-4 ${ticket.status === 0 && "border-orange-700"} ${ticket.status === 1 && "border-blue-700"} ${ticket.status === 2 && "border-green-700"}`}
                >
                  <Avatar size="sm">
                    <Avatar.Image
                      src={`https://cachet.dunkirk.sh/users/${ticket.slackUser.id}/r`}
                      alt="Profile picture"
                    />
                    <Avatar.Fallback>
                      {ticket.slackUser.username.substring(0, 1)}
                    </Avatar.Fallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    {getShortTitle(ticket.message)}
                    <div className="text-muted">
                      {ticket.slackUser.username} - Opened{" "}
                      {new Date(ticket.dateCreated).toLocaleDateString()} -{" "}
                      {ticket.replies.length} repl
                      {ticket.replies.length === 1 ? "y" : "ies"}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
        </div>
      </div>
      <div className="flex flex-col p-4 gap-4 w-full h-full overflow-scroll">
        {children}
      </div>
    </div>
  );
}
