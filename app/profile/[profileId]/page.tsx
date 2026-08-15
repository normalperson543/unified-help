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
import { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";

const getSlackUserDetailedCached = cache(async (profileId: string) => {
  const profile = await getSlackUserDetailed(profileId);
  return profile;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ profileId: string; programId: string }>;
}): Promise<Metadata> {
  const { profileId } = await params;
  let p;
  try {
    p = await getSlackUserDetailedCached(profileId);
  } catch {
    console.error("unauthenticated");
    return {
      title: "Unauthenticated",
    };
  }
  return {
    title: `${p ? p.username : "User"}`,
    description: `View ${p ? p.username : "this user"}'s Unified Help support statistics and interacted tickets.`,
  };
}

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
  const profile = await getSlackUserDetailedCached(profileId);
  if (!profile) notFound();
  const { avg: frt, median: frtMedian } = await getUserFirstResponseTime(
    profileId,
    new Date(0),
    new Date(),
  );
  const { avg: resolveTime, median: resolveTimeMedian } =
    await getUserResolveTime(profileId, new Date(0), new Date());
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
      frtMedian={frtMedian}
      resolveTime={resolveTime}
      resolveTimeMedian={resolveTimeMedian}
      activity={activity}
      assignedAndResolvedCount={assignedAndResolvedCount}
      repliesCount={repliesCount}
      repliedTickets={repliedTickets}
      programs={programs}
    />
  );
}
