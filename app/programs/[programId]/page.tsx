import { auth } from "@/app/lib/auth";
import { getProgram, getUser } from "@/app/lib/data";
import ProgramUI from "@/app/ui/program-home";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

export default async function ProgramPage() {
  return <ProgramUI />;
}
