"use client";
import { Album } from "@/rework/components/main/album/Album";
import { Spinner } from "@/rework/components/extra/Spinner";
import { TryAgain } from "@/app/(new_pages)/search/page";
import { SoundCloudKit } from "@/lib/audio/fetchers";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export default function AlbumPage() {
  const { album_id } = useParams() as {
    album_id: string;
  };
  const {
    data: album,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["soundcloudAlbum", album_id],
    queryFn: () =>
      SoundCloudKit.getData(album_id, "albums", {
        include: ["spotlight", "latest"],
      }),
    enabled: !!album_id,
    retry: false,
    refetchOnWindowFocus: false,
  });
  if (!album_id)
    return <p className="text-[--systemSecondary]">No album found.</p>;
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
  return album && <Album data={album} />;
}

