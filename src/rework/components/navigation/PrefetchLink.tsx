"use client";
import Link, { LinkProps } from "next/link";
import { PropsWithChildren, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SoundCloudKit } from "@/lib/audio/fetchers";
import { dev } from "@/lib/utils";
import { fetchArtistData } from "@/app/(pages)/artist/[artist_name]/[artist_id]/page";

interface PrefetchLinkProps extends LinkProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Checks if the href matches the /album route and extracts album_id
 */
function parseAlbum(href: string) {
  // Example path: /album/[album_title]/[album_id]
  // A quick approach: split on "/" and see if second segment is "album"
  // Then return the last segment as the albumId
  // You may want to handle edge cases or dynamic base paths differently
  const parts = href.split("/").filter(Boolean);
  if (parts[0] === "album" && parts[2]) {
    return parts[2]; // album_id is typically the 3rd chunk
  }
  return null;
}

/**
 * Checks if the href matches the /artist route and extracts artist_id
 */
function parseArtist(href: string) {
  // Example path: /artist/[artist_name]/[artist_id]
  // Split and filter out empty
  const parts = href.split("/").filter(Boolean);
  // We expect [0] = "artist", [1] = artist_name, [2] = artist_id
  if (parts[0] === "artist" && parts[1] && parts[2]) {
    return { artistName: parts[1], artistId: parts[2] };
  }
  return null;
}

export function PrefetchLink({
  href,
  className,
  children,
  style,
  ...rest
}: PropsWithChildren<PrefetchLinkProps>) {
  const queryClient = useQueryClient();

  const handleMouseEnter = useCallback(() => {
    if (typeof href !== "string") return;

    // Try to parse if user hovered an /album/ route
    const albumId = parseAlbum(href);
    if (albumId && albumId !== "undefined") {
      dev.log("Prefetching | Album ", href);
      // Matches the AlbumPage queryKey:
      // useQuery({ queryKey: ["soundcloudAlbum", album_id], queryFn: ... })
      queryClient.prefetchQuery({
        queryKey: ["soundcloudAlbum", albumId],
        queryFn: () =>
          SoundCloudKit.getData(albumId, "albums", {
            include: ["spotlight", "latest"],
          }),
      });
      dev.log("Prefetched album", albumId);
      return;
    }

    // Try to parse if user hovered an /artist/ route
    const parsedArtist = parseArtist(href);
    if (parsedArtist && parsedArtist.artistId !== "undefined") {
      dev.log("Prefetching | Artist ", href);
      // Matches the ArtistPage queryKey:
      // useQuery({ queryKey: ["soundcloudArtist", artistId], queryFn: ... })
      const { artistName, artistId } = parsedArtist;
      queryClient.prefetchQuery({
        queryKey: ["soundcloudArtist", artistId],
        queryFn: () => fetchArtistData(artistId, artistName),
      });
      return;
    }
    // Otherwise, do nothing for other routes
  }, [href, queryClient]);

  return (
    <Link
      {...rest}
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </Link>
  );
}
