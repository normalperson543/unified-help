import { getProgram } from "@/app/lib/data";
import ProgramUI from "@/app/ui/program-home";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ programId: string }>;
}): Promise<Metadata> {
  const { programId } = await params;
  const program = await getProgram(programId);
  return {
    title: `${program ? program.name : "View program"}`,
    description: `View all Unified Help tickets for ${program ? program.name : "this program"}.`,
  };
}

export default async function ProgramPage() {
  return <ProgramUI />;
}
