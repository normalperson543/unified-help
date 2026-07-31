import { headers } from "next/headers";
import { auth } from "../lib/auth";
import { getPrograms, getUser } from "../lib/data";
import { Card } from "@heroui/react";
import Link from "next/link";
import Image from "next/image";
import { PlusSquareIcon } from "lucide-react";
import NotLoggedIn from "../ui/not-logged-in";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "View programs you have been assigned to and are registered on Unified Help.",
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    // from better auth docs
    headers: await headers(), // you need to pass the headers object.
  });
  const programs = await getPrograms();
  let user;
  if (session?.user.id) user = await getUser(session?.user.id);
  if (!user) return <NotLoggedIn />;
  return (
    <div className="flex flex-col gap-2 px-12 py-4 w-full min-h-0 overflow-y-auto">
      <h2 className="text-lg font-bold">Your Programs</h2>
      {!user.slackUser ? (
        <p>
          Your Slack user was not linked to the database. Please log out and log
          back in again. If this persists, contact Unified Help support.
        </p>
      ) : (
        <>
          <p>
            You&apos;re assigned to help in {user.slackUser?.programs.length}{" "}
            program
            {user.slackUser?.programs.length !== 1 && "s"}.
          </p>
          <div className="flex flex-row flex-wrap gap-4">
            {user.slackUser?.programs.map((p) => (
              <Link href={`/programs/${p.id}`} key={p.id}>
                <Card className="w-96">
                  {p.logo && (
                    <Image
                      src={p.logo}
                      alt="Program logo"
                      width={32}
                      height={32}
                      className="rounded-sm"
                    />
                  )}
                  <b>{p.name}</b>
                  <p className="text-muted">
                    {p._count.tickets} tickets - {p._count.assignedUsers}{" "}
                    helpers
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
      <div className="w-full h-1 bg-accent-background"></div>
      <h2 className="text-lg font-bold">All Registered Programs</h2>
      <p>View tickets for registered programs under Unified Help.</p>
      <div className="flex flex-row flex-wrap gap-4">
        {programs.map((p) => (
          <Link href={`/programs/${p.id}`} key={p.id}>
            <Card className="w-96">
              {p.logo && (
                <Image src={p.logo} alt="Program logo" width={32} height={32} />
              )}
              <b>{p.name}</b>
              <p className="text-muted">
                {p._count.tickets} tickets - {p._count.assignedUsers} helpers
              </p>
            </Card>
          </Link>
        ))}
        {user.isAdmin && (
          <Link href="/dashboard/add-program">
            <Card className="w-96 flex flex-row border-dashed border-2 border-muted">
              <PlusSquareIcon width={16} />
              <b>Create program</b>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}
