import { headers } from "next/headers";
import { auth } from "../lib/auth";
import { getUser } from "../lib/data";
import ProgramSelector from "./program-selector";
import SignInButton from "./sign-in-button";

import ProgramStats from "./program-stats";
import Link from "next/link";
import SignOutButton from "./sign-out-button";
import ProgramTabs from "./program-tabs";
import { Button } from "@heroui/react";
import SearchBar from "./search-bar";
import { LayoutDashboardIcon, PodiumIcon } from "lucide-react";
import Image from "next/image";

export default async function Header({
  children,
}: {
  children?: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    // from better auth docs bc too lazy :
    headers: await headers(), // you need to pass the headers object.
  });
  let user;
  if (session?.user.id) user = await getUser(session?.user.id);
  return (
    <div className="flex flex-row justify-between p-4 border-b border-accent-background">
      <div className="flex flex-row gap-8 items-center">
        <div className="flex flex-row gap-2 items-center">
          <Link href="/">
            <Image
              src="/assets/logo.svg"
              width={32}
              height={32}
              alt="Unified Help logo"
            />
          </Link>
          <Link href="/">
            <h2 className="text-lg">
              unified<b>help</b>
            </h2>
          </Link>
        </div>

        {session?.user && (
          <>
            <div className="flex flex-row gap-2 items-center">
              <SearchBar />
              <Link href="/dashboard">
                <Button variant="tertiary">
                  <LayoutDashboardIcon />
                  Dashboard
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button variant="tertiary">
                  <PodiumIcon />
                  Leaderboard
                </Button>
              </Link>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <ProgramSelector />
              <ProgramTabs />
            </div>
          </>
        )}
      </div>

      <div className="flex flex-row gap-4 items-center">
        {children}
        <ProgramStats />
        {!session?.user && <SignInButton />}
        {session && session.user && (
          <SignOutButton
            username={user?.slackUser?.username ?? ""}
            pfp={`https://cachet.dunkirk.sh/users/${user?.slackUser?.id}/r`}
            userId={session.user.slackId!}
          />
        )}
      </div>
    </div>
  );
}
