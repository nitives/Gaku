"use client";
import { SoundCloudKit } from "@/lib/audio/fetchers";
import { SoundCloudTrack } from "@/lib/types/soundcloud";
import { dev } from "@/lib/utils";
import { SongList } from "@/rework/components/main/album/SongList";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Song() {
  const [song, setSong] = useState<SoundCloudTrack | null>(null);
  const { song_title, song_id } = useParams() as {
    song_title: string;
    song_id: string;
  };
  useEffect(() => {
    const fetchSong = async () => {
      const data = (await SoundCloudKit.getData(
        song_id,
        "songs"
      )) as SoundCloudTrack;
      dev.log("fetchSong | SoundCloudKit.getData", data);
      setSong(data);
    };
    fetchSong();
  }, [song_id, song_title]);
  return <div>{song?.title}</div>;
}
