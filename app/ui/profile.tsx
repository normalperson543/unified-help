"use client";
import {
  Avatar,
  Button,
  Card,
  Chip,
  ComboBox,
  EmptyState,
  Input,
  Key,
  ListBox,
  Table,
  TableLayout,
  Tabs,
  Tooltip,
  Virtualizer,
} from "@heroui/react";
import {
  AnswerActivity,
  SlackUserDetailed,
  TicketWithAssigneesAndProgram,
} from "../lib/types";
import AnswerBarChart from "./answer-bar-chart";
import {
  CheckIcon,
  CircleIcon,
  CircleQuestionMarkIcon,
  ClockCheckIcon,
  ReplyIcon,
  SquareArrowOutUpRightIcon,
  CircleDashedIcon,
  UserCheckIcon,
  TicketIcon,
  MessageCircleIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Program } from "@/generated/prisma/browser";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileUI({
  profile,
  program,
  frt,
  resolveTime,
  activity,
  assignedAndResolvedCount,
  repliesCount,
}: {
  profile: SlackUserDetailed;
  program?: Program;
  frt?: number | null | undefined;
  resolveTime?: number | null | undefined;
  activity: AnswerActivity;
  assignedAndResolvedCount: number;
  repliesCount: number;
}) {
  const [selectedKey, setSelectedKey] = useState<Key | null>(
    program ? (program.id as string) : "all",
  );

  const router = useRouter();

  function handleSelectProgram(key: Key | null) {
    if (!key) return;
    setSelectedKey(key);
    console.log(key);
    if (key === "all") {
      router.push(`/profile/${profile.id}`);
      return;
    }
    router.push(`/profile/${profile.id}/program/${key}`);
  }

  return (
    <div className="flex flex-col gap-6 px-36 py-4 flex-1 min-h-0 overflow-y-auto">
      <div className="flex justify-between">
        <div className="flex gap-4 items-center">
          <Avatar size="lg">
            <Avatar.Image
              src={`https://cachet.dunkirk.sh/users/${profile.id}/r`}
              alt="Profile picture"
            />
            <Avatar.Fallback>
              {profile.username.substring(0, 1)}
            </Avatar.Fallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <p className="text-2xl font-bold">{profile.username}</p>
            <div className="flex flex-row gap-2 text-muted">
              <pre>{profile.id}</pre>
            </div>
          </div>
        </div>
        <Button>
          Open in Slack <SquareArrowOutUpRightIcon />
        </Button>
      </div>

      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row gap-1 items-center">
          <p>Showing data for</p>
          {program?.logo && (
            <Image
              src={program.logo}
              width={16}
              height={16}
              alt="Program logo"
            />
          )}
          <b>{program ? program.name : "all programs"}</b>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <p>Change to:</p>
          <ComboBox
            selectedKey={selectedKey}
            onSelectionChange={(key) => handleSelectProgram(key)}
          >
            <ComboBox.InputGroup>
              <Input placeholder="Search programs..." />
              <ComboBox.Trigger />
            </ComboBox.InputGroup>
            <ComboBox.Popover>
              <ListBox>
                <ListBox.Item id="all" textValue="all" key="all">
                  All programs
                </ListBox.Item>
                {profile.programs.map((p) => (
                  <ListBox.Item id={p.id} textValue={p.name} key={p.id}>
                    <div className="flex flex-row items-center gap-2">
                      {p.logo && (
                        <Image
                          src={p.logo}
                          alt="Program logo"
                          width={16}
                          height={16}
                          className="rounded-sm"
                        />
                      )}
                      {p.name}
                    </div>
                  </ListBox.Item>
                ))}
              </ListBox>
            </ComboBox.Popover>
          </ComboBox>
        </div>
      </div>
      <div className="flex flex-row gap-2">
        <Card className="basis-50 grow shrink relative">
          <div className="flex flex-col gap-1">
            <p className="text-muted uppercase">Total assigned tickets</p>
            <p className="font-bold text-3xl">
              {profile._count.assignedTickets}
            </p>
            <TicketIcon
              width={64}
              className="bottom-2 -right-2 absolute opacity-30"
            />
          </div>
        </Card>
        <Card className="basis-50 grow shrink relative">
          <div className="flex flex-col gap-1">
            <p className="text-muted uppercase">In progress tickets</p>
            <p className="font-bold text-3xl">
              {profile._count.assignedTickets - profile._count.resolvedTickets}
            </p>
            <CircleIcon
              width={64}
              className="bottom-2 -right-2 absolute opacity-30"
            />
          </div>
        </Card>
        <Card className="basis-50 grow shrink relative">
          <div className="flex flex-col gap-1">
            <p className="text-muted uppercase">Resolved tickets</p>
            <p className="font-bold text-3xl">{assignedAndResolvedCount}</p>
            <CheckIcon
              width={64}
              className="bottom-2 -right-2 absolute opacity-30"
            />
          </div>
        </Card>
        <Card className="basis-50 grow shrink relative">
          <div className="flex flex-col gap-1">
            <p className="text-muted uppercase">Resolved by user</p>
            <p className="font-bold text-3xl">
              {profile._count.resolvedTickets}
            </p>
            <UserCheckIcon
              width={64}
              className="bottom-2 -right-2 absolute opacity-30"
            />
          </div>
        </Card>
      </div>
      <div className="flex flex-row gap-2">
        <Card className="basis-50 grow shrink relative">
          <div className="flex flex-col gap-1">
            <p className="text-muted uppercase">Created tickets</p>
            <p className="font-bold text-3xl">
              {profile._count.createdTickets}
            </p>
            <CircleQuestionMarkIcon
              width={64}
              className="bottom-2 -right-2 absolute opacity-30"
            />
          </div>
        </Card>
        <Card className="basis-50 grow shrink relative">
          <div className="flex flex-col gap-1">
            <p className="text-muted uppercase">First response time</p>
            <p className="font-bold text-3xl">
              {frt ? Math.round((frt / 60) * 100) / 100 : "N/A"}
            </p>
            <p>minutes</p>
            <ReplyIcon
              width={64}
              className="bottom-2 -right-2 absolute opacity-30"
            />
          </div>
        </Card>
        <Card className="basis-50 grow shrink relative">
          <div className="flex flex-col gap-1">
            <p className="text-muted uppercase">Resolve time</p>
            <p className="font-bold text-3xl">
              {resolveTime ? Math.round((resolveTime / 60) * 100) / 100 : "N/A"}
            </p>
            <p>minutes</p>
            <ClockCheckIcon
              width={64}
              className="bottom-2 -right-2 absolute opacity-30"
            />
          </div>
        </Card>
        <Card className="basis-50 grow shrink relative">
          <div className="flex flex-col gap-1">
            <p className="text-muted uppercase">Total replies</p>
            <p className="font-bold text-3xl">{repliesCount}</p>
            <MessageCircleIcon
              width={64}
              className="bottom-2 -right-2 absolute opacity-30"
            />
          </div>
        </Card>
      </div>
      <div className="flex flex-row gap-2">
        {" "}
        {/* REVIEWER NOTE: The charts are all made with Claude Code */}
        <Card className="grow shrink basis-0">
          <div className="flex flex-col gap-2">
            <p className="text-lg font-bold">Tickets replied to per weekday</p>
            <p className="text-muted text-sm">
              Average tickets replied to on each day of the week{" "}
              {program ? "for this program" : "across all programs"} (UTC).
            </p>
            <AnswerBarChart
              data={activity.byWeekday}
              categoryKey="day"
              categoryLabel="Weekday"
            />
          </div>
        </Card>
        <Card className="grow shrink basis-0">
          <div className="flex flex-col gap-2">
            <p className="text-lg font-bold">Tickets replied to per hour</p>
            <p className="text-muted text-sm">
              Average tickets replied to during each hour of the day{" "}
              {program ? "for this program" : "across all programs"} (UTC).
            </p>
            <AnswerBarChart
              data={activity.byHour}
              categoryKey="hour"
              categoryLabel="Hour"
            />
          </div>
        </Card>
      </div>
      <Tabs variant="secondary">
        <Tabs.ListContainer>
          <Tabs.List aria-label="Options">
            <Tabs.Tab id="assigned">
              Assigned and resolved tickets
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="created">
              Created tickets
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
        <Tabs.Panel id="assigned">
          <TicketTable tickets={profile.assignedTickets} />
        </Tabs.Panel>
        <Tabs.Panel id="created">
          <TicketTable tickets={profile.createdTickets} />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
// REVIEWER NOTE: This was made with Claude Code
function TicketTable({
  tickets,
}: {
  tickets: TicketWithAssigneesAndProgram[];
}) {
  return (
    <Virtualizer
      layout={TableLayout}
      layoutOptions={{
        headingHeight: 42,
        rowHeight: 64,
      }}
    >
      <Table>
        <Table.ScrollContainer>
          <Table.Content
            aria-label="Assigned tickets"
            className="max-h-96 overflow-auto"
          >
            <Table.Header className="h-full w-full">
              <Table.Column isRowHeader>Program</Table.Column>
              <Table.Column>Date created</Table.Column>
              <Table.Column>Message</Table.Column>
              <Table.Column>Status</Table.Column>
              <Table.Column>Assignees</Table.Column>
              <Table.Column>First response</Table.Column>
              <Table.Column>Resolve time</Table.Column>
              <Table.Column>Open</Table.Column>
            </Table.Header>
            <Table.Body
              renderEmptyState={() => (
                <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                  <CircleQuestionMarkIcon className="text-muted" />
                  <span className="text-sm text-muted">No tickets found</span>
                </EmptyState>
              )}
            >
              {tickets.map((t) => (
                <Table.Row key={t.id}>
                  <Table.Cell>{t.program.name}</Table.Cell>
                  <Table.Cell>{t.dateCreated.toLocaleString()}</Table.Cell>
                  <Table.Cell>{t.message.substring(0, 30)}</Table.Cell>
                  <Table.Cell>
                    {t.status === 0 && (
                      <Chip color="warning" variant="primary">
                        <CircleDashedIcon width={16} /> Open
                      </Chip>
                    )}
                    {t.status === 1 && (
                      <Chip color="accent" variant="primary">
                        <CircleIcon width={16} /> Assigned
                      </Chip>
                    )}
                    {t.status === 2 && (
                      <Chip color="success" variant="primary">
                        <CheckIcon width={16} /> Resolved
                      </Chip>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex -space-x-2">
                      {t.assignees.map((user) => (
                        <Tooltip delay={0} key={user.id}>
                          <Tooltip.Trigger>
                            <Link
                              href={`/profile/${user.id}/program/${t.programId}`}
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
                  </Table.Cell>
                  <Table.Cell>
                    {t.firstResponseUser ? (
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/profile/${t.firstResponseUser?.id}/program/${t.program?.id}`}
                        >
                          <Tooltip delay={0}>
                            <Tooltip.Trigger>
                              <Avatar size="sm">
                                <Avatar.Image
                                  src={`https://cachet.dunkirk.sh/users/${t.firstResponseUser?.id}/r`}
                                  alt="Profile picture"
                                />
                                <Avatar.Fallback>
                                  {t.firstResponseUser?.username.substring(
                                    0,
                                    1,
                                  )}
                                </Avatar.Fallback>
                              </Avatar>{" "}
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                              <p>{t.firstResponseUser?.username}</p>
                            </Tooltip.Content>
                          </Tooltip>
                        </Link>{" "}
                        <p className="text-muted">
                          in{" "}
                          {t.responseTime
                            ? Math.round((t.responseTime / 60) * 100) / 100
                            : "N/A"}
                          m
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted">N/A</p>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {t.resolver ? (
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/profile/${t.resolver?.id}/program/${t.program?.id}`}
                        >
                          <Tooltip delay={0}>
                            <Tooltip.Trigger>
                              <Avatar size="sm">
                                <Avatar.Image
                                  src={`https://cachet.dunkirk.sh/users/${t.resolver?.id}/r`}
                                  alt="Profile picture"
                                />
                                <Avatar.Fallback>
                                  {t.resolver?.username.substring(0, 1)}
                                </Avatar.Fallback>
                              </Avatar>{" "}
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                              <p>{t.resolver?.username}</p>
                            </Tooltip.Content>
                          </Tooltip>
                        </Link>{" "}
                        <p className="text-muted">
                          in{" "}
                          {t.resolveTime
                            ? Math.round((t.resolveTime / 60) * 100) / 100
                            : "N/A"}
                          m
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted">N/A</p>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      href={`/programs/${t.program.id}/ticket/${t.id}`}
                      target="_blank"
                    >
                      <Button variant="tertiary">
                        <SquareArrowOutUpRightIcon />
                      </Button>
                    </Link>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </Virtualizer>
  );
}
