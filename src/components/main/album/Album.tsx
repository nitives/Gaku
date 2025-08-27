import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { SoundCloudAlbum } from "@/lib/types/soundcloud";
import { usePlaylistFetcher } from "@/lib/audio/play";
import style from "./Album.module.css";
import Image from "next/image";
import { memo, useCallback, useMemo } from "react";
import { useAudioStore } from "@/context/AudioContext";
import { IoPlay } from "react-icons/io5";
import { PiShuffleBold } from "react-icons/pi";
import { Spinner } from "../../extra/Spinner";
import { Song } from "@/lib/audio/types";
import ContextMenu from "../../contextmenus/ContextMenu";
import { PrefetchLink } from "../../navigation/PrefetchLink";
import { useUser } from "@/hooks/useUser";
import { LikeFilledIcon } from "../../player/new/PlayerBar";

export const Album = ({ data }: { data: SoundCloudAlbum }) => {
  if (!data) return <Spinner />;
  return (
    <div className="pb-20 p-4">
      <AlbumHeader data={data} />
      <SongList data={data.tracks} />
    </div>
  );
};

const AlbumHeader = ({ data }: { data: SoundCloudAlbum }) => {
  const HD_ARTWORK = data.artwork_url
    ? data.artwork_url.replace("-large.jpg", "-t500x500.jpg")
    : PLACEHOLDER_IMAGE.dark.url;
  return (
    <div className={style.AlbumHeader}>
      <div className={style.AlbumArtwork}>
        <Image
          src={HD_ARTWORK}
          alt={data.title || "Album artwork"}
          fill
          draggable={false}
          layout="fill"
        />
      </div>
      <AlbumInfoNControls data={data} />
    </div>
  );
};

const AlbumInfoNControls = ({ data }: { data: SoundCloudAlbum }) => {
  const { handleFetchPlaylist, shufflePlaylist } = usePlaylistFetcher();
  return (
    <div className={style.AlbumInfoNControls}>
      <div className={style.AlbumInfo}>
        <h1 className={style.AlbumTitle}>{data.title}</h1>
        <PrefetchLink
          href={`/artist/${data.user.permalink}/${data.user.id}`}
          className={style.AlbumArtist}
        >
          {data.user.username}
        </PrefetchLink>

        <span className={style.AlbumGenreNYear}>
          <p>{data.genre}</p>
          {" · "}
          <time dateTime={data.created_at} title={formatDate(data.created_at)}>
            {formatDate(data.created_at, "year")}
          </time>
        </span>
      </div>
      <div className={style.Controls}>
        <button onClick={() => handleFetchPlaylist(data.permalink_url)}>
          <IoPlay />
          Play
        </button>
        <button onClick={() => shufflePlaylist(data.permalink_url)}>
          <PiShuffleBold />
          Shuffle
        </button>
      </div>
    </div>
  );
};

// Convert SoundCloud track to Song format
const convertTrackToSong = (track: any): Song => {
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
      hdUrl: track.artwork_url
        ? track.artwork_url.replace("-large", "-t500x500")
        : "",
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

const SongList = ({ data }: { data: SoundCloudAlbum["tracks"] }) => {
  // grab only the stable action; do NOT subscribe to currentSong here
  const setQueue = useAudioStore((s) => s.setQueue);
  const { librarySongs } = useUser(); // this will no longer rerun due to currentSong changes

  // build a fast lookup once (or whenever user’s library changes)
  const likedIds = useMemo(
    () => new Set((librarySongs ?? []).map((s) => String(s?.id))),
    [librarySongs]
  );

  const handlePlayFromIndex = useCallback(
    async (index: number) => {
      try {
        const tracksFromIndex = data.slice(index);
        const songsToPlay = tracksFromIndex.map(convertTrackToSong);
        await setQueue(songsToPlay);
      } catch (err) {
        console.error("Failed to play song from album:", err);
      }
    },
    [data, setQueue]
  );

  return (
    <div className={style.SongList}>
      {data.map((track, index) => (
        <SongRow
          key={track.id}
          track={track}
          index={index}
          liked={likedIds.has(String(track.id))}
          onClick={() => handlePlayFromIndex(index)}
        />
      ))}
    </div>
  );
};

// Small row component that subscribes ONLY to the playing id.
// Only the previously-playing and newly-playing rows re-render on change.
const SongRow = memo(function SongRow({
  track,
  index,
  liked,
  onClick,
}: {
  track: SoundCloudAlbum["tracks"][number];
  index: number;
  liked: boolean;
  onClick: () => void;
}) {
  const isCurrent = useAudioStore((s) => s.currentSong?.id === track.id);

  return (
    <ContextMenu
      title={track.title}
      className={style.Song}
      as="div"
      type="song"
      itemId={String(track.id)}
    >
      <div
        onClick={onClick}
        className={style.SongIndex}
        style={{
          color: isCurrent ? "var(--keyColor)" : "var(--systemSecondary)",
        }}
      >
        {index + 1}
      </div>
      <div className={style.SongInfo}>
        <h3 className={style.SongTitle}>{track.title}</h3>
      </div>
      <div className="pr-1.5">{liked ? <LikeFilledIcon /> : null}</div>
    </ContextMenu>
  );
});

function formatDate(dateString: string | number | Date, format = "full") {
  const date = new Date(dateString);
  if (format === "year") {
    return date.getFullYear().toString();
  }
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}
