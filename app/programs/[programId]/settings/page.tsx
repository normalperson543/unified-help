import { getProgram, isOrg } from "@/app/lib/data";
import ProgramSettings from "@/app/ui/program-settings";
import Unauthorized from "@/app/ui/unauthorized";
import { notFound } from "next/navigation";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;

  const org = await isOrg(programId);
  if (!org) return <Unauthorized />;

  const program = await getProgram(programId);

  if (!program) notFound();

  return <ProgramSettings program={program} />;
}
