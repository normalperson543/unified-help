"use client";

import { Button } from "@heroui/react";
import { fetcher } from "../lib/swr";
import useSWR from "swr";
import { ProgramWithAssignees } from "../lib/types";
import { useParams, useRouter } from "next/navigation";
import { HomeIcon, SettingsIcon } from "lucide-react";
import { authClient } from "../lib/auth-client";

export default function ProgramTabs() {
  const { programId } = useParams();
  const router = useRouter();
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
      <Button
        variant="tertiary"
        onPress={() => router.push(`/programs/${programId}`)}
      >
        <HomeIcon />
        Overview
      </Button>
      {canEdit && (
        <Button
          variant="tertiary"
          onPress={() => router.push(`/programs/${programId}/settings`)}
        >
          <SettingsIcon />
          Settings
        </Button>
      )}
    </div>
  );
}
