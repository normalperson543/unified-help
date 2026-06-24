"use client";

import { fetcher } from "@/app/lib/swr";
import { Avatar, Chip, Button, Card } from "@heroui/react";
import { CircleDashedIcon, SquareArrowOutUpRightIcon } from "lucide-react";
import useSWR from "swr";
import { TicketWithReplies } from "../lib/types";
import Post from "./post";
import { getShortTitle } from "../lib/tools";
import Link from "next/link";

export default function TicketUI({
  id,
  programId,
}: {
  id: string;
  programId: string;
}) {
  const {
    data: ticket,
    error: ticketError,
    isLoading: ticketIsLoading,
  } = useSWR<TicketWithReplies>(`/api/ticket/${id}`, fetcher);
  const {
    data: programTickets,
    error: programError,
    isLoading: programIsLoading,
  } = useSWR<TicketWithReplies[]>(`/api/programs/${programId}`, fetcher);

  return (
    <div className="flex w-full">
      <div className="flex flex-col p-2 gap-2 w-1/2 h-svh overflow-scroll">
        {programTickets &&
          programTickets.map((ticket) => (
            <Link
              href={`/program/${ticket.programId}/ticket/${ticket.id}`}
              key={ticket.id}
            >
              <Card className="flex flex-row gap-2 items-center">
                <Avatar size="sm">
                  <Avatar.Image
                    src={`https://cachet.dunkirk.sh/users/${ticket.slackUserId}/r`}
                    alt="Profile picture"
                  />
                  <Avatar.Fallback>
                    {ticket.slackUser.username.substring(0, 1)}
                  </Avatar.Fallback>
                </Avatar>
                <div className="flex flex-col gap-2 font-bold">
                  {getShortTitle(ticket.message)}
                </div>
              </Card>
            </Link>
          ))}
      </div>
      <div className="flex flex-col p-4 gap-4 w-full">
        {!ticketIsLoading && ticket && (
          <>
            <div className="flex gap-4">
              <Avatar>
                <Avatar.Image
                  src={`https://cachet.dunkirk.sh/users/${ticket.slackUserId}/r`}
                  alt="Profile picture"
                />
                <Avatar.Fallback>
                  {ticket.slackUser.username.substring(0, 1)}
                </Avatar.Fallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <h2 className="font-bold text-2xl">
                  {getShortTitle(ticket.message)}
                </h2>
                <div className="flex flex-row gap-4">
                  <Chip color="warning" variant="primary">
                    <CircleDashedIcon width={16} /> Open
                  </Chip>

                  <p>Assigned</p>
                </div>
              </div>
              <Button>
                Open in Slack <SquareArrowOutUpRightIcon />
              </Button>
            </div>
            <Post
              username={ticket.slackUser.username}
              message={ticket.message}
              slackId={ticket.slackUserId}
              op
            />
            {ticket.replies.map((r) => (
              <Post
                username={r.slackUser.username}
                message={r.message}
                slackId={r.slackUserId}
                key={r.id}
                op={ticket.slackUserId === r.slackUserId}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
