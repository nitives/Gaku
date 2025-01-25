import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { SoundCloudAlbum } from "@/lib/types/soundcloud";
import style from "../artist/Artist.module.css";
import Image from "next/image";
import React from "react";
import { usePlaylistFetcher } from "@/lib/audio/play";

export const SongList = ({ data }: { data: SoundCloudAlbum }) => {
  const { handleFetchPlaylist } = usePlaylistFetcher();
  if (!data) return <div>Loading...</div>;
  return (
    <div className="pb-20 px-4 pt-5">
      <h1 className="text-3xl font-bold">{data.title}</h1>
      <ul className="flex flex-col gap-2">
        {data.tracks.map((item) => {
          if (!item) return null;
          return (
            <li
              onClick={() => handleFetchPlaylist(item.id, true)}
              className="flex items-center gap-2 cursor-pointer"
              key={item.permalink}
            >
              <div className={style.ShelfItemArtwork}>
                <Image
                  style={{ aspectRatio: "1/1", userSelect: "none" }}
                  src={item.artwork_url || PLACEHOLDER_IMAGE.dark.url}
                  alt={item.title || "Track image"}
                  fill
                  draggable={false}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <h1>{item.title || "Untitled"}</h1>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
