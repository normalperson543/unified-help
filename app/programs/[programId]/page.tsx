import { auth } from "@/app/lib/auth";
import { getUser } from "@/app/lib/data";
import NotLoggedIn from "@/app/ui/not-logged-in";
import ProgramUI from "@/app/ui/program-home";
import { headers } from "next/headers";

export default async function ProgramPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  let user;
  if (session?.user.id) user = await getUser(session?.user.id);
  if (!user) return <NotLoggedIn />;

  return <ProgramUI />;
}
