import { getProgram, getSlackUserDetailed } from "@/app/lib/data";
import ProfileUI from "@/app/ui/profile";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ profileId: string, programId: string }>;
}) {
  const { profileId, programId} = await params;
  const profile = await getSlackUserDetailed(profileId, programId)
  const program = await getProgram(programId)
  return <ProfileUI profile={profile} program={program} />
}