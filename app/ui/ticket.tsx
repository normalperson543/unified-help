"use client";

import { fetcher } from "@/app/lib/swr";
import { Avatar, Chip, Button, Card } from "@heroui/react";
import {
  CheckIcon,
  CircleAlertIcon,
  CircleDashedIcon,
  SquareArrowOutUpRightIcon,
} from "lucide-react";
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
      <div className="flex flex-col p-4 gap-4 w-full">
        {!ticketIsLoading && ticket && (
          <>
            <div className="flex gap-4">
              <Avatar>
                <Avatar.Image alt="Profile picture" />
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
              dateCreated={ticket.dateCreated}
              op
            />
            {ticket.replies.map((r) => {
              if (r.slackUser.isBot) {
                if (r.message.includes("marked as resolved")) {
                  const resolver = r.resolver;
                  return (
                    <div
                      key={r.id}
                      className="flex flex-row gap-1 items-center p-4 bg-green-50 border border-green-200 rounded-md"
                    >
                      <CheckIcon />
                      Marked as <b>resolved</b> on{" "}
                      {new Date(r.dateCreated).toLocaleString()} by{" "}
                      {resolver ? (
                        <b>{resolver.username}</b>
                      ) : (
                        "a non-indexed user"
                      )}
                      {resolver && resolver.id === ticket.slackUserId && (
                        <Chip variant="primary" color="accent">
                          OP
                        </Chip>
                      )}
                      {resolver &&
                        resolver.programs.some((p) => p.id === programId) && (
                          <Chip variant="primary" color="success">
                            Helper
                          </Chip>
                        )}
                    </div>
                  );
                }
                if (r.message.includes("reopened")) {
                  const reopener = r.reopener;
                  return (
                    <div
                      key={r.id}
                      className="flex flex-row gap-2 items-center p-4 bg-orange-50 border border-orange-200 rounded-md"
                    >
                      <CircleAlertIcon />
                      <b>Reopened</b> on{" "}
                      {new Date(r.dateCreated).toLocaleDateString()} by{" "}
                      {reopener ? (
                        <b>{reopener.username}</b>
                      ) : (
                        "a non-indexed user"
                      )}
                      {reopener && reopener.id === ticket.slackUserId && (
                        <Chip variant="primary" color="accent">
                          OP
                        </Chip>
                      )}
                      {reopener &&
                        reopener.programs.some((p) => p.id === programId) && (
                          <Chip variant="primary" color="success">
                            Helper
                          </Chip>
                        )}
                    </div>
                  );
                }
                if (r.message.includes("someone")) {
                  return;
                }
              }
              return (
                <Post
                  username={r.slackUser.username}
                  message={r.message}
                  slackId={r.slackUserId}
                  key={r.id}
                  op={ticket.slackUserId === r.slackUserId}
                  isHelper={r.slackUser.programs.some(
                    (p) => p.id === programId,
                  )}
                  dateCreated={r.dateCreated}
                />
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
