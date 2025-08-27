"use client";
import { useRef, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { Spinner } from "@/components/extra/Spinner";
import { LibraryItem } from "@/components/main/library/LibraryItem";
import style from "@/components/main/library/Library.module.css";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { SoundCloudTrack } from "@/lib/types/soundcloud";
import { dev } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

export default function UserLikedSongs({ user }: { user: any }) {
  const { isLoading, error } = useUser();
  const parentRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(100); // Start with 100 items

  // Extract and transform liked tracks
  const likedTracks = user?.userLikes?.collection || [];
  const transformedTracks = likedTracks
    .filter((like: any) => like.track)
    .map((like: any) => ({
      id: like?.track.id.toString(),
      createdAt: like.created_at,
      updatedAt: like.created_at,
      scTrack: like.track as SoundCloudTrack,
    }));

  const rowVirtualizer = useVirtualizer({
    count: visibleCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Adjust item height estimation
    overscan: 10, // Load extra items for smooth scrolling
  });

  if (isLoading) return <Spinner />;
  if (error) return <div>Error: {(error as Error).message}</div>;

  dev.log("User", user);
  dev.log("Liked Tracks", likedTracks);
  dev.log("Transformed Tracks", transformedTracks);

  return (
    <div className="p-4 mb-14">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">
          Liked Songs
          <code
            title="Amount liked"
            className="bg-white/15 opacity-50 select-none text-sm border border-[--labelDivider] mx-2 px-1 rounded"
          >
            {transformedTracks.length}
          </code>
        </h1>
        <p className="text-[--systemSecondary]">
          Here&apos;s your collection of liked songs from SoundCloud.
        </p>
      </div>
      {transformedTracks.length === 0 ? (
        <EmptyLibrary />
      ) : (
        <>
          <div ref={parentRef}>
            <ul
              className={style.libraryList}
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualItem: any) => {
                const item = transformedTracks[virtualItem.index];
                return (
                  <LibraryItem
                    key={item.id + Math}
                    ref={virtualItem.measureRef}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                    item={item}
                    allItems={transformedTracks}
                  />
                );
              })}
            </ul>
          </div>

          {/* Load More Button */}
          {visibleCount < transformedTracks.length && (
            <div className="mt-4 flex justify-center">
              <button
                className="bg-white/10 text-white py-2 px-4 rounded-md hover:bg-white/15 transition"
                onClick={() => setVisibleCount((prev) => prev + 100)}
              >
                Load More
              </button>
            </div>
          )}
        </>
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
  targetX: number;
  targetY: number;
  finalRotation: number;
  duration: number;
};

const EmptyLibrary = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  // Music note SVG paths
  const notePaths = [
    "M8.38998 4.75975C8.97778 4.61491 9.14398 4.47874 9.14398 3.79061V1.48624C9.14398 1.01139 8.95998 0.807961 8.33048 0.962411L4.90528 1.81577C4.31208 1.96061 4.17688 2.09467 4.17688 2.79663V7.9362C4.17688 8.4371 4.13418 8.5257 3.56938 8.6717L2.49968 8.9605C1.39318 9.2426 0.523682 9.9029 0.523682 11.0429C0.523682 12.058 1.29478 12.7909 2.47718 12.7909C4.16558 12.7909 5.31708 11.585 5.31708 9.871V5.98741C5.31708 5.5728 5.40988 5.47038 5.65298 5.4235L8.38998 4.75975Z",
    "M13.9771 5.763C14.8112 5.57659 15.0498 5.39069 15.0699 4.42812L15.142 0.982802C15.1559 0.318572 14.9021 0.0289427 14.0088 0.227651L6.61763 1.87972C5.77592 2.06598 5.58112 2.24978 5.56058 3.2317L5.4102 10.421C5.39555 11.1217 5.33267 11.2445 4.53102 11.4331L3.01237 11.8076C1.44197 12.1718 0.195093 13.0715 0.161737 14.6661C0.132036 16.0861 1.19923 17.1325 2.86853 17.1651C5.2522 17.2116 6.91317 15.5564 6.96332 13.1589L7.07695 7.72642C7.08908 7.14646 7.22309 7.00575 7.56767 6.94687L13.9771 5.763Z M15.106 5.24877C15.1199 4.58255 15.121 4.53188 15.1411 3.56931L15.158 2.76417C15.1719 2.09994 15.1349 1.34185 15.1434 0.939705L14.6181 0.770083C13.7764 0.956349 13.5816 1.14015 13.561 2.12207L13.4106 9.31139C13.396 10.0121 13.3331 10.1348 12.5315 10.3235L11.0128 10.698C9.44241 11.0621 8.19553 11.9618 8.16218 13.5565C8.13247 14.9764 9.19966 16.0229 10.869 16.0554C13.2526 16.1019 14.9136 14.4468 14.9638 12.0492L15.0774 6.61679C15.0895 6.03682 15.0866 6.17459 15.0929 5.87425L15.106 5.24877Z",
  ];

  const particles = () => {
    // Create notes with pre-calculated animation values
    const newNotes = Array.from({ length: 4 }).map((_, i) => {
      const initialRotation = Math.random() * 20 - 10; // Small initial tilt between -10 and 10 degrees
      return {
        id: Date.now() + i,
        x: 0,
        y: 0,
        pathIndex: Math.floor(Math.random() * notePaths.length),
        scale: 0.5 + Math.random() * 0.5,
        rotation: initialRotation,
        targetX: (Math.random() - 0.5) * 150, // Less horizontal movement
        targetY: -60 - Math.random() * 40, // Less vertical movement
        finalRotation: initialRotation + (Math.random() * 40 - 20), // Gentle rotation between -20 and +20 degrees
        duration: 2.5 + Math.random(), // Slower duration between 2.5 and 3.5 seconds
      };
    });

    setNotes([...notes, ...newNotes]);

    // Clean up old notes
    setTimeout(() => {
      setNotes((prev) => prev.filter((note) => note.id !== newNotes[0].id));
    }, 3500); // Extended timeout to match the longer animation
  };

  return (
    <div className="text-center flex flex-col items-center justify-end h-[50vh] relative overflow-hidden">
      <div className="mb-4">
        <li className="flex h-10 w-[7.5rem] p-1 gap-0.5 bg-white/10 rounded-lg">
          <motion.div
            onClick={particles}
            className="h-full w-10 aspect-square rounded-[4px] transition-all bg-white/10 active:scale-50 cursor-pointer relative"
            whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
            // whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence>
              {notes.map((note) => (
                <motion.svg
                  key={note.id}
                  viewBox="0 0 24 24"
                  className="absolute h-6 w-6 text-[--systemSecondary] fill-current z-10"
                  style={{ bottom: 24, left: "50%", marginLeft: "-12px" }}
                  initial={{
                    y: 0,
                    x: 0,
                    opacity: 0,
                    scale: note.scale,
                    rotate: note.rotation,
                  }}
                  animate={{
                    y: note.targetY,
                    x: note.targetX,
                    opacity: [0, 1, 0.8, 0],
                    rotate: note.finalRotation,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: note.duration,
                    ease: "easeOut",
                  }}
                >
                  <path d={notePaths[note.pathIndex]} />
                </motion.svg>
              ))}
            </AnimatePresence>
          </motion.div>
          <div className="grid w-full gap-0.5">
            <div className="size-full bg-white/10 rounded-[4px]" />
            <div className="h-3/4 w-1/2 bg-white/10 rounded-[4px]" />
          </div>
        </li>
      </div>
      <h2 className="text-lg opacity-75">Your liked songs library is empty</h2>
      <p className="text-[--systemSecondary] w-60">
        Add your userID in settings or add some songs to your likes on
        SoundCloud to see them here.
      </p>
    </div>
  );
};
