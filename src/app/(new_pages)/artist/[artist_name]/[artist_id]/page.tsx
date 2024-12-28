"use client";
import { SoundCloudKit } from "@/lib/audio/fetchers";
import { SoundCloudArtist } from "@/lib/types/soundcloud";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Banner } from "@/rework/components/main/artist/banner/Banner";
import { Spotlight } from "@/rework/components/main/artist/Spotlight";
import { Latest } from "@/rework/components/main/artist/Latest";

export default function ArtistPage() {
  const { artist_name, artist_id } = useParams() as {
    artist_name: string;
    artist_id: string;
  };
  const [artist, setArtist] = useState<SoundCloudArtist | null>(null);
  useEffect(() => {
    const fetchArtist = async () => {
      const data = (await SoundCloudKit.getData(artist_id, "artist", {
        include: ["spotlight", "latest"],
      })) as SoundCloudArtist;
      console.log("Artist Data", data);
      setArtist(data);
    };
    fetchArtist();
  }, [artist_id]);

  if (!artist) {
    return <div>Loading..</div>;
  }

  return (
    <div>
      <Banner artist={artist} />
      <Latest artist={artist} />
      <Spotlight artist={artist} />
      {/* <h2>Artist Username: {artist.username}</h2>
      <h2>Artist ID: {artist_id}</h2>
      <Link
        href={{
          pathname: `/artist/${artist_name}/${artist_id}/see-all`,
          query: { section: "full-albums" },
        }}
      >
        See All Full Albums {`>`}
      </Link> */}
    </div>
  );
}
