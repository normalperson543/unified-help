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
} from "@heroui/react";
import { SlackUserDetailed } from "../lib/types";
import {
  CalendarIcon,
  CheckIcon,
  CircleIcon,
  CircleQuestionMarkIcon,
  ClockCheckIcon,
  ReplyIcon,
  SquareArrowOutUpRightIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Program } from "@/generated/prisma/browser";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileUI({
  profile,
  program,
  frt,
  resolveTime,
}: {
  profile: SlackUserDetailed;
  program?: Program;
  frt?: number | undefined;
  resolveTime?: number | undefined;
}) {
  const [selectedKey, setSelectedKey] = useState<Key | null>(
    program ? (program.id as string) : "all",
  );

  const router = useRouter();

  function handleSelectProgram(key: Key | null) {
    if (!key) return;
    setSelectedKey(key);
    console.log(key);
    if (key === "all") {
      router.push(`/profile/${profile.id}`);
      return;
    }
    router.push(`/profile/${profile.id}/program/${key}`);
  }
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

      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row gap-1">
          <p>Showing data for</p>
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
                <ListBox.Item id="all" textValue="all" key="all">
                  All programs
                </ListBox.Item>
                {profile.programs.map((p) => (
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
            <CheckIcon
              width={64}
              className="bottom-2 -right-2 absolute opacity-30"
            />
          </div>
        </Card>
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
            <p className="text-muted uppercase">First response time</p>
            <p className="font-bold text-3xl">
              {frt ? Math.round((frt / 60) * 100) / 100 : "N/A"}
            </p>
            <p>minutes</p>
            <ReplyIcon
              width={64}
              className="bottom-2 -right-2 absolute opacity-30"
            />
          </div>
        </Card>
        <Card className="basis-50 grow shrink relative">
          <div className="flex flex-col gap-1">
            <p className="text-muted uppercase">Resolve time</p>
            <p className="font-bold text-3xl">
              {resolveTime ? Math.round((resolveTime / 60) * 100) / 100 : "N/A"}
            </p>
            <p>minutes</p>
            <ClockCheckIcon
              width={64}
              className="bottom-2 -right-2 absolute opacity-30"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
