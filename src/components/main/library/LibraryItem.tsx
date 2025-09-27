import { SoundCloudTrack } from "@/lib/types/soundcloud";
import style from "./Library.module.css";
import Image from "next/image";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import Link from "next/link";
import ContextMenu from "../../contextmenus/ContextMenu";
import { useAudioStore } from "@/context/AudioContext";
import { Song } from "@/lib/audio/types";

interface LibraryItem {
  scTrack: SoundCloudTrack | undefined;
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Convert SoundCloud track to Song format
const convertTrackToSong = (track: SoundCloudTrack): Song => {
  return {
    albumName: track.publisher_metadata
      ? (track.publisher_metadata as any).album_title || ""
      : "",
    artist: {
      id: track.user.id,
      name: track.user.username,
      url: `/artist/${track.user.permalink}/${track.user.id}`,
      soundcloudURL: track.user.permalink_url,
      permalink: track.user.permalink,
      verified: false,
      followers: 0,
      city: "",
      avatar: track.user.avatar_url,
    },
    metadata: {
      artistName: track.publisher_metadata
        ? (track.publisher_metadata as any).artist || ""
        : "",
      albumTitle: track.publisher_metadata
        ? (track.publisher_metadata as any).album_title || ""
        : "",
      isrc: track.publisher_metadata
        ? (track.publisher_metadata as any).isrc || ""
        : "",
    },
    artwork: {
      hdUrl: track.artwork_url?.replace("-large", "-t500x500") || "",
      url: track.artwork_url || "",
    },
    id: track.id,
    songHref: track.permalink_url,
    name: track.title,
    explicit: track.publisher_metadata
      ? track.publisher_metadata.explicit || false
      : false,
    src: "", // M3U8 will be fetched by the player
  };
};

export const LibraryItem = ({
  item,
  allItems,
  ref,
  ...liProps
}: {
  item: LibraryItem;
  allItems: LibraryItem[];
  ref?: React.Ref<HTMLElement>;
} & React.HTMLAttributes<HTMLElement>) => {
  const { setQueue } = useAudioStore();

  const handlePlay = async () => {
    if (!item.scTrack) return;
    try {
      const currentIndex = allItems.findIndex((i) => i.id === item.id);
      const relevantItems = allItems
        .slice(currentIndex)
        .filter((i) => i.scTrack);
      const songsToPlay = relevantItems.map((i) =>
        convertTrackToSong(i.scTrack!)
      );
      await setQueue(songsToPlay);
    } catch (error) {
      console.error("Failed to play song from library:", error);
    }
  };

  return (
    <ContextMenu
      as={"li"}
      ref={ref as React.Ref<any>}
      className={style.libraryItem}
      type="song"
      itemId={item.id}
      {...liProps}
    >
      <div
        className={style.image}
        onClick={handlePlay}
        role="button"
        aria-label={`Play ${item.scTrack?.title ?? "Unknown track"}`}
      >
        <Image
          src={item.scTrack?.artwork_url ?? PLACEHOLDER_IMAGE.dark.url}
          alt={item.scTrack?.title ?? "Track artwork"}
          fill
          draggable={false}
        />
      </div>
      <div className={style.details}>
        <h3>
          {item.scTrack?.title ?? "Unknown title"}
          {item.scTrack?.publisher_metadata?.explicit}
        </h3>
        <Link
          href={`/artist/${item.scTrack?.user.permalink}/${item.scTrack?.user.id}`}
        >
          {item.scTrack?.publisher_metadata?.artist ||
            item.scTrack?.user.username ||
            "Unknown artist"}
        </Link>
      </div>
    </ContextMenu>
  );
};
