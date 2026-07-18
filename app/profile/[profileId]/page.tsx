import { getSlackUserDetailed, getUserFirstResponseTime, getUserResolveTime } from "@/app/lib/data";
import ProfileUI from "@/app/ui/profile";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const profile = await getSlackUserDetailed(profileId)
  const frt = await getUserFirstResponseTime(profileId, new Date(0), new Date()) //lmao this is temporary
  const resolveTime = await getUserResolveTime(profileId, new Date(0), new Date())
  return <ProfileUI profile={profile} frt={frt} resolveTime={resolveTime} />
}