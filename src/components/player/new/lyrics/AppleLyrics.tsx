import React, { useEffect, useRef, useState } from "react";
import { useAudioStoreNew } from "@/context/AudioContextNew";
import { LyricPlayer, LyricPlayerRef } from "@applemusic-like-lyrics/react";
import { LyricLine, parseTTML } from "./lrc/utils/TTMLparser";
import { AppleKit } from "@/lib/audio/fetchers";

export const AppleLyrics = () => {
  const [lyricLines, setLyricLines] = useState<LyricLine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const lyricPlayerRef = useRef<LyricPlayerRef>(null);
  const lastTimeRef = useRef<number>(-1);
  const { fineProgress, currentSong } = useAudioStoreNew();

  useEffect(() => {
    const loadLyrics = async () => {
      setIsLoading(true);
      try {
        // Check localStorage first
        const storageKey = `gakuData`;
        const storedData = localStorage.getItem(storageKey);
        const currentTime = Date.now();
        if (storedData) {
          const data = JSON.parse(storedData);
          const song = data.songs?.find(
            (s: any) =>
              s.name === currentSong?.name &&
              s.artist === currentSong?.artistName
          );
          if (song?.lyrics && song.expiresAt > currentTime) {
            setLyricLines(song.lyrics);
            setIsLoading(false);
            return;
          }
        }

        // Fetch new lyrics if not in cache or expired
        const lyrics = await AppleKit.getAppleLyrics(
          currentSong?.name || "",
          currentSong?.artistName || "",
          true
        );
        const parsedLyrics = parseTTML(lyrics).lyricLines;
        setLyricLines(parsedLyrics);

        // Save to localStorage
        const expiresAt = currentTime + 60 * 60 * 1000; // 1 hour
        const data = JSON.parse(storedData || '{"songs":[]}');
        const songIndex = data.songs.findIndex(
          (s: any) =>
            s.name === currentSong?.name && s.artist === currentSong?.artistName
        );

        if (songIndex >= 0) {
          data.songs[songIndex].lyrics = parsedLyrics;
          data.songs[songIndex].expiresAt = expiresAt;
        } else {
          data.songs.push({
            name: currentSong?.name,
            artist: currentSong?.artistName,
            lyrics: parsedLyrics,
            expiresAt,
          });
        }

        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch (error) {
        console.error("Failed to load lyrics:", error);
        setLyricLines([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadLyrics();
  }, [currentSong?.artistName, currentSong?.name]);

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

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <QueryText>Loading lyrics...</QueryText>
      </div>
    );
  }

  if (!lyricLines.length) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <QueryText>No lyrics</QueryText>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col">
      <LyricPlayer
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "100%",
          maxHeight: "100%",
          scale: 0.95,
          // contain: "paint layout",
          // overflow: "hidden",
          mixBlendMode: "plus-lighter",
          fontWeight: "bold",
        }}
        ref={lyricPlayerRef}
        alignAnchor="center"
        lyricLines={lyricLines}
      />
    </div>
  );
};

const QueryText = ({ children }: { children: React.ReactNode }) => {
  return <p className="opacity-50">{children}</p>;
};
