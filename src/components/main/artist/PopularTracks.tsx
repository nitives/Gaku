"use client";
import { memo, useCallback, useMemo } from "react";
import Image from "next/image";
import { SoundCloudArtist, SoundCloudTrack } from "@/lib/types/soundcloud";
import { useAudioStore } from "@/context/AudioContext";
import { useUser } from "@/hooks/useUser";
import { LikeFilledIcon } from "@/components/player/new/PlayerBar";
import ContextMenu from "@/components/contextmenus/ContextMenu";
import { Song } from "@/lib/audio/types";
import style from "./Artist.module.css";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

const convertTrackToSong = (track: SoundCloudTrack): Song => ({
  albumName: track.publisher_metadata?.album_title || "",
  artist: {
    id: track.user?.id || -1,
    name: track.user?.username || "",
    url: `/artist/${track.user?.permalink}/${track.user?.id}`,
    soundcloudURL: track.user?.permalink_url || "",
    permalink: track.user?.permalink || "",
    verified: false,
    followers: 0,
    city: "",
    avatar: track.user?.avatar_url || "",
  },
  metadata: {
    artistName: track.publisher_metadata?.artist || "",
    albumTitle: track.publisher_metadata?.album_title || "",
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
  explicit: track.publisher_metadata?.explicit || false,
  src: "",
});

export const PopularTracks = ({
  artist,
}: {
  artist: SoundCloudArtist | null;
}) => {
  const setQueue = useAudioStore((s) => s.setQueue);
  const { librarySongs } = useUser();

  const tracks = useMemo(
    () => artist?.popularTracks || [],
    [artist?.popularTracks],
  );

  const likedIds = useMemo(
    () => new Set((librarySongs ?? []).map((s) => String(s?.id))),
    [librarySongs],
  );

  const handlePlayFromIndex = useCallback(
    async (index: number) => {
      const tracksFromIndex = tracks.slice(index);
      await setQueue(tracksFromIndex.map(convertTrackToSong));
    },
    [tracks, setQueue],
  );

  if (!tracks.length) return null;

  return (
    <div className={style.Shelf}>
      <div className={style.ShelfHeader}>
        <button>
          <h1>Popular Tracks</h1>
        </button>
      </div>
      <div className={style.PopularList}>
        {tracks.slice(0, 10).map((track, index) => (
          <PopularTrackRow
            key={track.id}
            track={track}
            index={index}
            liked={likedIds.has(String(track.id))}
            onClick={() => handlePlayFromIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

const PopularTrackRow = memo(function PopularTrackRow({
  track,
  index,
  liked,
  onClick,
}: {
  track: SoundCloudTrack;
  index: number;
  liked: boolean;
  onClick: () => void;
}) {
  const isCurrent = useAudioStore((s) => s.currentSong?.id === track.id);
  const artworkUrl = track.artwork_url
    ? track.artwork_url.replace("-large", "-t200x200")
    : PLACEHOLDER_IMAGE.dark.url;

  return (
    <ContextMenu
      title={track.title}
      className={style.PopularTrack}
      as="div"
      type="song"
      itemId={String(track.id)}
    >
      <div
        onClick={onClick}
        className={style.PopularTrackIndex}
        style={{
          color: isCurrent ? "var(--keyColor)" : "var(--systemSecondary)",
        }}
      >
        {index + 1}
      </div>
      <div className={style.PopularTrackArtwork} onClick={onClick}>
        <Image
          src={artworkUrl}
          alt={track.title}
          fill
          sizes="40px"
          draggable={false}
        />
      </div>
      <div className={style.PopularTrackInfo} onClick={onClick}>
        <h3
          className={style.PopularTrackTitle}
          style={{ color: isCurrent ? "var(--keyColor)" : undefined }}
        >
          {track.title}
        </h3>
        {!!track.playback_count && (
          <span className={style.TrackMeta}>
            {formatCount(track.playback_count)} plays
          </span>
        )}
      </div>
      <div className="pr-1.5">{liked ? <LikeFilledIcon /> : null}</div>
    </ContextMenu>
  );
});
