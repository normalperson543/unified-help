"use client";

import { Pie, PieChart, PieSectorShapeProps, Sector, Tooltip } from "recharts";
import {
  HangTime,
  Leaderboard,
  ProgramStatistics,
  ProgramWithAssignees,
  RouteError,
} from "../lib/types";
import useSWR from "swr";
import { fetcher } from "../lib/swr";
import { notFound, useParams } from "next/navigation";
import {
  Avatar,
  Button,
  Card,
  DateField,
  DateValue,
  Label,
  NumberField,
} from "@heroui/react";
import {
  CheckIcon,
  CircleDashedIcon,
  CircleIcon,
  ClockCheckIcon,
  ClockIcon,
  SquareArrowOutUpRightIcon,
  TicketIcon,
  UserCheckIcon,
} from "lucide-react";
import { useState } from "react";
import NotLoggedIn from "./not-logged-in";
import { getLocalTimeZone, today } from "@internationalized/date";
import Image from "next/image";
import Link from "next/link";

const STATS_COLORS = ["#f00", "#00f", "#0f0"];

const StatsCustomPie = (props: PieSectorShapeProps) => (
  <Sector {...props} fill={STATS_COLORS[props.index % STATS_COLORS.length]} />
);

export default function ProgramUI() {
  const { programId } = useParams();
  const [lastDays, setLastDays] = useState(7);
  const [startDate, setStartDate] = useState<DateValue | null>(
    today(getLocalTimeZone()).subtract({ days: 1 }),
  );
  const [endDate, setEndDate] = useState<DateValue | null>(
    today(getLocalTimeZone()),
  );

  // Start at midnight of the selected start day, end at the last millisecond of
  // the selected end day so the full end day is included (API filters with lte).
  const fStartDate = startDate?.toDate(getLocalTimeZone()).getTime();
  const fEndDate = endDate
    ? endDate.add({ days: 1 }).toDate(getLocalTimeZone()).getTime() - 1
    : undefined;

  const {
    data: info,
    error: infoError,
    isLoading: infoIsLoading,
  } = useSWR<ProgramWithAssignees, RouteError>(
    programId && `/api/programs/${programId}/info`,
    fetcher,
  );

  const {
    data: stats,
    error: statsError,
    isLoading: statsIsLoading,
  } = useSWR<ProgramStatistics>(
    programId &&
      `/api/programs/${programId}/ticket-count/?oldest=${fStartDate}&newest=${fEndDate}`,
    fetcher,
  );
  const {
    data: lb,
    error: lbError,
    isLoading: lbIsLoading,
  } = useSWR<Leaderboard>(
    programId && `/api/programs/${programId}/leaderboard/?oldest=${fStartDate}&newest=${fEndDate}`,
    fetcher,
  );
  const {
    data: hangTime,
    error: hangTimeError,
    isLoading: hangTimeIsLoading,
  } = useSWR<HangTime>(
    programId &&
      `/api/programs/${programId}/hang-time/?oldest=${fStartDate}&newest=${fEndDate}`,
    fetcher,
    );
  const {
    data: resolveTime,
    error: resolveTimeError,
    isLoading: resolveTimeIsLoading,
  } = useSWR<HangTime>(
    programId &&
      `/api/programs/${programId}/resolve-time/?oldest=${fStartDate}&newest=${fEndDate}`,
    fetcher,
  );

  let statsPieData;
  if (stats) {
    statsPieData = [
      {
        name: "Open tickets",
        value: stats.open,
      },
      {
        name: "Assigned tickets",
        value: stats.assigned,
      },
      {
        name: "Resolved tickets",
        value: stats.resolved,
      },
    ];
  }

  return (
    <div className="flex flex-col p-4 gap-6 w-full h-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            {info?.logo && (
              <Image
                src={info.logo}
                alt="Program logo"
                width={32}
                height={32}
                className="rounded-sm"
              />
            )}
            <p className="text-xl font-bold">{info?.name}</p>
          </div>
          <div className="flex gap-1 text-muted">
            <pre>{info?.channelId}</pre> - {info?.assignedUsers.length} helper
            {info?.assignedUsers.length != 1 && "s"} -{" "}
            {info?.usersOrganizing.length} organizer
            {info?.usersOrganizing.length != 1 && "s"}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {info?.channelId && (
            <a
              href={`https://hackclub.enterprise.slack.com/archives/${info.channelId}`}
              target="_blank"
            >
              <Button>
                Open in Slack <SquareArrowOutUpRightIcon />
              </Button>
            </a>
          )}
          <DateField name="startDate" value={startDate} onChange={setStartDate}>
            <Label>Start date</Label>
            <DateField.Group variant="secondary">
              <DateField.Input>
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
            </DateField.Group>
          </DateField>
          <DateField name="endDate" value={endDate} onChange={setEndDate}>
            <Label>End date</Label>
            <DateField.Group variant="secondary">
              <DateField.Input>
                {(segment) => <DateField.Segment segment={segment} />}
              </DateField.Input>
            </DateField.Group>
          </DateField>
        </div>
      </div>
      <div className="flex flex-row gap-2">
        <Card className="basis-50 grow shrink relative">
          <div className="flex flex-col gap-1">
            <p className="text-muted uppercase">Open tickets</p>
            <p className="font-bold text-3xl">{stats ? stats.open : 0}</p>
            <CircleDashedIcon
              width={64}
              className="bottom-2 -right-2 absolute opacity-30"
            />
          </div>
        </Card>
        <Card className="basis-50 grow shrink relative">
          <div className="flex flex-col gap-1">
            <p className="text-muted uppercase">Assigned tickets</p>
            <p className="font-bold text-3xl">{stats ? stats.assigned : 0}</p>
            <CircleIcon
              width={64}
              className="bottom-2 -right-2 absolute opacity-30"
            />
          </div>
        </Card>
        <Card className="basis-50 grow shrink relative">
          <div className="flex flex-col gap-1">
            <p className="text-muted uppercase">Resolved tickets</p>
            <p className="font-bold text-3xl">{stats ? stats.resolved : 0}</p>
            <CheckIcon
              width={64}
              className="bottom-2 -right-2 absolute opacity-30"
            />
          </div>
        </Card>
        <Card className="basis-50 grow shrink relative">
          <div className="flex flex-col gap-1">
            <p className="text-muted uppercase">Assigned to you</p>
            <p className="font-bold text-3xl">
              {stats ? stats.assignedToMe : 0}
            </p>
            <UserCheckIcon
              width={64}
              className="bottom-2 -right-2 absolute opacity-30"
            />
          </div>
        </Card>
        <Card className="basis-50 grow shrink relative">
          <div className="flex flex-col gap-1">
            <p className="text-muted uppercase">Total tickets</p>
            <p className="font-bold text-3xl">{stats ? stats.total : 0}</p>
            <TicketIcon
              width={64}
              className="bottom-2 -right-2 absolute opacity-30"
            />
          </div>
        </Card>
        <Card className="basis-50 grow shrink relative">
          <div className="flex flex-col gap-1">
            <p className="text-muted uppercase">Hang time</p>
            <p className="font-bold text-3xl">
              {hangTime ? Math.round((hangTime.time / 60) * 100) / 100 : 0}
            </p>
            <p>minutes</p>
            <ClockIcon
              width={64}
              className="bottom-2 -right-2 absolute opacity-30"
            />
          </div>
        </Card>
        <Card className="basis-50 grow shrink relative">
          <div className="flex flex-col gap-1">
            <p className="text-muted uppercase">Resolve time</p>
            <p className="font-bold text-3xl">
              {resolveTime ? Math.round((resolveTime.time / 60) * 100) / 100 : 0}
            </p>
            <p>minutes</p>
            <ClockCheckIcon
              width={64}
              className="bottom-2 -right-2 absolute opacity-30"
            />
          </div>
        </Card>
      </div>
      <div className="flex flex-row gap-2">
        <Card className="grow shrink max-w-84">
          <PieChart
            style={{
              width: "100%",
              aspectRatio: 1,
            }}
            responsive
          >
            <Pie
              data={statsPieData}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius="80%"
              label={({ percent }) =>
                percent && `${(percent * 100).toFixed(0)}%`
              }
              isAnimationActive={false}
              shape={StatsCustomPie}
            />
            <Tooltip />
          </PieChart>
        </Card>
        <Card className="grow shrink">
          <div className="flex flex-col gap-2">
            <p className="text-lg font-bold">Leaderboard</p>
            {lb &&
              lb
                .sort(
                  (a, b) => b._count.assignedTickets - a._count.assignedTickets,
                )
                .filter((l) => l._count.assignedTickets > 0)
                .map((l) => (
                  <div
                    className="flex flex-row justify-between items-center gap-4"
                    key={l.id}
                  >
                    <div className="flex gap-2 items-center">
                      <Link href={`/profile/${l.id}/program/${programId}`} target="_blank">
                        <Avatar size="sm">
                          <Avatar.Image
                            src={`https://cachet.dunkirk.sh/users/${l.id}/r`}
                            alt="Profile picture"
                          />
                          <Avatar.Fallback>
                            {l.username.substring(0, 1)}
                          </Avatar.Fallback>
                        </Avatar>
                      </Link>
                      <Link href={`/profile/${l.id}/program/${programId}`} target="_blank">
                        <b>{l.username}</b>
                      </Link>
                    </div>
                    <div className="flex gap-2 items-center font-bold">
                      <CheckIcon width={16} />
                      {l._count.assignedTickets}
                    </div>
                  </div>
                ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
