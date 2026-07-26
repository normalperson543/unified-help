"use client";

import useSWR from "swr";
import { fetcher } from "../lib/swr";
import { useParams } from "next/navigation";
import { ProgramStatistics } from "../lib/types";
import { Chip, Spinner } from "@heroui/react";
import { CircleDashedIcon, CircleIcon, UserCheckIcon } from "lucide-react";

export default function ProgramStats() {
  const { programId } = useParams();
  const {
    data: stats,
    error: statsError,
    isLoading: statsIsLoading,
  } = useSWR<ProgramStatistics>(
    programId && `/api/programs/${programId}/ticket-count`,
    fetcher,
  );

  if (!programId) return;
  if (statsError && !statsIsLoading) return;

  return (
    <div className="flex flex-row items-center gap-2">
      <Chip>
        <CircleDashedIcon width={16} />
        {stats ? stats.open : <Spinner size="sm" />}
      </Chip>
      <Chip>
        <CircleIcon width={16} />
        {stats ? stats.assigned : <Spinner size="sm" />}
      </Chip>
      <Chip variant="primary" color="accent">
        <UserCheckIcon width={16} />
        {stats ? stats.assignedToMe : <Spinner size="sm" />}
      </Chip>
    </div>
  );
}
