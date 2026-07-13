import { Button } from "@heroui/react";
import {
  ArrowLeftIcon,
  StickyNoteOffIcon,
} from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="w-full h-full p-4 items-center justify-center flex gap-4 bg-radial-[at_25%_25%] dark:from-[#3e0e15] light:from-[#ec3750] to-transparent to-75%">
      <div className="flex flex-col gap-4">
        <StickyNoteOffIcon className="text-orange-500" />
        <p className="font-bold text-2xl">Not Found</p>
        <p className="max-w-96">
          The requested page was not found. It may have been moved or deleted.
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
