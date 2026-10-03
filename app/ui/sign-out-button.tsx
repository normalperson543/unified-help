"use client";

import { BellIcon, LogOutIcon, MoonIcon, SunIcon } from "lucide-react";
import { Avatar, Dropdown, Label, Switch, useTheme } from "@heroui/react";
import { authClient } from "../lib/auth-client";
import { useRouter } from "next/navigation";
import { useNotificationPermission } from "../lib/use-notification-permission";

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
  const { resolvedTheme, setTheme } = useTheme("dark");
  const { permission, requestPermission } = useNotificationPermission();
  const showEnableNotifications =
    permission !== "granted" && permission !== "unsupported";

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

          <Dropdown.Item id="theme" textValue="Toggle light and dark mode">
            <Switch
              aria-label="Toggle light and dark mode"
              isSelected={resolvedTheme === "light"}
              onChange={(isLight) => setTheme(isLight ? "light" : "dark")}
            >
              {({ isSelected }) => (
                <Switch.Content>
                  <Switch.Control>
                    <Switch.Thumb>
                      <Switch.Icon>
                        {isSelected ? (
                          <SunIcon size={12} />
                        ) : (
                          <MoonIcon size={12} />
                        )}
                      </Switch.Icon>
                    </Switch.Thumb>
                  </Switch.Control>
                  <Label>{isSelected ? "Light mode" : "Dark mode"}</Label>
                </Switch.Content>
              )}
            </Switch>
          </Dropdown.Item>

          {showEnableNotifications && (
            <Dropdown.Item id="enableNotifications" onClick={requestPermission}>
              <BellIcon width={16} />
              <Label>Enable notifications</Label>
            </Dropdown.Item>
          )}

          <Dropdown.Item id="signOut">
            <LogOutIcon width={16} />
            <Label>Sign out</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
