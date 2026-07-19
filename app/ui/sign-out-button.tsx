"use client";

import { LogOutIcon } from "lucide-react";
import { Avatar, Dropdown, Label, Link } from "@heroui/react";
import { authClient } from "../lib/auth-client";
export default function SignOutButton({
  username,
  pfp,
  userId,
}: {
  username: string;
  pfp: string;
  userId: string;
}) {
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
          onAction={(key) => {
            if (key === "signOut") authClient.signOut();
          }}
        >
          <Dropdown.Item id="profile">
            <Link href={`/profile/${userId}`}>
              <Label>
                <p className="text-muted">Signed in as </p>
                {username}
              </Label>
            </Link>
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
