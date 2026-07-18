import { getBacklogStatus, getProgram, isOrg } from "@/app/lib/data";
import { BacklogStatus } from "@/app/lib/types";
import ProgramSettings from "@/app/ui/program-settings";
import Unauthorized from "@/app/ui/unauthorized";
import { notFound } from "next/navigation";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;

  const org = await isOrg(programId)
  console.log("bloop! 2")
  console.log(org)
  if (!org) return <Unauthorized />

  const program = await getProgram(programId);

  if (!program) notFound();

  return <ProgramSettings program={program} />;
}
