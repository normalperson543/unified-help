import { getBacklogStatus, getProgram } from "@/app/lib/data";
import { BacklogStatus } from "@/app/lib/types";
import ProgramSettings from "@/app/ui/program-settings";
import { notFound } from "next/navigation";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;

  const program = await getProgram(programId);

  const backlogStatus: BacklogStatus = await getBacklogStatus(programId);
  
  if (!program) notFound();

  return <ProgramSettings program={program} backlogStatus={backlogStatus} />;
}
