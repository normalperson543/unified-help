"use client";
import {
  Avatar,
  Button,
  Card,
  Chip,
  ComboBox,
  Input,
  Key,
  ListBox,
  Tabs,
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
  UserCheckIcon,
  TicketIcon,
  MessageCircleIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import { Program } from "@/generated/prisma/browser";
import { useState } from "react";
import { useRouter } from "next/navigation";
import TicketTable from "./ticket-table";
import Link from "next/link";

export default function ProfileUI({
  profile,
  program,
  frt,
  frtMedian,
  resolveTime,
  resolveTimeMedian,
  activity,
  assignedAndResolvedCount,
  repliesCount,
  repliedTickets,
  programs,
}: {
  profile: SlackUserDetailed;
  program?: Program;
  frt?: number | null | undefined;
  frtMedian?: number | null | undefined;
  resolveTime?: number | null | undefined;
  resolveTimeMedian?: number | null | undefined;
  activity: AnswerActivity;
  assignedAndResolvedCount: number;
  repliesCount: number;
  repliedTickets: TicketWithAssigneesAndProgram[];
  programs: Program[];
}) {
  const [selectedKey, setSelectedKey] = useState<Key | null>(
    program ? (program.id as string) : "all",
  );

  const router = useRouter();

  function handleSelectProgram(key: Key | null) {
    if (!key) return;
    setSelectedKey(key);
    if (key === "all") {
      router.push(`/profile/${profile.id}`);
      return;
    }
    router.push(`/profile/${profile.id}/program/${key}`);
  }

  return (
    <div className="flex flex-col gap-6 px-36 py-4 flex-1 min-h-0 overflow-y-auto">
      <div className="flex justify-between top-0">
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
            <div className="flex gap-2 items-center">
              <p className="text-2xl font-bold">{profile.username}</p>
              {profile.isBot && <Chip>Bot</Chip>}
            </div>

            <div className="flex flex-row gap-1 text-muted items-center">
              <pre>{profile.id}</pre>
              <p> - </p>
              {profile.programs.length > 0 ? (
                <>
                  <p>Helping in</p>
                  <p>
                    {profile.programs.map(
                      (p, i) =>
                        `${p.name}${i !== profile.programs.length - 1 ? ", " : ""}`,
                    )}
                  </p>
                </>
              ) : (
                <p>No programs helping</p>
              )}
              <p> - </p>
              {profile._count.users > 0 ? (
                <div className="flex gap-1 items-center">
                  <CheckIcon width={16} /> Registered on Unified Help
                </div>
              ) : (
                <div className="flex gap-1 items-center">
                  <XIcon width={16} /> Unregistered on Unified Help
                </div>
              )}
            </div>
          </div>
        </div>
        <Link
          href={`https://hackclub.enterprise.slack.com/team/${profile.id}`}
          target="_blank"
        >
          <Button>
            Open in Slack <SquareArrowOutUpRightIcon />
          </Button>
        </Link>
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
              className="rounded-sm"
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
                <ListBox.Item id="all" textValue="All programs" key="all">
                  All programs
                </ListBox.Item>
                {programs.map((p) => (
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
              {profile._count.assignedTickets - assignedAndResolvedCount}
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
            <p className="text-muted uppercase">Median first response time</p>
            <p className="font-bold text-3xl">
              {frtMedian ? Math.round((frtMedian / 60) * 100) / 100 : "N/A"}
            </p>
            <p>minutes</p>
            <p className="text-muted text-sm">
              Average: {frt ? Math.round((frt / 60) * 100) / 100 : "N/A"} min
            </p>
            <ReplyIcon
              width={64}
              className="bottom-2 -right-2 absolute opacity-30"
            />
          </div>
        </Card>
        <Card className="basis-50 grow shrink relative">
          <div className="flex flex-col gap-1">
            <p className="text-muted uppercase">Median resolve time</p>
            <p className="font-bold text-3xl">
              {resolveTimeMedian
                ? Math.round((resolveTimeMedian / 60) * 100) / 100
                : "N/A"}
            </p>
            <p>minutes</p>
            <p className="text-muted text-sm">
              Average:{" "}
              {resolveTime ? Math.round((resolveTime / 60) * 100) / 100 : "N/A"}{" "}
              min
            </p>
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
            <Tabs.Tab id="replied">
              Replied tickets
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
        <Tabs.Panel id="replied">
          <TicketTable tickets={repliedTickets} />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
