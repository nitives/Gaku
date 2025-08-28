"use client";
import React, { useEffect, useRef, useState } from "react";
import { useAudioStore } from "@/context/AudioContext";
import { LyricPlayer, LyricPlayerRef } from "@applemusic-like-lyrics/react";
import { LyricLine, parseTTML } from "./lrc/utils/TTMLparser";
import { AppleKit } from "@/lib/audio/fetchers";
import { GakuStorage } from "@/lib/utils/storage";
import { dev } from "@/lib/utils";
import { QueueView } from "./QueueView";
import { motion, AnimatePresence } from "motion/react";

// SegmentControl component for switching views
const SegmentControl = ({
  activeView,
  onChange,
}: {
  activeView: "lyrics" | "queue";
  onChange: (view: "lyrics" | "queue") => void;
}) => {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-neutral-600/25 backdrop-blur-lg rounded-full p-1 flex opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <button
        onClick={() => onChange("lyrics")}
        className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
          activeView === "lyrics"
            ? "bg-neutral-300/15 text-white"
            : "text-white/60 hover:text-white"
        }`}
      >
        Lyrics
      </button>
      <button
        onClick={() => onChange("queue")}
        className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
          activeView === "queue"
            ? "bg-neutral-300/15 text-white"
            : "text-white/60 hover:text-white"
        }`}
      >
        Queue
      </button>
    </div>
  );
};

export const AppleLyrics = () => {
  const [lyricLines, setLyricLines] = useState<LyricLine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<"lyrics" | "queue">("lyrics");
  const lyricPlayerRef = useRef<LyricPlayerRef>(null);
  const lastTimeRef = useRef<number>(-1);
  const { fineProgress, currentSong, isPlaying, seek } = useAudioStore();

  useEffect(() => {
    const loadLyrics = async () => {
      setIsLoading(true);
      try {
        const data = GakuStorage.getData();
        const currentTime = Date.now();
        const song = data.songs?.find(
          (s) =>
            s.name === currentSong?.name &&
            s.artist === currentSong?.artist.name
        );

        if (song?.lyrics && song.expiresAt && song.expiresAt > currentTime) {
          setLyricLines(song.lyrics);
          setIsLoading(false);
          return;
        }

        dev.log("Fetching lyrics for", {
          title: currentSong?.name,
          artist: currentSong?.artist.name,
          isrc: currentSong?.metadata?.isrc,
        });

        const lyrics = await AppleKit.getLyrics(
          currentSong?.name || "",
          currentSong?.artist.name || "",
          currentSong?.metadata?.isrc || undefined,
          true
        );
        const parsedLyrics = parseTTML(lyrics as string).lyricLines;
        setLyricLines(parsedLyrics);

        GakuStorage.updateData((data) => {
          const songIndex = data.songs.findIndex(
            (s) =>
              s.name === currentSong?.name &&
              s.artist === currentSong?.artist.name
          );
          if (songIndex >= 0) {
            data.songs[songIndex].lyrics = parsedLyrics;
            data.songs[songIndex].expiresAt = currentTime + 60 * 60 * 1000;
          } else {
            data.songs.push({
              name: currentSong?.name,
              artist: currentSong?.artist.name,
              lyrics: parsedLyrics,
              expiresAt: currentTime + 60 * 60 * 1000,
            });
          }
          return data;
        });
      } catch (error) {
        console.error("Failed to load lyrics:", error);
        setLyricLines([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadLyrics();
  }, [
    currentSong?.artist.name,
    currentSong?.name,
    currentSong?.metadata?.isrc,
  ]);

  useEffect(() => {
    if (lyricPlayerRef.current?.lyricPlayer) {
      if (lastTimeRef.current === -1) {
        lastTimeRef.current = Date.now();
      }
      const currentTime = Date.now();
      lyricPlayerRef.current.lyricPlayer.update(
        currentTime - lastTimeRef.current
      );
      lastTimeRef.current = currentTime;
      lyricPlayerRef.current.lyricPlayer.setCurrentTime(fineProgress * 1000);
    }
  }, [fineProgress]);

  const onLyricLineClick = (line: any) => {
    dev.log("onLyricLineClick | Clicked on line:", line);
    seek(line.line.lyricLine.startTime / 1000);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <QueryText>Loading lyrics...</QueryText>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col relative group">
      <SegmentControl activeView={activeView} onChange={setActiveView} />

      <AnimatePresence mode="wait">
        {activeView === "lyrics" ? (
          <motion.div
            key="lyrics-view"
            className="flex-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {!lyricLines.length ? (
              <div className="h-screen w-full flex items-center justify-center">
                <QueryText>No lyrics</QueryText>
              </div>
            ) : (
              <LyricPlayer
                style={{
                  width: "100%",
                  height: "100%",
                  maxWidth: "100%",
                  maxHeight: "100%",
                  scale: 0.95,
                  mixBlendMode: "plus-lighter",
                  fontWeight: "bold",
                }}
                currentTime={fineProgress * 1000}
                alignAnchor="center"
                playing={isPlaying}
                lyricLines={lyricLines}
                onLyricLineClick={onLyricLineClick}
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="queue-view"
            className="flex-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <QueueView />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const QueryText = ({ children }: { children: React.ReactNode }) => {
  return <p className="opacity-50 select-none">{children}</p>;
};
