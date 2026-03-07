"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { IoPlay } from "react-icons/io5";
import { useHomeSections } from "@/hooks/useHomeSections";
import { usePlaylistFetcher } from "@/lib/audio/play";
import { useAudioStore } from "@/context/AudioContext";
import {
  getRecentlyPlayed,
  useRecentlyPlayedTracker,
  type RecentlyPlayedItem,
} from "@/hooks/useRecentlyPlayed";
import type { SoundCloudSections } from "@/lib/types/soundcloud";
import { Spinner } from "../../extra/Spinner";
import { TryAgain } from "../../extra/TryAgain";
import { PrefetchLink } from "../../navigation/PrefetchLink";
import { useThemedPlaceholder } from "@/lib/utils/themedPlaceholder";
import style from "./Sections.module.css";

/* ── Chevron ─────────────────────────────────────────────────── */
const Chevron = () => (
  <svg
    className={style.shelfChevron}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    aria-hidden="true"
  >
    <path d="M19.817 61.863c1.48 0 2.672-.515 3.702-1.546l24.243-23.63c1.352-1.385 1.996-2.737 2.028-4.443 0-1.674-.644-3.09-2.028-4.443L23.519 4.138c-1.03-.998-2.253-1.513-3.702-1.513-2.994 0-5.409 2.382-5.409 5.344 0 1.481.612 2.833 1.739 3.96l20.99 20.347-20.99 20.283c-1.127 1.126-1.739 2.478-1.739 3.96 0 2.93 2.415 5.344 5.409 5.344Z" />
  </svg>
);

/* ── Generic shelf card ──────────────────────────────────────── */
interface ShelfCardProps {
  id: string | number;
  title: string;
  subtitle?: string;
  artworkUrl: string;
  href: string;
  explicit?: boolean;
  round?: boolean;
  onPlay?: () => void;
  placeholder: string;
}

const ShelfCard = ({
  title,
  subtitle,
  artworkUrl,
  href,
  explicit,
  round,
  onPlay,
  placeholder,
}: ShelfCardProps) => (
  <li className={style.card}>
    <PrefetchLink
      href={href}
      className={`${style.cardArtwork}${round ? ` ${style.cardArtworkRound}` : ""}`}
    >
      <Image
        fill
        sizes="180px"
        src={artworkUrl || placeholder}
        alt={title}
        draggable={false}
      />
      {onPlay && (
        <div className={style.cardOverlay}>
          <button
            className={style.playBtn}
            aria-label={`Play ${title}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPlay();
            }}
          >
            <IoPlay size={16} style={{ marginLeft: 2 }} />
          </button>
        </div>
      )}
    </PrefetchLink>
    <div className={style.cardInfo}>
      <div className={style.cardTitleRow}>
        <span className={style.cardTitle}>{title}</span>
        {explicit && <span className={style.explicitBadge}>E</span>}
      </div>
      {subtitle && <span className={style.cardSubtitle}>{subtitle}</span>}
    </div>
  </li>
);

/* ── Recently Played shelf ───────────────────────────────────── */
const RecentlyPlayedShelf = ({ placeholder }: { placeholder: string }) => {
  useRecentlyPlayedTracker();
  const addToQueue = useAudioStore((s) => s.addToQueue);
  const setQueue = useAudioStore((s) => s.setQueue);
  const [items, setItems] = useState<RecentlyPlayedItem[]>([]);

  useEffect(() => {
    setItems(getRecentlyPlayed());
  }, []);

  // Refresh when a new song finishes playing
  const currentSongId = useAudioStore((s) => s.currentSong?.id);
  useEffect(() => {
    setItems(getRecentlyPlayed());
  }, [currentSongId]);

  if (items.length === 0) return null;

  return (
    <div className={style.shelf}>
      <div className={style.shelfHeader}>
        <button>
          <h2>Recently Played</h2>
        </button>
      </div>
      <div className="px-4">
        <ul className={style.shelfScroll}>
          {items.map((item) => (
            <ShelfCard
              key={`${item.id}-${item.playedAt}`}
              id={item.id}
              title={item.title}
              subtitle={item.subtitle}
              artworkUrl={item.artworkUrl}
              href={item.href}
              explicit={item.explicit}
              placeholder={placeholder}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

/* ── SC section shelf ────────────────────────────────────────── */
type SCItem =
  SoundCloudSections["collection"][number]["items"]["collection"][number];

const fmt = new Intl.NumberFormat("en-US", {
  notation: "compact",
  compactDisplay: "short",
});

const SectionShelf = ({
  section,
  placeholder,
}: {
  section: SoundCloudSections["collection"][number];
  placeholder: string;
}) => {
  const { handleFetchPlaylist } = usePlaylistFetcher();

  const getHref = (item: SCItem) => {
    if (item.kind === "user") return `/artist/${item.permalink}/${item.id}`;
    if (item.set_type === "album") return `/album/${item.permalink}/${item.id}`;
    return `/playlist/${item.id}`;
  };

  const getArtwork = (item: SCItem) =>
    item.kind === "user"
      ? (item.avatar_url_hd ?? item.avatar_url ?? placeholder)
      : (item.artwork_url_hd ?? item.artwork_url ?? placeholder);

  const getSubtitle = (item: SCItem) =>
    item.kind === "user"
      ? `${fmt.format(item.followers_count)} followers`
      : (item.user?.username ?? "");

  return (
    <div className={style.shelf}>
      <div className={style.shelfHeader}>
        <Link href={`/rooms/${section.tracking_feature_name}`}>
          <h2>{section.title}</h2>
          <Chevron />
        </Link>
      </div>
      <div className="px-4">
        <ul className={style.shelfScroll}>
          {section.items.collection.map((item) => (
            <ShelfCard
              key={item.id}
              id={item.id}
              title={
                item.kind === "user"
                  ? (item.username ?? item.title)
                  : item.title
              }
              subtitle={getSubtitle(item)}
              artworkUrl={getArtwork(item)}
              href={getHref(item)}
              round={item.kind === "user"}
              placeholder={placeholder}
              onPlay={
                item.kind !== "user"
                  ? () => handleFetchPlaylist(item.permalink_url)
                  : undefined
              }
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

/* ── Root ────────────────────────────────────────────────────── */
export const Sections = () => {
  const { data, isLoading, error, refetch } = useHomeSections();
  const placeholder = useThemedPlaceholder();

  if (isLoading && !data) return <Spinner />;
  if (error)
    return (
      <TryAgain
        errorMessage={(error as Error).message}
        errorName={(error as Error).name}
        onTryAgain={() => refetch()}
      />
    );

  return (
    <div className={style.sectionsRoot}>
      <RecentlyPlayedShelf placeholder={placeholder} />
      {data?.collection.map((section) => (
        <SectionShelf
          key={section.urn}
          section={section}
          placeholder={placeholder}
        />
      ))}
    </div>
  );
};
