"use client";

import { LogOutIcon } from "lucide-react";
import { Avatar, Dropdown, Label } from "@heroui/react";
import { authClient } from "../lib/auth-client";
import { useRouter } from "next/navigation";
export default function SignOutButton({
  username,
  pfp,
  userId,
}: {
  username: string;
  pfp: string;
  userId: string;
}) {
  const router = useRouter();
  return (
    <Dropdown>
      <Dropdown.Trigger>
        <Avatar size="sm">
          <Avatar.Image src={pfp} alt="Profile picture" />
          <Avatar.Fallback>{username.substring(0, 1)}</Avatar.Fallback>
        </Avatar>
      </Dropdown.Trigger>
      <Dropdown.Popover>
        <Dropdown.Menu
          onAction={async (key) => {
            if (key === "signOut") {
              await authClient.signOut();
              router.push("/");
              router.refresh();
            }
          }}
        >
          <Dropdown.Item
            id="profile"
            onClick={() => router.push(`/profile/${userId}`)}
          >
            <Label>
              <p className="text-muted">Signed in as </p>
              {username}
            </Label>
          </Dropdown.Item>

          <Dropdown.Item id="signOut">
            <LogOutIcon width={16} />
            <Label>Sign out</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
