import { QueryClient, useQuery } from "@tanstack/react-query";
import { SoundCloudKit } from "@/lib/audio/fetchers";

export function useSongData(songId: string) {
  return useQuery({
    queryKey: ["songData", songId],
    queryFn: () => SoundCloudKit.getData(songId, "songs"),
    enabled: !!songId,
    staleTime: 60 * 60 * 1000,
  });
}

const queryClient = new QueryClient();

export async function prefetchSongData(songId: string) {
  await queryClient.prefetchQuery({
    queryKey: ["songData", songId],
    queryFn: () => SoundCloudKit.getData(songId, "songs"),
  });
}
