import { headers } from "next/headers";
import { auth } from "../lib/auth";
import { getUser } from "../lib/data";
import ProgramSelector from "./program-selector";
import SignInButton from "./sign-in-button";

import ProgramStats from "./program-stats";
import Link from "next/link";
import SignOutButton from "./sign-out-button";

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
      <div className="flex flex-row gap-4 items-center">
        <Link href="/dashboard">
          <h2 className="text-lg">
            unified<b>help</b>
          </h2>
        </Link>
        <ProgramSelector />
      </div>
      <div className="flex flex-row gap-4 items-center">
        {children}
        <ProgramStats />
        {!session?.user && <SignInButton />}
        {session && session.user && (
          <SignOutButton
            username={user?.slackUser?.username ?? ""}
            pfp={`https://cachet.dunkirk.sh/users/${user?.slackUser?.id}/r`}
          />
        )}
      </div>
    </div>
  );
}
