"use client";
import { useUser } from "@/hooks/useUser";
import { SoundCloudKit } from "@/lib/audio/fetchers";
import { Spinner } from "@/rework/components/extra/Spinner";
import { useQuery } from "@tanstack/react-query";
import { TryAgain } from "../../search/page";

export default function UserPlaylist() {
  const { settings } = useUser();
  console.log("Settings", settings);
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["soundcloudUserID", settings?.soundcloudUserId],
    queryFn: () => SoundCloudKit.getUserData(settings!.soundcloudUserId),
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
  console.log("User", user);

  return (
    <div>
      <h1>User Playlist</h1>
      <h2>Settings COlor:</h2>
    </div>
  );
}
