import {
  getAllAssignedAndResolvedTicketsCount,
  getSlackUserDetailed,
  getUserAnswerActivity,
  getUserFirstResponseTime,
  getUserRepliesCount,
  getUserResolveTime,
} from "@/app/lib/data";
import ProfileUI from "@/app/ui/profile";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const profile = await getSlackUserDetailed(profileId);
  const frt = await getUserFirstResponseTime(
    profileId,
    new Date(0),
    new Date(),
  ); //lmao this is temporary
  const resolveTime = await getUserResolveTime(
    profileId,
    new Date(0),
    new Date(),
  );
  const activity = await getUserAnswerActivity(profileId);
  const assignedAndResolvedCount =
    await getAllAssignedAndResolvedTicketsCount(profileId);
  const repliesCount = await getUserRepliesCount(profileId);
  return (
    <ProfileUI
      profile={profile}
      frt={frt}
      resolveTime={resolveTime}
      activity={activity}
      assignedAndResolvedCount={assignedAndResolvedCount}
      repliesCount={repliesCount}
    />
  );
}
