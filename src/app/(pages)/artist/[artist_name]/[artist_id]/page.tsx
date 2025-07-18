"use client";
import { Banner } from "@/rework/components/main/artist/banner/Banner";
import { Spotlight } from "@/rework/components/main/artist/Spotlight";
import { Latest } from "@/rework/components/main/artist/Latest";
import { Spinner } from "@/rework/components/extra/Spinner";
import { SoundCloudArtist } from "@/lib/types/soundcloud";
import { SoundCloudKit } from "@/lib/audio/fetchers";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { TryAgain } from "@/rework/components/extra/TryAgain";
import Link from "next/link";
import { fetchArtistData } from "@/lib/artist";

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
    queryKey: ["soundcloudArtist", artist_id],
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
      <div className="flex flex-col p-4 mb-20">
        <Link
          href={`/artist/${artist_name}/${artist_id}/see-all`}
          className="text-[--systemSecondary]"
        >
          See all
        </Link>
      </div>
    </>
  );
}
