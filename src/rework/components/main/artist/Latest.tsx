import { SoundCloudArtist, SoundCloudTrack } from "@/lib/types/soundcloud";
import style from "./Artist.module.css";
import Image from "next/image";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import Link from "next/link";

export const Latest = ({ artist }: { artist: SoundCloudArtist | null }) => {
  const latestTracks = artist?.latest || [];
  const latest = latestTracks.find((item) => item.type === "track");
  if (!latest) return null;
  const track = latest.track as SoundCloudTrack;
  const HD_ARTWORK = track.artwork_url
    ? track.artwork_url.replace("-large.jpg", "-t500x500.jpg")
    : PLACEHOLDER_IMAGE.dark.url;
  return (
    <div className={style.Shelf} style={{ width: "fit-content" }}>
      <div className={style.ShelfHeader}>
        <button>
          <h1>Latest</h1>
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", width: "15rem" }}>
        <div className={style.Artwork}>
          <Image
            src={HD_ARTWORK }
            fill
            draggable={false}
            alt={track.title}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className={style.LatestInfo}>
          <DateDisplay className={style.Date} date={track.display_date} />
          <Link
            passHref
            id="song-link"
            href={`/song/${track.permalink}/${track?.id}`}
            className="flex gap-1 items-center"
          >
            <button className="hover:underline text-left">{track.title}</button>
            {!track.publisher_metadata?.explicit && (
              <span className="text-[#aeaeae]">🅴</span>
            )}
          </Link>
          <Link
            id="artist-link"
            href={`/artist/${artist?.permalink}/${artist?.id}`}
            className="hover:underline"
          >
            {track.publisher_metadata?.artist}
          </Link>
        </div>
      </div>
    </div>
  );
};

const DateDisplay = ({
  date,
  className,
}: {
  date: string;
  className?: string;
}) => {
  const dateObj = new Date(date);
  return (
    <time dateTime={date}>
      <span
        className={className}
        title={dateObj.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      >
        {dateObj
          .toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
          .toUpperCase()}
      </span>
    </time>
  );
};
