"use client";
import { SoundCloudKit } from "@/lib/audio/fetchers";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Spinner } from "@/components/extra/Spinner";
import { TryAgain } from "@/components/extra/TryAgain";
import { Song as SongComponent } from "@/components/main/song/Song";
import { dev } from "@/lib/utils";

export default function Song() {
  const { song_title, song_id } = useParams() as {
    song_title: string;
    song_id: string;
  };
  const {
    data: song,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["soundcloudSong", song_id],
    queryFn: () => SoundCloudKit.getData(song_id, "songs"),
    enabled: !!song_id,
    retry: false,
    refetchOnWindowFocus: false,
  });
  dev.log("[SONG] Data:", song);

  if (!song_id)
    return <p className="text-[--systemSecondary]">No song found.</p>;
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

  return song ? <SongComponent data={song as any} /> : null;
}
