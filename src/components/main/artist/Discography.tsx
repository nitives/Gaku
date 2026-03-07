"use client";
import Image from "next/image";
import { SoundCloudArtist, SoundCloudAlbum } from "@/lib/types/soundcloud";
import style from "./Artist.module.css";
import { useRouter } from "next/navigation";
import { usePlaylistFetcher } from "@/lib/audio/play";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { useContextMenu } from "react-contexify";
import { IoPlay, IoEllipsisHorizontal } from "react-icons/io5";

function getYear(item: SoundCloudAlbum): string {
  const dateStr = item.release_date || item.display_date || item.created_at;
  if (!dateStr) return "";
  return String(new Date(dateStr).getFullYear());
}

function getTypeLabel(album: SoundCloudAlbum): string {
  if (album.set_type === "album") return "Album";
  if (album.set_type === "ep") return "EP";
  if (album.set_type === "single") return "Single";
  return "Playlist";
}

export const Discography = ({
  artist,
}: {
  artist: SoundCloudArtist | null;
}) => {
  const albums = artist?.albums || [];
  const router = useRouter();
  const { handleFetchPlaylist } = usePlaylistFetcher();

  if (!albums.length) return null;

  return (
    <div className={style.Shelf}>
      <div className={style.ShelfHeader}>
        <button>
          <h1>Discography</h1>
        </button>
      </div>
      <section>
        <ul className={style.DiscographyGrid}>
          {albums.map((album) => (
            <DiscographyCard
              key={album.id}
              album={album}
              onNavigate={() =>
                router.push(`/album/${album.permalink}/${album.id}`)
              }
              onPlay={() => handleFetchPlaylist(album.permalink_url)}
            />
          ))}
        </ul>
      </section>
    </div>
  );
};

const DiscographyCard = ({
  album,
  onNavigate,
  onPlay,
}: {
  album: SoundCloudAlbum;
  onNavigate: () => void;
  onPlay: () => void;
}) => {
  const year = getYear(album);
  const typeLabel = getTypeLabel(album);
  const { show } = useContextMenu({ id: "songMenu" });

  const artworkUrl = album.artwork_url
    ? album.artwork_url.replace("-large", "-t200x200")
    : PLACEHOLDER_IMAGE.dark.url;

  return (
    <li
      className={style.DiscographyCard}
      onContextMenu={(e) => {
        e.preventDefault();
        show({ event: e, props: { itemId: String(album.id) } });
      }}
    >
      <div className={style.DiscographyArtwork} onClick={onNavigate}>
        <Image
          src={artworkUrl}
          alt={album.title}
          fill
          sizes="140px"
          draggable={false}
        />
        <div className={style.DiscographyArtworkOverlay}>
          <button
            className={style.DiscographyPlayBtn}
            onClick={(e) => {
              e.stopPropagation();
              onPlay();
            }}
            aria-label={`Play ${album.title}`}
          >
            <IoPlay />
          </button>
          <button
            className={style.DiscographyMenuBtn}
            onClick={(e) => {
              e.stopPropagation();
              show({ event: e, props: { itemId: String(album.id) } });
            }}
            aria-label="More options"
          >
            <IoEllipsisHorizontal />
          </button>
        </div>
      </div>
      <ul onClick={onNavigate}>
        <li>{album.title}</li>
        <li className="h-4 flex items-center gap-1 text-sm text-[--systemSecondary]">
          <span>
            {typeLabel}
            {year ? ` · ${year}` : ""}
          </span>
        </li>
      </ul>
    </li>
  );
};
