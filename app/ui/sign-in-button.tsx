"use client";
import { Button, Spinner } from "@heroui/react";
import { LogInIcon } from "lucide-react";
import { authClient } from "../lib/auth-client";
import { useState } from "react";

export default function SignInButton({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [signingIn, setSigningIn] = useState(false);
  async function handleSignIn() {
    setSigningIn(true);
    await authClient.signIn.social({
      provider: "hackclub",
      callbackURL: "/dashboard",
    });
  }
  return (
    <Button onClick={handleSignIn} isPending={signingIn}>
      {signingIn ? (
        <>
          <Spinner color="current" /> Signing in
        </>
      ) : (
        (children ?? (
          <>
            <LogInIcon /> Sign in
          </>
        ))
      )}
    </Button>
  );
}
