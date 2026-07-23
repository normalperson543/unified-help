"use client";

import { Button } from "@heroui/react";
import { fetcher } from "../lib/swr";
import useSWR from "swr";
import { ProgramWithAssignees } from "../lib/types";
import { useParams } from "next/navigation";
import { HomeIcon, SettingsIcon } from "lucide-react";
import { authClient } from "../lib/auth-client";
import Link from "next/link";

export default function ProgramTabs() {
  const { programId } = useParams();
  const { data: session } = authClient.useSession();
  const { data: stats } = useSWR<ProgramWithAssignees>(
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
