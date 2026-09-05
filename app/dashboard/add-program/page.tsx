import { auth } from "@/app/lib/auth";
import { getUser } from "@/app/lib/data";
import NotLoggedIn from "@/app/ui/not-logged-in";
import Unauthorized from "@/app/ui/unauthorized";
import { Card } from "@heroui/react";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";

export default async function AddProgram() {
  const session = await auth.api.getSession({
    // from better auth docs
    headers: await headers(), // you need to pass the headers object.
  });
  let user;
  if (session?.user.id) user = await getUser(session?.user.id);
  if (!user) return <NotLoggedIn />;
  if (!user.isAdmin) return <Unauthorized />;

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="flex flex-col gap-2 w-2/3">
        <h2 className="text-2xl font-bold">Welcome to Unified Help</h2>
        <p>Select an option to begin</p>
        <div className="flex flex-row gap-2">
          <Link href="/dashboard/add-program/new" className="w-1/2">
            <Card>
              <Card.Header>
                <SparklesIcon width={24} />
              </Card.Header>
              <Card.Title className="text-lg font-bold">
                Deploy a new help channel
              </Card.Title>
              <Card.Description className="text-gray-400">
                Instantly make a help channel for your program that&apos;s
                managed through Unified Help, including a help channel with a
                bot. Helpers resolve and respond to tickets within Slack or
                Unified Help, and you can manage your program within the Unified
                Help website. To use this option, sign in with a @hackclub.com
                email.
              </Card.Description>
            </Card>
          </Link>
          <Link href="https://forms.fillout.com/t/k1NNiLbTasus" className="w-1/2" target="_blank">
            <Card>
              <Card.Header>
                <ArrowRightIcon width={24} />
              </Card.Header>
              <Card.Title className="text-lg font-bold">
                Set up Unified Help with an existing help channel
              </Card.Title>
              <Card.Description className="text-gray-400">
                Already using an existing support bot? Choose this option to
                integrate it with Unified Help. Get enhanced statistics, better
                ticket searching and management, and reply and resolve* tickets.
                You&apos;ll apply for this option.
              </Card.Description>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
