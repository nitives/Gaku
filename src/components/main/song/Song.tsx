import Image from "next/image";
import React from "react";
import style from "./Song.module.css";
import { IoPlay } from "react-icons/io5";
import { PiQueueFill } from "react-icons/pi";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { SoundCloudTrack } from "@/lib/types/soundcloud";
import { Song as PlayerSong } from "@/lib/audio/types";
import { useAudioStore } from "@/context/AudioContext";
import { PrefetchLink } from "@/components/navigation/PrefetchLink";

export const Song = ({ data }: { data: SoundCloudTrack }) => {
  if (!data) return null;
  return (
    <div className="pb-20 p-4">
      <SongHeader data={data} />
    </div>
  );
};

const SongHeader = ({ data }: { data: SoundCloudTrack }) => {
  const HD_ARTWORK = data.artwork_url
    ? data.artwork_url.replace("-large.jpg", "-t500x500.jpg")
    : PLACEHOLDER_IMAGE.dark.url;
  return (
    <div className={style.SongHeader}>
      <div className={style.SongArtwork}>
        <Image
          src={HD_ARTWORK}
          alt={data.title || "Song artwork"}
          fill
          draggable={false}
          layout="fill"
        />
      </div>
      <SongInfoNControls data={data} />
    </div>
  );
};

const SongInfoNControls = ({ data }: { data: SoundCloudTrack }) => {
  const { setQueue, addToQueue } = useAudioStore();

  const convertTrackToSong = (track: SoundCloudTrack): PlayerSong => {
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

  const song = convertTrackToSong(data);

  return (
    <div className={style.SongInfoNControls}>
      <div className={style.SongInfo}>
        <h1 className={style.SongTitle}>{data.title}</h1>
        <PrefetchLink
          href={`/artist/${data.user.permalink}/${data.user.id}`}
          className={style.SongArtist}
        >
          {data.user.username}
        </PrefetchLink>
        <span className={style.SongGenreNYear}>
          <p>{data.genre}</p>
          {" · "}
          <time dateTime={data.created_at} title={formatDate(data.created_at)}>
            {formatDate(data.created_at, "year")}
          </time>
        </span>
      </div>
      <div className={style.Controls}>
        <button onClick={() => setQueue([song])}>
          <IoPlay />
          Play
        </button>
        <button onClick={() => addToQueue([song])}>
          <PiQueueFill />
          Add to queue
        </button>
      </div>
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

export default Song;
