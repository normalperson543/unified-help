"use client";

import { Button, Link, Tabs } from "@heroui/react";
import { fetcher } from "../lib/swr";
import useSWR from "swr";
import { Program } from "@/generated/prisma/browser";
import { ProgramWithAssignees } from "../lib/types";
import { useParams } from "next/navigation";
import { HomeIcon, SettingsIcon } from "lucide-react";
import { authClient } from "../lib/auth-client";

export default function ProgramTabs() {
  const { programId } = useParams();
  const { data: session, isPending, error, refetch } = authClient.useSession();
  const {
    data: stats,
    error: statsError,
    isLoading: statsIsLoading,
  } = useSWR<ProgramWithAssignees>(
    programId && `/api/programs/${programId}/info`,
    fetcher,
  );
  const canEdit =
    stats?.usersOrganizing.find((u) => u.id === session?.user.id) !== undefined;
  if (!programId) return;
  return (
    <div className="flex gap-4 items-center">
      <Link href={`/programs/${programId}`}>
        <Button variant="tertiary">
          <HomeIcon />
          Overview
        </Button>
      </Link>
      {canEdit && (
        <Link href={`/programs/${programId}/settings`}>
          <Button variant="tertiary">
            <SettingsIcon />
            Settings
          </Button>
        </Link>
      )}
    </div>
  );
}
