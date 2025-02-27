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

export const Album = ({ data }: { data: SoundCloudAlbum }) => {
  if (!data) return <div>Loading...</div>;
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

const SongList = ({ data }: { data: SoundCloudAlbum["tracks"] }) => {
  const { handleFetchPlaylist } = usePlaylistFetcher();
  const { currentSong } = useAudioStoreNew();
  return (
    <div className={style.SongList}>
      {data.map((track, song) => (
        <div key={track.id} className={style.Song}>
          <div
            onClick={() => handleFetchPlaylist(track.id, true)}
            className={style.SongIndex}
            style={{
              color:
                currentSong?.id === track.id
                  ? "var(--keyColor)"
                  : "var(--systemSecondary)",
            }}
          >
            {song + 1}
          </div>
          <div className={style.SongInfo}>
            <h3 className={style.SongTitle}>{track.title}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};
