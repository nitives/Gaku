"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { SoundCloudKit } from "@/lib/audio/fetchers";
import type { SoundCloudTrack } from "@/lib/types/soundcloud";
import { Spinner } from "@/rework/components/extra/Spinner";
import { LibraryItem } from "@/rework/components/main/library/LibraryItem";
import style from "../../../../rework/components/main/library/Library.module.css";

export default function LibrarySongs() {
  const { librarySongs, isLoading, error, addSongToLibrary } = useUser();
  const [scTracks, setSCTracks] = useState<SoundCloudTrack[]>([]);

  useEffect(() => {
    // If we have no librarySongs or still loading from DB, skip
    if (!librarySongs) return;
    if (librarySongs.length === 0) {
      // If the user has no songs in their library, no need to fetch SC data
      setSCTracks([]);
      return;
    }
    // Sort library songs by createdAt (descending: newest first)
    const sorted = [...librarySongs].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    // Build comma-separated ID list
    // Fetch each track individually
    const fetchTracks = async () => {
      try {
        const trackPromises = sorted.map((song) =>
          SoundCloudKit.getData(song.id, "songs")
        );
        const results = await Promise.all(trackPromises);
        setSCTracks(results);
      } catch (err) {
        console.error("Failed to fetch SoundCloud data:", err);
        setSCTracks([]);
      }
    };

    fetchTracks();
  }, [librarySongs]);

  // Merge DB songs + SC data
  const sortedLibrarySongs = [...(librarySongs ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const merged = sortedLibrarySongs.map((dbSong) => {
    const scTrack = scTracks.find(
      (track) => track.id === parseInt(dbSong.id, 10)
    );
    return {
      ...dbSong,
      scTrack,
    };
  });

  if (isLoading) return <Spinner />;
  if (error) return <div>Error: {(error as Error).message}</div>;

  const handleAddSong = async () => {
    try {
      await addSongToLibrary("1996361439");
      console.log("Song added successfully");
    } catch (err) {
      console.error("Failed to add song:", err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Library</h2>
      {merged.length === 0 ? (
        <div className="text-[--systemSecondary]">Library is empty</div>
      ) : (
        <ul className={style.libraryList}>
          {merged.map((item) => (
            <LibraryItem key={item.id} item={item} allItems={merged} />
          ))}
        </ul>
      )}
    </div>
  );
}
