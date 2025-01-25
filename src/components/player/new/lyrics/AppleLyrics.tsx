import React, { useEffect, useRef, useState } from "react";
import { useAudioStoreNew } from "@/context/AudioContextNew";
import { LyricPlayer, LyricPlayerRef } from "@applemusic-like-lyrics/react";
import { LyricLine, parseTTML } from "./lrc/utils/TTMLparser";
import { AppleKit } from "@/lib/audio/fetchers";
import { GakuStorage } from "@/lib/utils/storage";

export const AppleLyrics = () => {
  const [lyricLines, setLyricLines] = useState<LyricLine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const lyricPlayerRef = useRef<LyricPlayerRef>(null);
  const lastTimeRef = useRef<number>(-1);
  const { fineProgress, currentSong, isPlaying } = useAudioStoreNew();

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

        const lyrics = await AppleKit.getLyrics(
          currentSong?.name || "",
          currentSong?.artist.name || "",
          true
        );
        const parsedLyrics = parseTTML(lyrics).lyricLines;
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
  }, [currentSong?.artist.name, currentSong?.name]);

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
        // ref={lyricPlayerRef}
        currentTime={fineProgress * 1000}
        alignAnchor="center"
        playing={isPlaying}
        lyricLines={lyricLines}
        onLyricLineClick={(line) => console.log(line)}
      />
    </div>
  );
};

const QueryText = ({ children }: { children: React.ReactNode }) => {
  return <p className="opacity-50 select-none">{children}</p>;
};
