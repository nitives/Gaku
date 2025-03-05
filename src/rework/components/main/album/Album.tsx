import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { SoundCloudAlbum } from "@/lib/types/soundcloud";
import { usePlaylistFetcher } from "@/lib/audio/play";
import style from "./Album.module.css";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import { useAudioStoreNew } from "@/context/AudioContextNew";
import { IoPlay } from "react-icons/io5";
import { PiShuffleBold } from "react-icons/pi";
import { Spinner } from "../../extra/Spinner";
import { Song } from "@/lib/audio/types";

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
        <Link
          href={`/artist/${data.user.permalink}/${data.user.id}`}
          className={style.AlbumArtist}
        >
          {data.user.username}
        </Link>

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
  const { setQueue } = useAudioStoreNew();
  const { currentSong } = useAudioStoreNew();

  const handlePlayFromIndex = async (index: number) => {
    try {
      // Create a queue starting from the clicked song
      const tracksFromIndex = data.slice(index);
      const songsToPlay = tracksFromIndex.map((track) =>
        convertTrackToSong(track)
      );

      // Set the queue with these songs
      await setQueue(songsToPlay);
    } catch (error) {
      console.error("Failed to play song from album:", error);
    }
  };

  return (
    <div className={style.SongList}>
      {data.map((track, index) => (
        <div key={track.id} className={style.Song}>
          <div
            onClick={() => handlePlayFromIndex(index)}
            className={style.SongIndex}
            style={{
              color:
                currentSong?.id === track.id
                  ? "var(--keyColor)"
                  : "var(--systemSecondary)",
            }}
          >
            {index + 1}
          </div>
          <div className={style.SongInfo}>
            <h3 className={style.SongTitle}>{track.title}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

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
