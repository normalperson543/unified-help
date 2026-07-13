import { Button } from "@heroui/react";
import { ArrowLeftIcon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";

export default function Unauthorized() {
  return (
    <div className="w-full h-full p-4 items-center justify-center flex gap-4 bg-radial-[at_25%_25%] dark:from-[#3e0e15] light:from-[#ec3750] to-transparent to-75%">
      <div className="flex flex-col gap-4">
        <TriangleAlertIcon className="text-orange-500" />
        <p className="font-bold text-2xl">Unauthorized</p>
        <p className="max-w-96">
          You don&apos;t have permission to view this page. If this is a
          mistake, contact your event organizer or Unified Help.
        </p>
        <Link href="/dashboard">
          <Button>
            <ArrowLeftIcon />
            Return to dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
