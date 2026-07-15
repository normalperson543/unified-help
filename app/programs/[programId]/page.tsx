import { auth } from "@/app/lib/auth";
import { getProgram, getUser } from "@/app/lib/data";
import ProgramUI from "@/app/ui/program-home";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  let user;
  if (session?.user.id) user = await getUser(session?.user.id);
  if (!user) return notFound();

  const program = await getProgram(programId);

  if (!program) notFound();
  
  return <ProgramUI />;
}
