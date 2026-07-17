"use client";
import { SlackUser } from "@/generated/prisma/browser";
import { Avatar } from "@heroui/react";

export default function ProfileUI({ profile }: { profile: SlackUser }) {
  return (
    <div className="flex flex-col gap-2 px-12 py-4 w-full h-full">
      <div className="flex gap-2 items-center">
        <Avatar size="lg">
          <Avatar.Image
            src={`https://cachet.dunkirk.sh/users/${profile.id}/r`}
            alt="Profile picture"
          />
          <Avatar.Fallback>{profile.username.substring(0, 1)}</Avatar.Fallback>
        </Avatar>
      </div>
    </div>
  );
}
