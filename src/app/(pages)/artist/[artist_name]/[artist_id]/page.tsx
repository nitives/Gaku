"use client";
import { Banner } from "@/components/main/artist/banner/Banner";
import { Spotlight } from "@/components/main/artist/Spotlight";
import { Latest } from "@/components/main/artist/Latest";
import { Spinner } from "@/components/extra/Spinner";
import { SoundCloudArtist } from "@/lib/types/soundcloud";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { TryAgain } from "@/components/extra/TryAgain";
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
