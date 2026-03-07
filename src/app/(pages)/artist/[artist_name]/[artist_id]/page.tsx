"use client";
import { Banner } from "@/components/main/artist/banner/Banner";
import { Spotlight } from "@/components/main/artist/Spotlight";
import { Latest } from "@/components/main/artist/Latest";
import { PopularTracks } from "@/components/main/artist/PopularTracks";
import { Discography } from "@/components/main/artist/Discography";
import { Spinner } from "@/components/extra/Spinner";
import { SoundCloudArtist } from "@/lib/types/soundcloud";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { TryAgain } from "@/components/extra/TryAgain";
import Link from "next/link";
import { fetchArtistData } from "@/lib/artist";
import { dev } from "@/lib/utils";

const soundCloudOfficial = ["music-charts-us"];

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

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
    enabled: !!artist_id,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  dev.log("[ARTIST] Data:", artist);

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

      {/* Stats row */}
      <div className="flex gap-3 px-4 pt-3 pb-1 text-xs text-[--systemSecondary]">
        {!!artist.followers_count && (
          <span>{formatCount(artist.followers_count)} followers</span>
        )}
        {!!artist.followers_count && !!artist.followings_count && (
          <span>·</span>
        )}
        {!!artist.followings_count && (
          <span>{formatCount(artist.followings_count)} following</span>
        )}
        {!!artist.track_count && (
          <>
            <span>·</span>
            <span>{artist.track_count} tracks</span>
          </>
        )}
      </div>

      <PopularTracks artist={artist} />
      <Discography artist={artist} />
      <Latest artist={artist} />
      <Spotlight artist={artist} />

      <div className="flex flex-col p-4 mb-20">
        <Link
          href={`/artist/${artist_name}/${artist_id}/see-all`}
          className="text-[--systemSecondary] text-sm"
        >
          See all tracks
        </Link>
      </div>
    </>
  );
}
