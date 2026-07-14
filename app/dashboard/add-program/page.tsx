import { auth } from "@/app/lib/auth";
import { getUser } from "@/app/lib/data";
import AddProgramUI from "@/app/ui/add-program";
import NotLoggedIn from "@/app/ui/not-logged-in";
import Unauthorized from "@/app/ui/unauthorized";
import { headers } from "next/headers";

export default async function AddProgram() {
  const session = await auth.api.getSession({
    // from better auth docs
    headers: await headers(), // you need to pass the headers object.
  });
  let user;
  if (session?.user.id) user = await getUser(session?.user.id);
  if (!user) return <NotLoggedIn />;
  if (!user.isAdmin) return <Unauthorized />

  return <AddProgramUI />;
}
