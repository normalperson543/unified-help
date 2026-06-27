"use client";
import { Avatar, Button } from "@heroui/react";
import { LogInIcon } from "lucide-react";
import { authClient } from "../lib/auth-client";

export default function SignInButton() {
  async function handleSignIn() {
    console.log("twout");
    await authClient.signIn.social({
      provider: "hackclub",
      callbackURL: "/dashboard",
    });
  }
  return (
    <Button onClick={handleSignIn}>
      <LogInIcon /> Sign in
    </Button>
  );
}
