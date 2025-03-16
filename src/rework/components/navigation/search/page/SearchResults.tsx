"use client";
import React from "react";
import Image from "next/image";
import styles from "./SearchResults.module.css";
import { getYear } from "@/rework/components/main/artist/Spotlight";
import { useThemedPlaceholder } from "@/lib/utils/themedPlaceholder";
import { usePlaylistFetcher } from "@/lib/audio/play";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ContextMenu from "@/rework/components/contextmenus/ContextMenu";

type SoundCloudItem = {
  kind: string;
  id?: number | string;
  permalink?: string;
  permalink_url?: string;
  artwork_url?: string | null;
  avatar_url?: string | null;
  title?: string;
  username?: string;
  tracks?: Array<{ artwork_url: string }>;
  release_date?: string;
  display_date?: string;
  publisher_metadata: {
    id?: number;
    artist?: string;
    album_title?: string;
    // ...
    explicit?: boolean;
  };
  user?: {
    username: string;
  };
};

type FullData = {
  collection: SoundCloudItem[];
};

type SearchResultsProps = {
  data: {
    full: FullData;
  };
};

export default function SearchResults({ data }: SearchResultsProps) {
  const { handleFetchPlaylist } = usePlaylistFetcher();
  const router = useRouter();
  if (!data || !data.full || !data.full.collection) return null;

  let topArtist: SoundCloudItem | null = null;
  const topAlbums: SoundCloudItem[] = [];
  const songs: SoundCloudItem[] = [];
  const otherAlbums: SoundCloudItem[] = [];

  // Separate items into artist, albums, or tracks
  for (const item of data.full.collection) {
    if (item.kind === "user" && !topArtist) {
      topArtist = item;
    } else if (item.kind === "playlist") {
      if (topAlbums.length < 3) {
        topAlbums.push(item);
      } else {
        otherAlbums.push(item);
      }
    } else if (item.kind === "track") {
      songs.push(item);
    }
  }

  return (
    <div className={styles.searchResultsContainer}>
      {/* Top Results */}
      <h2 className={styles.sectionTitle}>Top Results</h2>
      <ul className={styles.topResultsWrapper}>
        {topArtist ? <ArtistCard item={topArtist} /> : null}
        {topAlbums.map((album, idx) => (
          <AlbumCard
            key={`top-album-${idx}`}
            item={album}
            onClick={() => router.push(`/album/${album.permalink}/${album.id}`)}
            // onPlay={() =>
            //   handleFetchPlaylist(album.permalink_url, false /* isID? */)
            // }
          />
        ))}
      </ul>

      {/* Songs */}
      {songs.length > 0 && (
        <>
          <h2 className={styles.sectionTitle}>Songs</h2>
          <div className={styles.cardsContainer}>
            {songs.map((song, idx) => (
              <SongCard
                key={`song-${idx}`}
                item={song}
                onPlay={() => handleFetchPlaylist(song.id, true /* isID */)}
              />
            ))}
          </div>
        </>
      )}

      {/* Additional Albums */}
      {otherAlbums.length > 0 && (
        <>
          <h2 className={styles.sectionTitle}>Albums</h2>
          <div className={styles.cardsContainer}>
            {otherAlbums.map((album, idx) => (
              <AlbumCard
                key={`album-${idx}`}
                item={album}
                // onClick={() => handleFetchPlaylist(album.permalink_url, false)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** Artist Card */
function ArtistCard({ item }: { item: SoundCloudItem }) {
  const avatar = item.avatar_url || "/placeholder-user.jpg";
  return (
    <li>
      <Link
        href={`/artist/${item.permalink}/${item.id}`}
        className={styles.artistCard}
      >
        <div className={styles.avatarWrapper}>
          <Image src={avatar} alt={item.username || "Artist"} fill />
        </div>
        <div title={item.username} className={styles.artistInfo}>
          <h1>{item.username}</h1>
          <p>Artist</p>
        </div>
      </Link>
    </li>
  );
}

/** Playlist/Album Card */
function AlbumCard({
  item,
  onClick,
}: {
  item: SoundCloudItem;
  onClick?: () => void;
}) {
  const THEMED_DEFAULT_IMAGE = useThemedPlaceholder();
  const artwork =
    item.artwork_url || item.tracks?.[0]?.artwork_url || THEMED_DEFAULT_IMAGE;
  const isPlaylist = item.kind === "playlist" ? false : true;
  return (
    <Link
      href={
        isPlaylist
          ? `/playlist/${item.id}`
          : `/album/${item.permalink}/${item.id}`
      }
      className={styles.albumCard}
    >
      <div onClick={onClick} className={styles.albumArtworkWrapper}>
        <Image
          src={artwork}
          alt={item.title || isPlaylist ? "Playlist" : "Album"}
          fill
        />
        <div className={styles.artworkOverlay} />
      </div>
      <div title={item.title} className={styles.albumInfo}>
        <h1>{item.title}</h1>
        <p>
          {isPlaylist ? "Playlist" : "Album"} ·{" "}
          {item.release_date || item.display_date ? getYear(item) : null}
        </p>
      </div>
    </Link>
  );
}

/** Track Card */
function SongCard({
  item,
  onPlay,
}: {
  item: SoundCloudItem;
  onPlay: () => void;
}) {
  const THEMED_DEFAULT_IMAGE = useThemedPlaceholder();
  const artwork = item.artwork_url || THEMED_DEFAULT_IMAGE;
  const artist = item.publisher_metadata?.artist || item.user?.username;

  return (
    <ContextMenu
      className={styles.songCard}
      as={"li"}
      type="song"
      title={item.title}
      itemId={String(item.id)}
    >
      <button onClick={onPlay} className={styles.songArtworkWrapper}>
        <Image
          src={artwork}
          alt={item.title || "Track"}
          width={150}
          height={150}
        />
      </button>
      <div className={styles.songInfo}>
        <span
          title={item.title}
          aria-label={`Name of the track: ${item.title}`}
          className="flex gap-1"
        >
          <h1>{item.title}</h1>
          {item.publisher_metadata?.explicit && (
            <span className="text-[#aeaeae]">🅴</span>
          )}
        </span>
        {artist && <p title={artist}>{artist}</p>}
      </div>
    </ContextMenu>
  );
}
