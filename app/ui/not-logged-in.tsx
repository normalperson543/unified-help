import { Button } from "@heroui/react";
import { ArrowRightIcon, LockIcon } from "lucide-react";
import Link from "next/link";
import SignInButton from "./sign-in-button";

export default function NotLoggedIn() {
  return (
    <div className="w-full h-full p-4 items-center justify-center flex gap-4 bg-radial-[at_25%_25%] dark:from-[#3e0e15] light:from-[#ec3750] to-transparent to-75%">
      <div className="flex flex-col gap-4">
        <LockIcon className="text-orange-500" />
        <p className="font-bold text-2xl">Sign in to continue</p>
        <p className="max-w-96">
          Please sign in to Unified Help to access this page.
        </p>
        <SignInButton />
      </div>
    </div>
  );
}
