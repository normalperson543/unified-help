"use client";

import { fetcher } from "@/app/lib/swr";
import {
  Avatar,
  Chip,
  Button,
  Tooltip,
  Alert,
  Dropdown,
  toast,
  TextArea,
  Spinner,
  Switch,
} from "@heroui/react";
import {
  CheckIcon,
  CircleAlertIcon,
  CircleDashedIcon,
  CircleIcon,
  ClockIcon,
  PlusIcon,
  RefreshCwIcon,
  ReplyIcon,
  SendIcon,
  SquareArrowOutUpRightIcon,
  TagIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import useSWR from "swr";
import { INoteWithSlackUser, TicketWithReplies } from "../lib/types";
import Post from "./post";
import { getShortTitle } from "../lib/tools";
import Link from "next/link";
import Loading from "./loading";
import { REFRESH_INTERVAL, RESOLVE_MACROS } from "../lib/constants";
import {
  connectTag,
  disconnectTag,
  postINote,
  reindexTicket,
  replyToTicket,
  resolveTicket,
  reopenTicket,
} from "../lib/actions";
import { useEffect, useState } from "react";
import { SlackUser } from "@/generated/prisma/browser";
import { authClient } from "../lib/auth-client";

export default function TicketUI({
  id,
  programId,
  isHelper,
  signedInUser,
  inotes,
  allowReply,
  slackAuthenticated,
  isAdmin,
}: {
  id: string;
  programId: string;
  isHelper: boolean;
  signedInUser?: SlackUser | null;
  inotes: INoteWithSlackUser[];
  allowReply: boolean;
  slackAuthenticated: boolean;
  isAdmin: boolean;
}) {
  const {
    data: ticket,
    error: ticketError,
    isLoading: ticketIsLoading,
    mutate,
  } = useSWR<TicketWithReplies>(`/api/ticket/${id}`, fetcher, {
    refreshInterval: REFRESH_INTERVAL,
  });

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [ctx, setCtx] = useState(() => {
    if (typeof window === "undefined") return true; // this useState was ai generated
    const stored = localStorage.getItem("ticket-attribution-enabled");
    return stored === null ? true : stored === "true";
  });
  const [sendingINote, setSendingINote] = useState(false);
  const [inote, setINote] = useState("");
  const [linkingSlack, setLinkingSlack] = useState(false);
  const [reindexing, setReindexing] = useState(false);

  useEffect(() => {
    localStorage.setItem("ticket-attribution-enabled", String(ctx));
  }, [ctx]);

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

  async function handlePostMessage() {
    try {
      if (!ticket) return;
      setSending(true);
      await replyToTicket(ticket.id, ticket.programId, message, ctx);
      toast("Posted!", {
        indicator: <CheckIcon />,
      });
      setMessage("");
      mutate();
      setSending(false);
      return;
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      if (errMsg === "PARENT_MESSAGE_DELETED") {
        toast(
          "This ticket's original Slack message has been deleted, so replies can no longer be posted to this thread.",
          {
            indicator: <TriangleAlertIcon />,
            variant: "danger",
          },
        );
      } else if (
        errMsg === "SLACK_NOT_LINKED" ||
        errMsg === "SLACK_TOKEN_INVALID"
      ) {
        toast(
          "Your Slack account isn't linked or the link has expired. Please re-link your Slack account to reply.",
          {
            indicator: <TriangleAlertIcon />,
            variant: "danger",
          },
        );
      } else {
        toast("An error occured when posting", {
          indicator: <TriangleAlertIcon />,
          variant: "danger",
        });
      }
      console.error(e);
      setSending(false);
      return;
    }
  }

  async function handleLinkSlack() {
    setLinkingSlack(true);
    await authClient.oauth2.link({
      providerId: "slack",
      callbackURL: `/programs/${programId}/ticket/${id}`,
    });
  }

  async function handleResolve() {
    try {
      if (!ticket) return;
      setResolving(true);
      await resolveTicket(ticket.id);
      toast("Resolved!", {
        indicator: <CheckIcon />,
      });
      mutate();
      setResolving(false);
      return;
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      if (errMsg === "PARENT_MESSAGE_DELETED") {
        toast(
          "This ticket's original Slack message has been deleted, so replies can no longer be posted to this thread.",
          {
            indicator: <TriangleAlertIcon />,
            variant: "danger",
          },
        );
      } else {
        toast("An error occured when resolving", {
          indicator: <TriangleAlertIcon />,
          variant: "danger",
        });
      }
      console.error(e);
      setResolving(false);
      return;
    }
  }

  async function handleReopen() {
    try {
      if (!ticket) return;
      setResolving(true);
      await reopenTicket(ticket.id);
      toast("Reopened!", {
        indicator: <CheckIcon />,
      });
      mutate();
      setResolving(false);
      return;
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      if (errMsg === "PARENT_MESSAGE_DELETED") {
        toast(
          "This ticket's original Slack message has been deleted, so replies can no longer be posted to this thread.",
          {
            indicator: <TriangleAlertIcon />,
            variant: "danger",
          },
        );
      } else {
        toast("An error occured when reopening", {
          indicator: <TriangleAlertIcon />,
          variant: "danger",
        });
      }
      console.error(e);
      setResolving(false);
      return;
    }
  }

  async function handleReindex() {
    try {
      if (!ticket) return;
      setReindexing(true);
      await reindexTicket(ticket.id, ticket.programId);
      toast("Reindexed!", {
        indicator: <CheckIcon />,
      });
      mutate();
      setReindexing(false);
      return;
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      if (errMsg === "SCRAPER_OFFLINE") {
        toast("The scraper could not be reached. It may be offline.", {
          indicator: <TriangleAlertIcon />,
          variant: "danger",
        });
      } else if (errMsg === "THREAD_NOT_FOUND") {
        toast(
          "This ticket's Slack thread could not be found. It may have been deleted.",
          {
            indicator: <TriangleAlertIcon />,
            variant: "danger",
          },
        );
      } else if (errMsg === "THREAD_IS_PINNED") {
        toast("This ticket's message is pinned, so it cannot be reindexed.", {
          indicator: <TriangleAlertIcon />,
          variant: "danger",
        });
      } else {
        toast("An error occured when reindexing", {
          indicator: <TriangleAlertIcon />,
          variant: "danger",
        });
      }
      console.error(e);
      setReindexing(false);
      return;
    }
  }

  async function handlePostINote() {
    try {
      if (!ticket) return;
      setSendingINote(true);
      await postINote(ticket.id, ticket.programId, inote);
      toast("Posted!", {
        indicator: <CheckIcon />,
      });
      setMessage("");
      mutate();
      setSendingINote(false);
      return;
    } catch (e) {
      toast("An error occured when posting", {
        indicator: <TriangleAlertIcon />,
        variant: "danger",
      });
      console.error(e);
      setSending(false);
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
        <>
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
                              {Math.round((ticket.responseTime / 60) * 100) /
                                100}{" "}
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
                              {Math.round(ticket.resolveTime * 100) / 100}{" "}
                              seconds
                            </>
                          )}
                          {ticket.resolveTime >= 60 && (
                            <>
                              {Math.round((ticket.resolveTime / 60) * 100) /
                                100}{" "}
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
              <div className="flex gap-2 items-center">
                {isAdmin && (
                  <Button
                    onClick={handleReindex}
                    isPending={reindexing}
                    variant="secondary"
                  >
                    {reindexing ? (
                      <>
                        <Spinner color="current" />
                      </>
                    ) : (
                      <>
                        <RefreshCwIcon />
                      </>
                    )}
                  </Button>
                )}
                <Link
                  href={`https://hackclub.slack.com/archives/${ticket.program.channelId}/p${Number(ticket.messageId) * 1000000}`}
                  target="_blank"
                >
                  <Button>
                    Open in Slack <SquareArrowOutUpRightIcon />
                  </Button>
                </Link>
              </div>
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
                const m = RESOLVE_MACROS.findLast((m) =>
                  r.message.includes(m.keyword),
                );
                if (m && r.slackUser.isBot) {
                  return (
                    <div
                      key={r.id}
                      className="flex flex-row gap-1 items-center p-4 bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-700 rounded-md"
                    >
                      <CheckIcon />
                      {m.friendlyMessage} on{" "}
                      {new Date(r.dateCreated).toLocaleString()}
                    </div>
                  );
                }
                if (
                  r.slackUser.isBot ||
                  process.env["NEXT_PUBLIC_RESOLVER_USER_ID"] === r.slackUser.id
                ) {
                  if (
                    (r.message.includes(ticket.program.resolveKeyword) &&
                      process.env["NEXT_PUBLIC_RESOLVER_USER_ID"] !==
                        r.resolver?.id) ||
                    (process.env["NEXT_PUBLIC_RESOLVER_USER_ID"] ===
                      r.slackUser.id &&
                      r.message.includes("Marked as resolved"))
                  ) {
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
                  if (
                    r.message.includes("reopened") &&
                    r.reopener &&
                    r.reopener.id !==
                      process.env["NEXT_PUBLIC_RESOLVER_USER_ID"]
                  ) {
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
              {isHelper &&
                signedInUser &&
                allowReply &&
                (slackAuthenticated ? (
                  <>
                    <div className="flex gap-4 w-full">
                      <Avatar size="sm">
                        <Avatar.Image
                          src={`https://cachet.dunkirk.sh/users/${signedInUser.id}/r`}
                          alt="Profile picture"
                        />
                        <Avatar.Fallback>
                          {signedInUser.username.substring(0, 1)}
                        </Avatar.Fallback>
                      </Avatar>
                      <div className="flex flex-col gap-2 w-full">
                        <TextArea
                          className="w-full h-32"
                          onChange={(e) => setMessage(e.target.value)}
                          value={message}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={handlePostMessage}
                            isPending={sending}
                            isDisabled={message.length === 0}
                          >
                            {sending ? (
                              <>
                                <Spinner color="current" /> Sending...
                              </>
                            ) : (
                              <>
                                <SendIcon />
                                Reply{" "}
                              </>
                            )}
                          </Button>
                          {ticket.program.allowResolver &&
                            ticket.status !== 2 && (
                              <Button
                                onClick={handleResolve}
                                isPending={resolving}
                                variant="secondary"
                              >
                                {resolving ? (
                                  <>
                                    <Spinner color="current" /> Resolving...
                                  </>
                                ) : (
                                  <>
                                    <CheckIcon />
                                    Resolve{" "}
                                  </>
                                )}
                              </Button>
                            )}
                          {ticket.program.allowResolver &&
                            ticket.status === 2 && (
                              <Button
                                onClick={handleReopen}
                                isPending={resolving}
                                variant="secondary"
                              >
                                {resolving ? (
                                  <>
                                    <Spinner color="current" /> Reopening...
                                  </>
                                ) : (
                                  <>
                                    <CircleIcon />
                                    Reopen{" "}
                                  </>
                                )}
                              </Button>
                            )}
                        </div>

                        <Switch isSelected={ctx} onChange={setCtx}>
                          <Switch.Content>
                            <Switch.Control>
                              <Switch.Thumb />
                            </Switch.Control>
                            Enable attribution in message
                          </Switch.Content>
                        </Switch>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-lg font-bold">Internal notes</p>
                      <p className="text-muted">Only helpers see these notes</p>
                      {inotes.map((n) => (
                        <Post
                          username={n.actor.username}
                          message={n.message}
                          slackId={n.actor.id}
                          key={n.id}
                          dateCreated={n.dateCreated}
                          programId={ticket.programId}
                        />
                      ))}
                      <div className="flex gap-4 w-full">
                        <Avatar size="sm">
                          <Avatar.Image
                            src={`https://cachet.dunkirk.sh/users/${signedInUser.id}/r`}
                            alt="Profile picture"
                          />
                          <Avatar.Fallback>
                            {signedInUser.username.substring(0, 1)}
                          </Avatar.Fallback>
                        </Avatar>
                        <div className="flex flex-col gap-2 w-full">
                          <TextArea
                            className="w-full h-32"
                            onChange={(e) => setINote(e.target.value)}
                            value={inote}
                          />
                          <Button
                            onClick={handlePostINote}
                            isPending={sendingINote}
                          >
                            {sendingINote ? (
                              <>
                                <Spinner color="current" /> Adding...
                              </>
                            ) : (
                              <>
                                <PlusIcon />
                                Add{" "}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <Alert status="warning">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title>
                        To reply, link your Slack account.
                      </Alert.Title>
                      <Alert.Description>
                        <Button
                          onClick={handleLinkSlack}
                          isPending={linkingSlack}
                        >
                          {linkingSlack ? (
                            <>
                              <Spinner color="current" /> Linking...
                            </>
                          ) : (
                            "Sign in with Slack"
                          )}
                        </Button>
                      </Alert.Description>
                    </Alert.Content>
                  </Alert>
                ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
