import { getSlackUser } from "@/app/lib/data";
import ProfileUI from "@/app/ui/profile";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const profile = await getSlackUser(profileId)
  return <ProfileUI profile={profile} />
}