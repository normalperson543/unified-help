import { getProgram } from "@/app/lib/data";
import ProgramSettings from "@/app/ui/program-settings";
import { notFound } from "next/navigation";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;

  const program = await getProgram(programId);
  if (!program) notFound();

  return <ProgramSettings program={program} />;
}
