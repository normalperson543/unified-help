import { auth } from "@/app/lib/auth";
import {
  getAllAssignedAndResolvedTicketsCount,
  getPrograms,
  getSlackUserDetailed,
  getTicketsWithRepliesFromUser,
  getUser,
  getUserAnswerActivity,
  getUserFirstResponseTime,
  getUserRepliesCount,
  getUserResolveTime,
} from "@/app/lib/data";
import NotLoggedIn from "@/app/ui/not-logged-in";
import ProfileUI from "@/app/ui/profile";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const session = await auth.api.getSession({
    // from better auth docs
    headers: await headers(), // you need to pass the headers object.
  });
  let user;
  if (session?.user.id) user = await getUser(session?.user.id);
  if (!user) return <NotLoggedIn />;

  const { profileId } = await params;
  const profile = await getSlackUserDetailed(profileId);
  if (!profile) notFound();
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
  const repliedTickets = await getTicketsWithRepliesFromUser(profileId);
  const programs = await getPrograms();
  return (
    <ProfileUI
      profile={profile}
      frt={frt}
      resolveTime={resolveTime}
      activity={activity}
      assignedAndResolvedCount={assignedAndResolvedCount}
      repliesCount={repliesCount}
      repliedTickets={repliedTickets}
      programs={programs}
    />
  );
}
