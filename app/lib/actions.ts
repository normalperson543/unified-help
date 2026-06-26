'use server'
import { authClient } from "./auth-client";
import { prisma } from "./prisma";

export async function handleSignIn() {
  await authClient.signIn.social({
    provider: "github",
    callbackURL: "/dashboard", 
    errorCallbackURL: "/error",
    newUserCallbackURL: "/welcome",
    disableRedirect: true,
});
}
