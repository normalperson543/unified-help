import { getProgram, getSlackUserDetailed, getUserAnswerActivity, getUserFirstResponseTime, getUserResolveTime } from "@/app/lib/data";
import ProfileUI from "@/app/ui/profile";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ profileId: string, programId: string }>;
}) {
  const { profileId, programId} = await params;
  const profile = await getSlackUserDetailed(profileId, programId)
  const program = await getProgram(programId)
  const frt = await getUserFirstResponseTime(profileId, new Date(0), new Date(), programId) //lmao this is temporary
  const resolveTime = await getUserResolveTime(profileId, new Date(0), new Date(), programId)
  const activity = await getUserAnswerActivity(profileId, programId)
  return <ProfileUI profile={profile} program={program} frt={frt} resolveTime={resolveTime} activity={activity} />
}