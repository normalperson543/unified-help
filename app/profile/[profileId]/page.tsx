import { getSlackUserDetailed } from "@/app/lib/data";
import ProfileUI from "@/app/ui/profile";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const profile = await getSlackUserDetailed(profileId)
  return <ProfileUI profile={profile} />
}