"use client";

import { fetcher } from "@/app/lib/swr";
import { Avatar, Chip, Button, Card } from "@heroui/react";
import {
  CheckIcon,
  CircleAlertIcon,
  CircleDashedIcon,
  CircleIcon,
  SquareArrowOutUpRightIcon,
} from "lucide-react";
import useSWR from "swr";
import { TicketWithReplies } from "../lib/types";
import Post from "./post";
import { getShortTitle } from "../lib/tools";
import Link from "next/link";
import { Ticket } from "@/generated/prisma/client";

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

  return (
    <>
      {!ticketIsLoading && ticket && (
        <>
          <div className="flex justify-between">
            <div className="flex gap-4 flex-1">
              <Avatar>
                <Avatar.Image alt="Profile picture" />
                <Avatar.Fallback>
                  {ticket.slackUser.username.substring(0, 1)}
                </Avatar.Fallback>
              </Avatar>

              <div className="flex flex-col gap-2">
                <h2 className="font-bold text-xl">
                  {getShortTitle(ticket.message)}
                </h2>
                <div className="flex flex-row gap-4 items-center">
                  {ticket.status === 0 && (
                    <Chip color="warning" variant="primary">
                      <CircleDashedIcon width={16} /> Open
                    </Chip>
                  )}
                  {ticket.status === 1 && (
                    <>
                      <Chip color="accent" variant="primary">
                        <CircleIcon width={16} /> Assigned
                      </Chip>
                      <div className="flex flex-col gap-6">
                        <div className="flex -space-x-2">
                          {ticket.assignees.map((user) => (
                            <Avatar size="sm" key={user.id}>
                              <Avatar.Image
                                src={`https://cachet.dunkirk.sh/users/${user.id}/r`}
                                alt="Profile picture"
                              />
                              <Avatar.Fallback>
                                {user.username.substring(0, 1)}
                              </Avatar.Fallback>
                            </Avatar>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  {ticket.status === 2 && (
                    <>
                      <Chip color="success" variant="primary">
                        <CheckIcon width={16} /> Resolved
                      </Chip>
                      <div className="flex flex-col gap-6">
                        <div className="flex -space-x-2">
                          {ticket.assignees.map((user) => (
                            <Avatar size="sm" key={user.id}>
                              <Avatar.Image
                                src={`https://cachet.dunkirk.sh/users/${user.id}/r`}
                                alt="Profile picture"
                              />
                              <Avatar.Fallback>
                                {user.username.substring(0, 1)}
                              </Avatar.Fallback>
                            </Avatar>
                          ))}
                          {ticket.assignees.length === 0 && (
                            <p className="text-muted">No assignees - </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
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
                isHelper={r.slackUser.programs.some((p) => p.id === programId)}
                dateCreated={r.dateCreated}
              />
            );
          })}
        </>
      )}
    </>
  );
}
