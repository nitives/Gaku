import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  SoundCloudAlbum,
  SoundCloudArtist,
  SoundCloudSearchResult,
} from "@/lib/types/soundcloud";
import Link from "next/link";
import "./SearchDropDown.css";
import Image from "next/image";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { useUser } from "@/hooks/useUser";

interface SearchDropdownProps {
  results: SoundCloudSearchResult;
  typedQuery: string;
  setShowDropdown: (value: boolean) => void;
}

function highlightText(text: string, query: string) {
  if (!query.trim()) return text;

  // Escape any special regex chars in the query
  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Build a case-insensitive regex
  const regex = new RegExp(safeQuery, "gi");

  // Replace all matches with a <span> around them
  return text.replace(
    regex,
    (match) => `<p class="SearchDropdownHighlight">${match}</p>`
  );
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  results,
  typedQuery,
  setShowDropdown,
}) => {
  const { settings } = useUser();
  const formatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  });
  return (
    <AnimatePresence>
      <motion.ul
        key="search-dropdown"
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(10px)" }}
        className="search-hints is-visible"
        role="listbox"
        id="search-hints"
        aria-labelledby="search-header-form-input-label"
      >
        {results.small.collection.slice(0, 3).map((result, index) => (
          <Link
            href={`/search?q=${result.query}`}
            key={result.query + "-" + index}
            aria-selected="false"
            className="search-hint"
            role="option"
            tabIndex={0}
            onClick={() => {
              setShowDropdown(false);
            }}
          >
            <span className="flex flex-col">
              {settings?.highlightedQueries ? (
                <p
                  className="search-hint-text truncate"
                  // Dangerously set the HTML with the highlight
                  dangerouslySetInnerHTML={{
                    __html: highlightText(result.query, typedQuery),
                  }}
                />
              ) : (
                <p className="search-hint-text truncate">{result.query}</p>
              )}
            </span>
          </Link>
        ))}
        <div className="search-hint-divider" />
        {results.large.collection.slice(0, 3).map((result, index) => (
          <Link
            href={
              result.kind === "playlist"
                ? `/album/${result.permalink}/${result.id}`
                : result.kind === "user"
                ? `/artist/${result.permalink}/${result.id}`
                : `/song/${result.permalink}/${result.id}`
            }
            key={result.title + "-" + result.id}
            aria-selected="false"
            className="search-hint"
            role="option"
            tabIndex={0}
            onClick={() => {
              setShowDropdown(false);
            }}
          >
            {result.kind === "track" && (
              <div className="relative aspect-square overflow-hidden mr-2 rounded w-[50px] after:absolute after:inset-0 after:z-20 after:rounded after:ring-1 after:ring-inset after:ring-white/10 transition-shadow">
                <Image
                  height={50}
                  width={50}
                  src={result.artwork_url || PLACEHOLDER_IMAGE.dark.url}
                  alt={result.title || ""}
                  className="search-hint-image"
                  unoptimized={true}
                />
              </div>
            )}
            {result.kind === "playlist" && (
              <div className="relative aspect-square overflow-hidden mr-2 rounded w-[50px] after:absolute after:inset-0 after:z-20 after:rounded after:ring-1 after:ring-inset after:ring-white/10 transition-shadow">
                <Image
                  height={50}
                  width={50}
                  src={
                    (result as unknown as SoundCloudAlbum).tracks[0]
                      .artwork_url || PLACEHOLDER_IMAGE.dark.url
                  }
                  alt={result.title || ""}
                  className="search-hint-image"
                  unoptimized={true}
                />
              </div>
            )}
            {result.kind === "user" && (
              <div className="relative aspect-square overflow-hidden mr-2 rounded-full w-[50px] after:absolute after:inset-0 after:z-20 after:rounded after:ring-1 after:ring-inset after:ring-white/10 transition-shadow">
                <Image
                  height={50}
                  width={50}
                  src={
                    (result as unknown as SoundCloudArtist).avatar_url ||
                    PLACEHOLDER_IMAGE.dark.url
                  }
                  alt={(result as unknown as SoundCloudArtist).username || ""}
                  onError={(e) => {
                    e.currentTarget.src = PLACEHOLDER_IMAGE.dark.url;
                  }}
                  className="search-hint-image"
                  unoptimized={true}
                />
              </div>
            )}
            <span className="flex flex-col">
              <p className="search-hint-text truncate text-[--systemPrimary]">
                {result.kind === "user"
                  ? (result as unknown as SoundCloudArtist).username
                  : result.title}
              </p>
              <p className="search-hint-text text-[0.65rem]">
                {result.kind === "user"
                  ? formatter.format(
                      (result as unknown as SoundCloudArtist).followers_count
                    ) + " followers"
                  : result.user.username}
              </p>
            </span>
          </Link>
        ))}
      </motion.ul>
    </AnimatePresence>
  );
};

export default SearchDropdown;
