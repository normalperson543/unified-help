import { canCreateManagedProgram } from "@/app/lib/data";
import { Card } from "@heroui/react";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";

export default async function AddProgram() {
  const allowedManaged = await canCreateManagedProgram();

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="flex flex-col gap-2 w-2/3">
        <h2 className="text-2xl font-bold">Welcome to Unified Help</h2>
        <p>Select an option to begin</p>
        <div className="flex flex-row gap-2">
          {allowedManaged ? (
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
                  Unified Help, and you can manage your program within the
                  Unified Help website.
                </Card.Description>
              </Card>
            </Link>
          ) : (
            <div className="w-1/2 cursor-not-allowed">
              <Card className="opacity-50">
                <Card.Header>
                  <SparklesIcon width={24} />
                </Card.Header>
                <Card.Title className="text-lg font-bold">
                  Deploy a new help channel
                </Card.Title>
                <Card.Description className="text-gray-400">
                  <p>
                    Instantly make a help channel for your program that&apos;s
                    managed through Unified Help, including a help channel with
                    a bot. Helpers resolve and respond to tickets within Slack
                    or Unified Help, and you can manage your program within the
                    Unified Help website.
                  </p>
                  <br />
                  <b>
                    This feature is restricted. Ask your Point of Contact of
                    your program to sign into Unified Help with an @hackclub.com
                    email and create your program.
                  </b>
                </Card.Description>
              </Card>
            </div>
          )}
          <Link
            href="https://forms.fillout.com/t/k1NNiLbTasus"
            className="w-1/2"
            target="_blank"
          >
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
