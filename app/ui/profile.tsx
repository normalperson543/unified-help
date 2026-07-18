"use client";
import { Avatar, Button, Card, Chip } from "@heroui/react";
import { SlackUserDetailed } from "../lib/types";
import {
  CalendarIcon,
  CircleIcon,
  SquareArrowOutUpRightIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Program } from "@/generated/prisma/browser";

export default function ProfileUI({
  profile,
  program,
}: {
  profile: SlackUserDetailed;
  program?: Program;
}) {
  return (
    <div className="flex flex-col gap-6 px-36 py-4 w-full h-full">
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

      <div className="flex flex-row items-center">
        <div className="flex flex-row gap-1">
          <p>Showing data for</p>
          <b>{program ? program.name : "all programs"}</b>
        </div>
      </div>
      <div className="flex flex-row gap-2">
        <Card className="basis-50 grow shrink relative">
          <div className="flex flex-col gap-1">
            <p className="text-muted uppercase">Assigned tickets</p>
            <p className="font-bold text-3xl">
              {profile._count.assignedTickets}
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
              {profile._count.resolvedTickets}
            </p>
            <CircleIcon
              width={64}
              className="bottom-2 -right-2 absolute opacity-30"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
