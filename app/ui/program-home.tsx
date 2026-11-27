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
import AnswerLineChart from "./answer-line-chart";
import useSWR from "swr";
import { fetcher } from "../lib/swr";
import { useParams } from "next/navigation";
import {
  Alert,
  Button,
  Card,
  DateField,
  DateRangePicker,
  DateValue,
  Label,
  RangeCalendar,
  Skeleton,
} from "@heroui/react";
import { ReactNode } from "react";
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
import Link from "next/link";
import UsersTable from "./users-table";
import NotFound from "./not-found";

// Claude changed this line while doing the pie chart
// Open, Assigned, Resolved — matching the ticket status chip colors.
const STATS_COLORS = [
  "var(--warning)",
  "var(--color-blue-500)",
  "var(--success)",
];

const StatsCustomPie = (props: PieSectorShapeProps) => (
  <Sector {...props} fill={STATS_COLORS[props.index % STATS_COLORS.length]} />
);
const StatNumber = ({
  loading,
  children,
}: {
  loading: boolean;
  children: ReactNode;
}) =>
  loading ? (
    <Skeleton className="h-9 w-20 rounded-md" />
  ) : (
    <p className="font-bold text-3xl">{children}</p>
  );

export default function ProgramUI() {
  const { programId } = useParams<{ programId: string }>();
  const [dateRange, setDateRange] = useState<{
    start: DateValue;
    end: DateValue;
  } | null>({
    start: today(getLocalTimeZone()).subtract({ days: 1 }),
    end: today(getLocalTimeZone()),
  });
  const startDate = dateRange?.start ?? null;
  const endDate = dateRange?.end ?? null;

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

  const { data: stats, error: statsError } = useSWR<ProgramStatistics>(
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
  const { data: hangTime, error: hangTimeError } = useSWR<HangTime>(
    programId &&
      `/api/programs/${programId}/hang-time/?oldest=${fStartDate}&newest=${fEndDate}`,
    fetcher,
  );
  const { data: resolveTime, error: resolveTimeError } = useSWR<HangTime>(
    programId &&
      `/api/programs/${programId}/resolve-time/?oldest=${fStartDate}&newest=${fEndDate}`,
    fetcher,
  );
  const { data: activity, error: activityError } = useSWR<AnswerActivity>(
    programId &&
      `/api/programs/${programId}/reply-activity/?oldest=${fStartDate}&newest=${fEndDate}`,
    fetcher,
  );

  // A card shows its skeleton only while its data is pending. On error it falls
  // back to the existing empty/N/A state instead of loading forever.
  const headerLoading = infoIsLoading;
  const statsLoading = !stats && !statsError;
  const hangTimeLoading = !hangTime && !hangTimeError;
  const resolveTimeLoading = !resolveTime && !resolveTimeError;
  const activityLoading = !activity && !activityError;

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

  if (infoError) {
    return <NotFound />;
  }

  return (
    <div className="flex flex-col p-4 gap-6 w-full min-h-full">
      <div className="flex items-center justify-between">
        {headerLoading && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-sm" />
              <Skeleton className="h-7 w-48 rounded-md" />
            </div>
            <Skeleton className="h-4 w-72 rounded-md" />
          </div>
        )}
        {info && !infoIsLoading && (
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
        )}
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
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            aria-label="Date range"
          >
            <Label>Date range</Label>
            <DateField.Group variant="secondary">
              <DateField.InputContainer>
                <DateField.Input slot="start">
                  {(segment) => <DateField.Segment segment={segment} />}
                </DateField.Input>
                <DateRangePicker.RangeSeparator />
                <DateField.Input slot="end">
                  {(segment) => <DateField.Segment segment={segment} />}
                </DateField.Input>
              </DateField.InputContainer>
              <DateField.Suffix>
                <DateRangePicker.Trigger>
                  <DateRangePicker.TriggerIndicator />
                </DateRangePicker.Trigger>
              </DateField.Suffix>
            </DateField.Group>
            <DateRangePicker.Popover>
              <RangeCalendar aria-label="Date range">
                <RangeCalendar.Header>
                  <RangeCalendar.Heading />
                  <div className="flex items-center gap-1">
                    <RangeCalendar.NavButton slot="previous" />
                    <RangeCalendar.NavButton slot="next" />
                  </div>
                </RangeCalendar.Header>
                <RangeCalendar.Grid>
                  <RangeCalendar.GridHeader>
                    {(day) => (
                      <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>
                    )}
                  </RangeCalendar.GridHeader>
                  <RangeCalendar.GridBody>
                    {(date) => <RangeCalendar.Cell date={date} />}
                  </RangeCalendar.GridBody>
                </RangeCalendar.Grid>
              </RangeCalendar>
            </DateRangePicker.Popover>
          </DateRangePicker>
        </div>
      </div>
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
      {info && !infoIsLoading && !info.claimed && (
        <Alert status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>
              This program has not been claimed by the program&apos;s organizer
              yet
            </Alert.Title>
            <Alert.Description>
              If you&apos;re an organizer, get access to replying and resolving
              tickets, and manage your program helpers and details on Unified
              Help by filling out the{" "}
              <Link
                href="https://forms.fillout.com/t/k1NNiLbTasus"
                target="_blank"
                className="underline"
              >
                Unified Help setup form
              </Link>
              .
            </Alert.Description>
          </Alert.Content>
        </Alert>
      )}
      <>
        <div className="flex flex-row gap-2">
          <Card className="basis-50 grow shrink relative">
            <div className="flex flex-col gap-1">
              <p className="text-muted uppercase">Open tickets</p>
              <StatNumber loading={statsLoading}>{stats?.open ?? 0}</StatNumber>
              <CircleDashedIcon
                width={64}
                className="bottom-2 -right-2 absolute opacity-30"
              />
            </div>
          </Card>
          <Card className="basis-50 grow shrink relative">
            <div className="flex flex-col gap-1">
              <p className="text-muted uppercase">Assigned tickets</p>
              <StatNumber loading={statsLoading}>
                {stats?.assigned ?? 0}
              </StatNumber>
              <CircleIcon
                width={64}
                className="bottom-2 -right-2 absolute opacity-30"
              />
            </div>
          </Card>
          <Card className="basis-50 grow shrink relative">
            <div className="flex flex-col gap-1">
              <p className="text-muted uppercase">Resolved tickets</p>
              <StatNumber loading={statsLoading}>
                {stats?.resolved ?? 0}
              </StatNumber>
              <CheckIcon
                width={64}
                className="bottom-2 -right-2 absolute opacity-30"
              />
            </div>
          </Card>
          <Card className="basis-50 grow shrink relative">
            <div className="flex flex-col gap-1">
              <p className="text-muted uppercase">Assigned to you</p>
              <StatNumber loading={statsLoading}>
                {stats?.assignedToMe ?? 0}
              </StatNumber>
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
              <StatNumber loading={statsLoading}>
                {stats?.total ?? 0}
              </StatNumber>
              <TicketIcon
                width={64}
                className="bottom-2 -right-2 absolute opacity-30"
              />
            </div>
          </Card>
          <Card className="basis-50 grow shrink relative">
            <div className="flex flex-col gap-1">
              <p className="text-muted uppercase">Assign time</p>
              <StatNumber loading={hangTimeLoading}>
                {hangTimeError
                  ? "N/A"
                  : hangTime?.median
                    ? Math.round((hangTime.median / 60) * 100) / 100
                    : 0}
              </StatNumber>
              <p>minutes</p>
              {hangTimeLoading ? (
                <Skeleton className="h-4 w-32 rounded-md" />
              ) : (
                <p className="text-muted text-sm">
                  Average:{" "}
                  {hangTime?.average
                    ? Math.round((hangTime.average / 60) * 100) / 100
                    : 0}{" "}
                  min
                </p>
              )}
              <ClockIcon
                width={64}
                className="bottom-2 -right-2 absolute opacity-30"
              />
            </div>
          </Card>
          <Card className="basis-50 grow shrink relative">
            <div className="flex flex-col gap-1">
              <p className="text-muted uppercase">Resolve time</p>
              <StatNumber loading={resolveTimeLoading}>
                {resolveTimeError
                  ? "N/A"
                  : resolveTime?.median
                    ? Math.round((resolveTime.median / 60) * 100) / 100
                    : 0}
              </StatNumber>
              <p>minutes</p>
              {resolveTimeLoading ? (
                <Skeleton className="h-4 w-32 rounded-md" />
              ) : (
                <p className="text-muted text-sm">
                  Average:{" "}
                  {resolveTime?.average
                    ? Math.round((resolveTime.average / 60) * 100) / 100
                    : 0}{" "}
                  min
                </p>
              )}
              <ClockCheckIcon
                width={64}
                className="bottom-2 -right-2 absolute opacity-30"
              />
            </div>
          </Card>
        </div>
      </>
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
            {statsLoading ? (
              <div className="flex justify-center">
                <Skeleton
                  className="w-[65%] rounded-full"
                  style={{ aspectRatio: 1 }}
                />
              </div>
            ) : (
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
                  outerRadius="65%"
                  label={({ percent }) =>
                    percent ? `${(percent * 100).toFixed(0)}%` : ""
                  }
                  isAnimationActive={false}
                  shape={StatsCustomPie}
                />
              </PieChart>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 min-h-5">
              {statsLoading
                ? [0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-4 w-24 rounded-md" />
                  ))
                : statsPieData?.map((slice, i) => (
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
            {activityLoading ? (
              <Skeleton className="w-full h-65 rounded-md" />
            ) : (
              <AnswerBarChart
                data={activity?.byWeekday ?? []}
                categoryKey="day"
                categoryLabel="Weekday"
              />
            )}
          </div>
        </Card>
        <Card className="grow shrink basis-0">
          <div className="flex flex-col gap-2">
            <p className="text-lg font-bold">Tickets replied to per hour</p>
            <p className="text-muted text-sm">
              Average tickets replied to during each hour of the day across the
              whole program, in the selected date range (UTC).
            </p>
            {activityLoading ? (
              <Skeleton className="w-full h-65 rounded-md" />
            ) : (
              <AnswerBarChart
                data={activity?.byHour ?? []}
                categoryKey="hour"
                categoryLabel="Hour"
              />
            )}
          </div>
        </Card>
      </div>
      <Card>
        <div className="flex flex-col gap-2">
          <p className="text-lg font-bold">Ticket replies over time</p>
          <p className="text-muted text-sm">
            Daily replies in the selected date range (UTC).
          </p>
          {activityLoading ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-end gap-2">
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
              <Skeleton className="w-full h-70 rounded-md" />
            </div>
          ) : (
            <AnswerLineChart data={activity?.byDate ?? []} />
          )}
        </div>
      </Card>
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
        {lbIsLoading && (
          <Card className="grow shrink">
            <div className="flex flex-col gap-4">
              <p className="text-lg font-bold">Leaderboard</p>
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          </Card>
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
