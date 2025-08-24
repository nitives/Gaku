"use client";
import { useUser } from "@/hooks/useUser";
import { SoundCloudKit } from "@/lib/audio/fetchers";
import { Spinner } from "@/rework/components/extra/Spinner";
import { useQuery } from "@tanstack/react-query";
import UserLikedSongs from "@/rework/components/main/library/me/UserLikesPage";
import { TryAgain } from "@/rework/components/extra/TryAgain";

export default function UserLikes() {
  const { settings } = useUser();
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["soundcloudUserID", settings?.data?.soundcloudUserId],
    queryFn: () => SoundCloudKit.getUserData(settings!.data!.soundcloudUserId),
    enabled: !!settings,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    refetchOnWindowFocus: false,
  });
  if (settings.isLoading)
    return (
      <p className="text-[--systemSecondary] shadow-lg">Loading user data.</p>
    );
  if (isLoading) return <Spinner />;
  if (error) {
    return (
      <TryAgain
        errorName={(error as Error).name}
        errorMessage={(error as Error).message}
        onTryAgain={() => refetch()}
      />
    );
  }

  return <UserLikedSongs user={user} />;
}
