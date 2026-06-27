import { headers } from "next/headers";
import { auth } from "../lib/auth";
import { getUser } from "../lib/data";
import ProgramSelector from "./program-selector";
import SignInButton from "./sign-in-button";
import { Avatar } from "@heroui/react";

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
        <h2 className="text-lg">
          unified<b>help</b>
        </h2>
        <ProgramSelector />
      </div>
      <div className="flex flex-row gap-4 items-center">
        {children}
        {!session?.user && <SignInButton />}
        {session && session.user && (
          <Avatar size="sm">
            <Avatar.Image
              src={`https://cachet.dunkirk.sh/users/${user?.slackUser?.id}/r`}
              alt="Profile picture"
            />
            <Avatar.Fallback>
              {user?.slackUser?.username.substring(0, 1)}
            </Avatar.Fallback>
          </Avatar>
        )}
      </div>
    </div>
  );
}
