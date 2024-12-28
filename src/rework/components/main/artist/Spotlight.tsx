import Image from "next/image";
import style from "./Artist.module.css";
import { SoundCloudArtist } from "@/lib/types/soundcloud";

const song = {
  title: "30 For 30 (with Kendrick Lamar)",
  album: "SOS Deluxe: LANA",
  cover:
    "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/97/bd/88/97bd8804-7d3e-e6c8-0532-ff22877b931c/196871766890.jpg/48x48bb.webp",
  year: "2024",
  explicit: true,
};

export const Spotlight = ({ artist }: { artist: SoundCloudArtist | null }) => {
  const songs = artist?.spotlight || [];
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
              key={song}
              onClick={() => console.log("Clicked the ShelfItem")}
            />
          ))}
        </ul>
      </section>
    </div>
  );
};

export const ShelfItem = ({
  song,
  onClick,
}: {
  song: SoundCloudArtist["spotlight"][number];
  onClick?: () => void;
}) => {
  const isPlaylist = song.kind === "playlist";
  const year = getYear(song);
  let subtitle = "";
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

  return (
    <li onClick={onClick} className={style.ShelfItem}>
      <div>
        <div className={style.ShelfItemArtwork}>
          <Image src={song.artwork_url_hd} alt={song.title} fill />
        </div>
        <ul>
          {/* Primary title can still be "song.title" or "song.title + more" depending on your design */}
          <li>{song.title}</li>
          {/* The second line uses our logic above */}
          <li>
            <span>{subtitle}</span>
          </li>
        </ul>
      </div>
    </li>
  );
};

function getYear(item: any) {
  // For playlists, 'release_date' is typically the album/EP’s release
  // For tracks, fallback to 'display_date' if there's no 'release_date'
  const dateStr = item.release_date || item.display_date;
  if (!dateStr) return ""; // or "Unknown Year"
  return new Date(dateStr).getFullYear();
}
