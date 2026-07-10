"use client";

import { Pie, PieChart, PieSectorShapeProps, Sector, Tooltip } from "recharts";
import { HangTime, Leaderboard, ProgramStatistics, ProgramWithAssignees } from "../lib/types";
import useSWR from "swr";
import { fetcher } from "../lib/swr";
import { useParams } from "next/navigation";
import { Avatar, Card } from "@heroui/react";
import {
  CheckIcon,
  CircleDashedIcon,
  CircleIcon,
  ClockIcon,
  TicketIcon,
  UserCheckIcon,
} from "lucide-react";
import { useState } from "react";

const STATS_COLORS = ["#f00", "#00f", "#0f0"];

const StatsCustomPie = (props: PieSectorShapeProps) => (
  <Sector {...props} fill={STATS_COLORS[props.index % STATS_COLORS.length]} />
);

export default function ProgramUI() {
  const { programId } = useParams();
  const [lastDays, setLastDays] = useState(7);

  const {
    data: info,
    error: infoError,
    isLoading: infoIsLoading,
  } = useSWR<ProgramWithAssignees>(
    programId && `/api/programs/${programId}/info`,
    fetcher,
  );

  const {
    data: stats,
    error: statsError,
    isLoading: statsIsLoading,
  } = useSWR<ProgramStatistics>(
    programId && `/api/programs/${programId}/ticket-count/days/7`,
    fetcher,
  );
  const {
    data: lb,
    error: lbError,
    isLoading: lbIsLoading,
  } = useSWR<Leaderboard>(
    programId && `/api/programs/${programId}/leaderboard/days/7`,
    fetcher,
  );

  const {
    data: hangTime,
    error: hangTimeError,
    isLoading: hangTimeIsLoading,
  } = useSWR<HangTime>(
    programId && `/api/programs/${programId}/hang-time/days/7`,
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
      <p className="text-xl font-bold">{info?.name}</p>
      <div className="flex flex-row gap-2">
        <Card className="basis-50 grow shrink relative">
          <div className="flex flex-col gap-1">
            <p className="text-muted uppercase">Open tickets</p>
            <p className="font-bold text-3xl">{stats && stats.open}</p>
            <CircleDashedIcon
              width={64}
              className="bottom-2 -right-2 absolute opacity-30"
            />
          </div>
        </Card>
        <Card className="basis-50 grow shrink relative">
          <div className="flex flex-col gap-1">
            <p className="text-muted uppercase">Assigned tickets</p>
            <p className="font-bold text-3xl">{stats && stats.assigned}</p>
            <CircleIcon
              width={64}
              className="bottom-2 -right-2 absolute opacity-30"
            />
          </div>
        </Card>
        <Card className="basis-50 grow shrink relative">
          <div className="flex flex-col gap-1">
            <p className="text-muted uppercase">Resolved tickets</p>
            <p className="font-bold text-3xl">{stats && stats.resolved}</p>
            <CheckIcon
              width={64}
              className="bottom-2 -right-2 absolute opacity-30"
            />
          </div>
        </Card>
        <Card className="basis-50 grow shrink relative">
          <div className="flex flex-col gap-1">
            <p className="text-muted uppercase">Assigned to you</p>
            <p className="font-bold text-3xl">{stats && stats.assignedToMe}</p>
            <UserCheckIcon
              width={64}
              className="bottom-2 -right-2 absolute opacity-30"
            />
          </div>
        </Card>
        <Card className="basis-50 grow shrink relative">
          <div className="flex flex-col gap-1">
            <p className="text-muted uppercase">Total tickets</p>
            <p className="font-bold text-3xl">{stats && stats.total}</p>
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
              {hangTime && Math.round(hangTime.time * 100) / 100}
            </p>
            <p>minutes</p>
            <ClockIcon
              width={64}
              className="bottom-2 -right-2 absolute opacity-30"
            />
          </div>
        </Card>
      </div>
      <div className="flex flex-row gap-2">
        <Card className="grow shrink">
          <PieChart
            style={{
              width: "100%",
              height: "100%",
              maxWidth: "350px",
              maxHeight: "350px",
              aspectRatio: 1,
            }}
            responsive
          >
            <Pie
              data={statsPieData}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={72}
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
                      <Avatar size="sm">
                        <Avatar.Image
                          src={`https://cachet.dunkirk.sh/users/${l.id}/r`}
                          alt="Profile picture"
                        />
                        <Avatar.Fallback>
                          {l.username.substring(0, 1)}
                        </Avatar.Fallback>
                      </Avatar>
                      <b>{l.username}</b>
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
