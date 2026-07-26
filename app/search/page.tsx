import { headers } from "next/headers";
import { auth } from "../lib/auth";
import { getUser } from "../lib/data";
import SearchPageUI from "../ui/search-page-ui";
import NotLoggedIn from "../ui/not-logged-in";
import { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{
    [searchTerm: string]: string | string[] | undefined;
  }>;
}): Promise<Metadata> {
  const { searchTerm } = await searchParams;
  return {
    title: searchTerm
      ? searchTerm.length > 0
      ? `Search results for ${searchTerm}`
        : "Search"
      : "Search",
    description: "View search results for tickets and users on Unified Help.",
  };
}
export default async function SearchPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  let user;
  if (session?.user.id) user = await getUser(session?.user.id);
  if (!user) return <NotLoggedIn />;

  return <SearchPageUI />;
}
