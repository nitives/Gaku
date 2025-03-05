"use client";
import { Banner } from "@/rework/components/main/artist/banner/Banner";
import { Spotlight } from "@/rework/components/main/artist/Spotlight";
import { Latest } from "@/rework/components/main/artist/Latest";
import { Spinner } from "@/rework/components/extra/Spinner";
import { SoundCloudArtist } from "@/lib/types/soundcloud";
import { TryAgain } from "@/app/(new_pages)/search/page";
import { SoundCloudKit } from "@/lib/audio/fetchers";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

async function fetchArtistData(artistId: string, _artistName: string) {
  const data = (await SoundCloudKit.getData(artistId, "artist", {
    include: ["spotlight", "latest"],
  })) as SoundCloudArtist;
  return data;
}

const soundCloudOfficial = ["music-charts-us"];

export default function ArtistPage() {
  const { artist_name, artist_id } = useParams() as {
    artist_name: string;
    artist_id: string;
  };
  const {
    data: artist,
    isLoading,
    error,
    refetch,
  } = useQuery<SoundCloudArtist>({
    queryKey: ["soundcloud_artist", artist_id],
    queryFn: () => fetchArtistData(artist_id, artist_name),
    // only run if artist_id is truthy
    enabled: !!artist_id,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  if (soundCloudOfficial.includes(artist_name)) {
    return (
      <p className="text-[--systemSecondary]">
        This type of artist page is unavailable
      </p>
    );
  }

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <TryAgain
        errorName={(error as Error).name}
        errorMessage={(error as Error).message}
        onTryAgain={() => refetch()}
      />
    );
  }

  if (!artist) {
    return <p className="text-[--systemSecondary]">No artist found.</p>;
  }

  return (
    <>
      <Banner artist={artist} />
      <div className="flex pb-12">
        <Latest artist={artist} />
        <Spotlight artist={artist} />
      </div>
    </>
  );
}
