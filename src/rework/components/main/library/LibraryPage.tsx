"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { SoundCloudKit } from "@/lib/audio/fetchers";
import type { SoundCloudTrack } from "@/lib/types/soundcloud";
import { Spinner } from "@/rework/components/extra/Spinner";
import { LibraryItem } from "@/rework/components/main/library/LibraryItem";
import style from "../../../../rework/components/main/library/Library.module.css";
import { AnimatePresence, motion } from "framer-motion";

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
        <EmptyLibrary />
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

type Note = {
  id: number;
  x: number;
  y: number;
  pathIndex: number;
  scale: number;
  rotation: number;
};

const EmptyLibrary = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  // Music note SVG paths
  const notePaths = [
    "M12,5V12.5C11.15,12.17 10.2,12 9.2,12C6.22,12 3.8,13.95 3.8,16.3C3.8,18.65 6.22,20.6 9.2,20.6C12.18,20.6 14.6,18.65 14.6,16.3V8.2H18.6V5H12Z",
    "M16,9H13V14.5C12.35,14.17 11.53,14 10.6,14C7.67,14 5.3,15.67 5.3,17.7C5.3,19.73 7.67,21.4 10.6,21.4C13.55,21.4 15.9,19.73 15.9,17.7V12H18.9V9H16Z",
    "M12,3V13.55C11.41,13.21 10.73,13 10,13C7.79,13 6,14.79 6,17C6,19.21 7.79,21 10,21C12.21,21 14,19.21 14,17V7H18V3H12Z",
  ];

  const particles = () => {
    // Create 8 random notes
    const newNotes = Array.from({ length: 1 }).map((_, i) => ({
      id: Date.now() + i,
      x: 0,
      y: 0,
      pathIndex: Math.floor(Math.random() * notePaths.length),
      scale: 0.5 + Math.random() * 0.5,
      rotation: Math.random() * 360,
    }));

    setNotes([...notes, ...newNotes]);

    // Clean up old notes
    setTimeout(() => {
      setNotes((prev) => prev.filter((note) => note.id !== newNotes[0].id));
    }, 2000);
  };

  return (
    <div className="text-center flex flex-col items-center justify-end h-[50vh] relative overflow-hidden">
      <div>
        <li className="flex h-10 w-[7.5rem] p-1 gap-0.5 bg-white/10 rounded-lg">
          <motion.div
            onClick={particles}
            className="h-full w-10 aspect-square rounded-[4px] transition-all bg-white/10 active:scale-95 cursor-pointer"
            whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
            whileTap={{ scale: 0.95 }}
          />
          <AnimatePresence>
            {notes.map((note) => (
              <motion.svg
                key={note.id}
                viewBox="0 0 24 24"
                className="absolute h-6 w-6 text-[--systemSecondary] fill-current z-10"
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 0,
                  scale: note.scale,
                  rotate: note.rotation,
                }}
                animate={{
                  x: (Math.random() - 0.5) * 200,
                  y: -100 - Math.random() * 100,
                  opacity: [0, 1, 0],
                  rotate: note.rotation + (Math.random() > 0.5 ? 180 : -180),
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.5 + Math.random(),
                  ease: "easeOut",
                }}
              >
                <path d={notePaths[note.pathIndex]} />
              </motion.svg>
            ))}
          </AnimatePresence>
          <div className="grid w-full gap-0.5">
            <div className="size-full bg-white/10 rounded-[4px]" />
            <div className="h-3/4 w-1/2 bg-white/10 rounded-[4px]" />
          </div>
        </li>
      </div>
      <h2 className="text-lg opacity-75">Your library is empty</h2>
      <p className="text-[--systemSecondary] w-60">
        Add some songs to your library to see them here.
      </p>
    </div>
  );
};
