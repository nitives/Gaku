"use client";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { SoundCloudKit } from "@/lib/audio/fetchers";
import { SoundCloudArtist } from "@/lib/types/soundcloud";
import { dev } from "@/lib/utils";
import { Banner } from "@/rework/components/main/artist/banner/Banner";
import { Spotlight } from "@/rework/components/main/artist/Spotlight";
import { Latest } from "@/rework/components/main/artist/Latest";
import { TryAgain } from "@/app/(new_pages)/search/page";
import { Spinner } from "@/rework/components/extra/Spinner";

// 1) The fetch function
async function fetchArtistData(artistId: string, artistName: string) {
  // optional: add a 15s abort signal if you want
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
  if (soundCloudOfficial.includes(artist_name)) {
    return <div>This type of artist page is unavailable</div>;
  }
  const router = useRouter();

  // 2) Query with the artist_id as key
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

  // 3) If we have an artist, check route correctness
  useEffect(() => {
    if (!artist) return;
    if (artist.permalink && artist.permalink !== artist_name) {
      router.replace(`/artist/${artist.permalink}/${artist_id}`);
    }
    dev.log("ArtistPage | SoundCloudKit.getData =>", artist);
  }, [artist, artist_name, artist_id, router]);

  // 4) Render states
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
    return <div>No artist data found.</div>;
  }

  return (
    <div>
      <Banner artist={artist} />
      <div className="flex pb-12">
        <Latest artist={artist} />
        <Spotlight artist={artist} />
      </div>
    </div>
  );
}
