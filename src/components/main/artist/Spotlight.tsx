import Image from "next/image";
import style from "./Artist.module.css";
import { SoundCloudArtist } from "@/lib/types/soundcloud";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { usePlaylistFetcher } from "@/lib/audio/play";
import { useRouter } from "next/navigation";
import ContextMenu from "../../contextmenus/ContextMenu";

export const Spotlight = ({ artist }: { artist: SoundCloudArtist | null }) => {
  const songs = artist?.spotlight || [];
  const { handleFetchPlaylist } = usePlaylistFetcher();
  const router = useRouter();
  if (!songs.length) return null;
  return (
    <div className={style.Shelf}>
      <div className={style.ShelfHeader}>
        <button>
          <h1>Spotlight</h1>
        </button>
      </div>
      <section>
        <ul className={style.ShelfGrid}>
          {songs.map((song) => (
            <ShelfItem
              song={song}
              key={song.id}
              link={() =>
                router.push(
                  song.tracks
                    ? `/album/${song.permalink}/${song.id}`
                    : `/song/${song.permalink}/${song.id}`
                )
              }
              play={() =>
                handleFetchPlaylist(
                  song.tracks ? song.permalink_url : song.id,
                  !song.tracks
                )
              }
            />
          ))}
        </ul>
      </section>
    </div>
  );
};

export const ShelfItem: React.FC<{
  song: SoundCloudArtist["spotlight"][number];
  play?: () => void;
  link?: () => void;
}> = ({ song, play, link }) => {
  const isPlaylist = song.kind === "playlist";
  const year = getYear(song);
  let subtitle = "";
  if (song.tracks && song.tracks.length > 0) {
    subtitle = `Album · ${year}`;
  } else {
    if (isPlaylist) {
      if (song.set_type === "album") {
        subtitle = `Album · ${year}`;
      } else if (song.set_type === "ep") {
        subtitle = `EP · ${year}`;
      } else {
        subtitle = `${song.title} · ${year}`;
      }
    } else if (song.kind === "track") {
      subtitle = `${song.title} - Single · ${year}`;
    }
  }

  return (
    <ContextMenu
      title={song.title}
      className={style.ShelfItem}
      as={"button"}
      type="song"
      itemId={song.id}
      key={song.id}
    >
      <div>
        <div
          data-type={song.set_type}
          onClick={play}
          className={style.ShelfItemArtwork}
        >
          <Image
            style={{ aspectRatio: "1/1" }}
            src={
              song.tracks
                ? song.tracks[0].artwork_url
                : song.artwork_url_hd || PLACEHOLDER_IMAGE.dark.url
            }
            alt={song.title}
            fill
            draggable={false}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <ul onClick={link}>
          <li>{song.title}</li>
          <li>
            <span>{subtitle}</span>
          </li>
        </ul>
      </div>
    </ContextMenu>
  );
};

export function getYear(item: any) {
  // For playlists, 'release_date' is typically the album/EP’s release
  // For tracks, fallback to 'display_date' if there's no 'release_date'
  const dateStr = item.release_date || item.display_date;
  if (!dateStr) return ""; // or "Unknown Year"
  return new Date(dateStr).getFullYear();
}
