import { headers } from "next/headers";
import { auth } from "../lib/auth";
import LeaderboardUI from "../ui/leaderboard";
import NotLoggedIn from "../ui/not-logged-in";
import { getUser } from "../lib/data";

export default async function LeaderboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  let user;
  if (session?.user.id) user = await getUser(session?.user.id);
  if (!user) return <NotLoggedIn />;
  
  return <LeaderboardUI />;
}
