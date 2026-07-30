"use client";

import { fetcher } from "@/app/lib/swr";
import {
  Avatar,
  Chip,
  Button,
  Tooltip,
  Alert,
  Popover,
  Dropdown,
  toast,
} from "@heroui/react";
import {
  CheckIcon,
  CircleAlertIcon,
  CircleDashedIcon,
  CircleIcon,
  ClockIcon,
  ReplyIcon,
  SquareArrowOutUpRightIcon,
  TagIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import useSWR from "swr";
import { TicketWithReplies } from "../lib/types";
import Post from "./post";
import { getShortTitle } from "../lib/tools";
import Link from "next/link";
import Loading from "./loading";
import { REFRESH_INTERVAL } from "../lib/constants";
import { authClient } from "../lib/auth-client";
import { connectTag, disconnectTag } from "../lib/actions";

export default function TicketUI({
  id,
  programId,
  isHelper,
}: {
  id: string;
  programId: string;
  isHelper: boolean;
}) {
  const {
    data: ticket,
    error: ticketError,
    isLoading: ticketIsLoading,
  } = useSWR<TicketWithReplies>(`/api/ticket/${id}`, fetcher, {
    refreshInterval: REFRESH_INTERVAL,
  });

  let backgroundColor = "initial";
  if (ticket && ticket.status === 0) {
    backgroundColor = "var(--color-orange-950)";
  }
  if (ticket && ticket.status === 1) {
    backgroundColor = "var(--color-blue-950)";
  }
  if (ticket && ticket.status === 2) {
    backgroundColor = "var(--color-green-950)";
  }

  async function handleConnectTag(id: string) {
    try {
      if (!ticket) return;
      await connectTag(id, ticket.id, ticket.program.id);
    } catch {
      toast("Cannot add this tag", {
        indicator: <TriangleAlertIcon />,
        variant: "danger",
      });
      return;
    }
  }
  async function handleDisconnectTag(id: string) {
    try {
      if (!ticket) return;
      await disconnectTag(id, ticket.id, ticket.program.id);
    } catch {
      toast("Cannot remove this tag", {
        indicator: <TriangleAlertIcon />,
        variant: "danger",
      });
      return;
    }
  }

  return (
    <>
      {(ticketIsLoading || !ticket) && !ticketError && <Loading />}
      {ticketError && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>There was a problem fetching this ticket</Alert.Title>
            <Alert.Description>
              Please try again by refreshing.
            </Alert.Description>
          </Alert.Content>
        </Alert>
      )}
      {!ticketIsLoading && ticket && (
        <div className="relative flex flex-col gap-4 min-h-full">
          <div
            className="flex justify-between sticky top-0 bg-background p-4 z-10"
            style={{ backgroundColor: backgroundColor }}
          >
            <div className="flex gap-4 flex-1">
              <Link
                href={`/profile/${ticket.slackUser.id}/program/${ticket.programId}`}
              >
                <Avatar>
                  <Avatar.Image
                    src={`https://cachet.dunkirk.sh/users/${ticket.slackUser.id}/r`}
                    alt="Profile picture"
                  />
                  <Avatar.Fallback>
                    {ticket.slackUser.username.substring(0, 1)}
                  </Avatar.Fallback>
                </Avatar>
              </Link>

              <div className="flex flex-col gap-2">
                <h2 className="font-bold text-xl">
                  {getShortTitle(ticket.message).length > 0 ? (
                    getShortTitle(ticket.message)
                  ) : (
                    <span className="text-muted italic">
                      [No title provided]
                    </span>
                  )}
                </h2>
                <div className="flex flex-row gap-4 items-center">
                  {ticket.status === 0 && (
                    <Chip color="warning" variant="primary">
                      <CircleDashedIcon width={16} /> Open
                    </Chip>
                  )}
                  {ticket.status === 1 && (
                    <Chip color="accent" variant="primary">
                      <CircleIcon width={16} /> Assigned
                    </Chip>
                  )}
                  {ticket.status === 2 && (
                    <Chip color="success" variant="primary">
                      <CheckIcon width={16} /> Resolved
                    </Chip>
                  )}
                  <div className="flex flex-col gap-6">
                    <div className="flex -space-x-2">
                      {ticket.assignees.map((user) => (
                        <Tooltip delay={0} key={user.id}>
                          <Tooltip.Trigger>
                            <Link
                              href={`/profile/${user.id}/program/${ticket.programId}`}
                              target="_blank"
                            >
                              <Avatar size="sm">
                                <Avatar.Image
                                  src={`https://cachet.dunkirk.sh/users/${user.id}/r`}
                                  alt="Profile picture"
                                />
                                <Avatar.Fallback>
                                  {user.username.substring(0, 1)}
                                </Avatar.Fallback>
                              </Avatar>
                            </Link>
                          </Tooltip.Trigger>
                          <Tooltip.Content>
                            <p>{user.username}</p>
                          </Tooltip.Content>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                  {ticket.assignees.length === 0 && (
                    <p className="text-muted">No assignees</p>
                  )}
                  {ticket.responseTime !== 0 && ticket.status > 0 && (
                    <div className="flex items-center gap-2">
                      <ReplyIcon width={16} className="text-muted" />
                      <p className="text-muted">
                        {ticket.responseTime < 60 && (
                          <>
                            {Math.round(ticket.responseTime * 100) / 100}{" "}
                            seconds
                          </>
                        )}
                        {ticket.responseTime >= 60 && (
                          <>
                            {Math.round((ticket.responseTime / 60) * 100) / 100}{" "}
                            minutes
                          </>
                        )}
                      </p>
                    </div>
                  )}
                  {ticket.resolveTime !== 0 &&
                    ticket.responseTime !== 0 &&
                    ticket.status == 2 && (
                      <div className="flex items-center gap-2 text-muted">
                        {ticket.resolveTime > ticket.responseTime &&
                          ticket.resolveTime - ticket.responseTime < 60 && (
                            <>
                              <ClockIcon width={16} className="text-muted" />
                              {Math.round(
                                (ticket.resolveTime - ticket.responseTime) *
                                  100,
                              ) / 100}{" "}
                              seconds
                            </>
                          )}

                        {ticket.resolveTime - ticket.responseTime >= 60 && (
                          <>
                            <ClockIcon width={16} className="text-muted" />
                            {Math.round(
                              ((ticket.resolveTime - ticket.responseTime) /
                                60) *
                                100,
                            ) / 100}{" "}
                            minutes
                          </>
                        )}
                      </div>
                    )}
                  {ticket.resolveTime !== 0 && ticket.status == 2 && (
                    <div className="flex items-center gap-2">
                      <CheckIcon width={16} className="text-muted" />
                      <p className="text-muted">
                        {ticket.resolveTime < 60 && (
                          <>
                            {Math.round(ticket.resolveTime * 100) / 100} seconds
                          </>
                        )}
                        {ticket.resolveTime >= 60 && (
                          <>
                            {Math.round((ticket.resolveTime / 60) * 100) / 100}{" "}
                            minutes
                          </>
                        )}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2 items-center">
                    {ticket.tag.map((t) => (
                      <Chip key={t.id}>
                        {t.name}{" "}
                        <button
                          onClick={() => handleDisconnectTag(t.id)}
                          className="hover:cursor-pointer"
                        >
                          <XIcon width={12} />
                        </button>
                      </Chip>
                    ))}

                    {isHelper && (
                      <Dropdown>
                        <Button isIconOnly variant="secondary">
                          <TagIcon width={12} />
                        </Button>
                        <Dropdown.Popover>
                          <Dropdown.Menu>
                            {ticket.program.tags.map((t) => (
                              <Dropdown.Item
                                onClick={() => handleConnectTag(t.id)}
                                key={t.id}
                              >
                                {t.name}
                              </Dropdown.Item>
                            ))}
                          </Dropdown.Menu>
                        </Dropdown.Popover>
                      </Dropdown>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <Link
              href={`https://hackclub.slack.com/archives/${ticket.program.channelId}/p${Number(ticket.messageId) * 1000000}`}
              target="_blank"
            >
              <Button>
                Open in Slack <SquareArrowOutUpRightIcon />
              </Button>
            </Link>
          </div>
          <div className="flex flex-col gap-4 p-4 ">
            <Post
              username={ticket.slackUser.username}
              message={ticket.message}
              slackId={ticket.slackUserId}
              dateCreated={ticket.dateCreated}
              programId={ticket.programId}
              op
            />
            {ticket.replies.map((r) => {
              if (r.slackUser.isBot) {
                if (r.message.includes(ticket.program.resolveKeyword)) {
                  const resolver = r.resolver;
                  return (
                    <div
                      key={r.id}
                      className="flex flex-row gap-1 items-center p-4 bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-700 rounded-md"
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
                      className="flex flex-row gap-1 items-center p-4 bg-orange-50 border border-orange-200 dark:bg-orange-950 dark:border-orange-700 rounded-md"
                    >
                      <CircleAlertIcon />
                      <b>Reopened</b> on{" "}
                      {new Date(r.dateCreated).toLocaleString()} by{" "}
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
                if (
                  r.message.includes("someone") ||
                  r.message.includes("received")
                ) {
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
                  programId={ticket.programId}
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
