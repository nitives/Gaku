"use client";
import { SoundCloudKit } from "@/lib/audio/fetchers";
import { SoundCloudAlbum } from "@/lib/types/soundcloud";
import { dev } from "@/lib/utils";
import { SongList } from "@/rework/components/main/album/SongList";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Album() {
  const [album, setAlbum] = useState<SoundCloudAlbum | null>(null);
  const router = useRouter();
  const { album_title, album_id } = useParams() as {
    album_title: string;
    album_id: string;
  };
  useEffect(() => {
    const fetchAlbum = async () => {
      // 1) Fetch the album data with any includes
      const data = (await SoundCloudKit.getData(album_id, "albums", {
        include: ["spotlight", "latest"],
      })) as SoundCloudAlbum;
      // 2) Once we have the data, compare the route's album_title to the real 'permalink'
      if (data && data.title !== album_title) {
        // 3) Use router.replace to update the URL
        router.replace(`/album/${data.permalink}/${album_id}`);
      }
      dev.log("fetchAlbum | SoundCloudKit.getData", data);
      setAlbum(data);
    };
    fetchAlbum();
  }, [album_id, album_title]);
  return (
    <div>
      {/* <h2>Album ID: {album_id}</h2>
      <h2>Album Name: {decodeURIComponent(album_title)}</h2> */}
      {album && <SongList data={album} />}
    </div>
  );
}
