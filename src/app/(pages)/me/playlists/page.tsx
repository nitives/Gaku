"use client";
import { useUser } from "@/hooks/useUser";
import { SoundCloudKit } from "@/lib/audio/fetchers";
import { Spinner } from "@/components/extra/Spinner";
import { TryAgain } from "@/components/extra/TryAgain";
import { useQuery } from "@tanstack/react-query";

export default function UserPlaylist() {
  const { settings } = useUser();
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["soundcloudUserID", settings.data?.themeColor],
    queryFn: () => SoundCloudKit.getUserData(settings!.data!.soundcloudUserId),
    staleTime: 1000 * 60 * 5,
    enabled: !!settings,
    retry: false,
    refetchOnWindowFocus: false,
  });
  if (!settings)
    return <p className="text-[--systemSecondary]">Loading user data.</p>;
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

  return (
    <div>
      <h1>User Playlist</h1>
    </div>
  );
}
