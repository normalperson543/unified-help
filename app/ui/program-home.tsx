"use client";

import { Pie, PieChart, PieSectorShapeProps, Sector } from "recharts";
import {
  AnswerActivity,
  HangTime,
  ProgramStatistics,
  ProgramWithAssignees,
  RouteError,
  SlackUserWithStats,
} from "../lib/types";
import AnswerBarChart from "./answer-bar-chart";
import useSWR from "swr";
import { fetcher } from "../lib/swr";
import { useParams } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  DateField,
  DateValue,
  Label,
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
import { getLocalTimeZone, today } from "@internationalized/date";
import Image from "next/image";
import UsersTable from "./users-table";

// Claude changed this line while doing the pie chart
// Open, Assigned, Resolved — matching the ticket status chip colors.
const STATS_COLORS = ["var(--warning)", "var(--accent)", "var(--success)"];

const StatsCustomPie = (props: PieSectorShapeProps) => (
  <Sector {...props} fill={STATS_COLORS[props.index % STATS_COLORS.length]} />
);

export default function ProgramUI() {
  const { programId } = useParams<{ programId: string }>();
  const [startDate, setStartDate] = useState<DateValue | null>(
    today(getLocalTimeZone()).subtract({ days: 1 }),
  );
  const [endDate, setEndDate] = useState<DateValue | null>(
    today(getLocalTimeZone()),
  );

  // Claude helped fix a bug in the following fStartDate and fEndDate lines
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
  } = useSWR<SlackUserWithStats[]>(
    programId &&
      `/api/programs/${programId}/leaderboard/?oldest=${fStartDate}&newest=${fEndDate}`,
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
  const { data: activity } = useSWR<AnswerActivity>(
    programId &&
      `/api/programs/${programId}/reply-activity/?oldest=${fStartDate}&newest=${fEndDate}`,
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
    <div className="flex flex-col p-4 gap-6 w-full min-h-full">
      {info && !infoIsLoading && (
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
            <DateField
              name="startDate"
              value={startDate}
              onChange={setStartDate}
            >
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
      )}
      {infoError && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>
              There was a problem fetching this program&apos;s information
            </Alert.Title>
            <Alert.Description>
              Please try again by refreshing.
            </Alert.Description>
          </Alert.Content>
        </Alert>
      )}
      {stats && !statsIsLoading && (
        <>
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
                <p className="font-bold text-3xl">
                  {stats ? stats.assigned : 0}
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
                <p className="font-bold text-3xl">
                  {stats ? stats.resolved : 0}
                </p>
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
          </div>
          <div className="flex flex-row gap-2">
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
                {(hangTimeError || hangTimeIsLoading) && (
                  <p className="font-bold text-3xl">N/A</p>
                )}
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
                  {resolveTime
                    ? Math.round((resolveTime.time / 60) * 100) / 100
                    : 0}
                </p>
                {(resolveTimeError || resolveTimeIsLoading) && (
                  <p className="font-bold text-3xl">N/A</p>
                )}
                <p>minutes</p>
                <ClockCheckIcon
                  width={64}
                  className="bottom-2 -right-2 absolute opacity-30"
                />
              </div>
            </Card>
          </div>
        </>
      )}
      {statsError && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>
              There was a problem fetching this program&apos;s stats
            </Alert.Title>
            <Alert.Description>
              Please try again by refreshing.
            </Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      <div className="flex flex-row gap-2">
        <Card className="grow shrink max-w-84">
          {/* I asked Claude to make the pie chart better */}
          <div className="flex flex-col gap-2">
            <p className="text-lg font-bold">Ticket status breakdown</p>
            <p className="text-muted text-sm">
              Distribution of tickets in the selected date range.
            </p>
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
                  percent ? `${(percent * 100).toFixed(0)}%` : ""
                }
                isAnimationActive={false}
                shape={StatsCustomPie}
              />
            </PieChart>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {statsPieData?.map((slice, i) => (
                <div
                  key={slice.name}
                  className="flex items-center gap-2 text-sm"
                >
                  <span
                    className="size-2.5 rounded-full"
                    style={{
                      background: STATS_COLORS[i % STATS_COLORS.length],
                    }}
                  />
                  <span className="text-muted">{slice.name}</span>
                  <span className="font-bold">{slice.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card className="grow shrink basis-0">
          <div className="flex flex-col gap-2">
            <p className="text-lg font-bold">Tickets replied to per weekday</p>
            <p className="text-muted text-sm">
              Average tickets replied to on each day of the week across the
              whole program, in the selected date range (UTC).
            </p>
            <AnswerBarChart
              data={activity?.byWeekday ?? []}
              categoryKey="day"
              categoryLabel="Weekday"
            />
          </div>
        </Card>
        <Card className="grow shrink basis-0">
          <div className="flex flex-col gap-2">
            <p className="text-lg font-bold">Tickets replied to per hour</p>
            <p className="text-muted text-sm">
              Average tickets replied to during each hour of the day across the
              whole program, in the selected date range (UTC).
            </p>
            <AnswerBarChart
              data={activity?.byHour ?? []}
              categoryKey="hour"
              categoryLabel="Hour"
            />
          </div>
        </Card>
      </div>
      <div className="flex flex-row gap-2">
        {lbError && (
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>
                There was a problem fetching this program&apos;s leaderboard
              </Alert.Title>
              <Alert.Description>
                Please try again by refreshing.
              </Alert.Description>
            </Alert.Content>
          </Alert>
        )}
        {lb && !lbIsLoading && lb.length > 0 && (
          <Card className="grow shrink">
            <div className="flex flex-col gap-4">
              <p className="text-lg font-bold">Leaderboard</p>

              <UsersTable
                users={lb.sort(
                  (a, b) => b._count.assignedTickets - a._count.assignedTickets,
                )}
                programId={programId}
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
