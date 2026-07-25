import { auth } from "@/app/lib/auth";
import {
  getAllAssignedAndResolvedTicketsCount,
  getProgram,
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
import { Metadata, ResolvingMetadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";

const getSlackUserDetailedCached = cache(
  async (profileId: string, programId: string) => {
    const profile = await getSlackUserDetailed(profileId, programId);
    return profile;
  },
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ profileId: string; programId: string }>;
}): Promise<Metadata> {
  const { profileId, programId } = await params;
  const p = await getSlackUserDetailedCached(profileId, programId);
  return {
    title: `${p?.username}`,
    description: `View ${p?.username}'s Unified Help support statistics and interacted tickets.`,
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ profileId: string; programId: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  let user;
  if (session?.user.id) user = await getUser(session?.user.id);
  if (!user) return <NotLoggedIn />;

  const { profileId, programId } = await params;

  const profile = await getSlackUserDetailedCached(profileId, programId);
  const program = await getProgram(programId);
  if (!profile || !program) notFound();
  const frt = await getUserFirstResponseTime(
    profileId,
    new Date(0),
    new Date(),
    programId,
  );
  const resolveTime = await getUserResolveTime(
    profileId,
    new Date(0),
    new Date(),
    programId,
  );
  const activity = await getUserAnswerActivity(profileId, programId);
  const assignedAndResolvedCount = await getAllAssignedAndResolvedTicketsCount(
    profileId,
    programId,
  );
  const repliesCount = await getUserRepliesCount(profileId, programId);
  const repliedTickets = await getTicketsWithRepliesFromUser(profileId);
  const programs = await getPrograms();
  return (
    <ProfileUI
      profile={profile}
      program={program}
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
