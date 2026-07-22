import { headers } from "next/headers";
import { auth } from "../lib/auth";
import { getUser } from "../lib/data";
import SearchPageUI from "../ui/search-page-ui";
import NotLoggedIn from "../ui/not-logged-in";

export default async function SearchPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  let user;
  if (session?.user.id) user = await getUser(session?.user.id);
  if (!user) return <NotLoggedIn />;

  return <SearchPageUI />;
}
