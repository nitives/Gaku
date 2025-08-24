"use client";
import { useAudioStoreNew } from "@/context/AudioContextNew";
import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";

export const Audio = () => {
  // Render only after client mounts to avoid hydration mismatches
  const [mounted, setMounted] = useState(false);
  const {
    currentSong,
    isPlaying,
    nextSong,
    previousSong,
    duration,
    setPlayerRef,
    setIsPlaying,
    volume,
  } = useAudioStoreNew();
  const playerRef = useRef<ReactPlayer>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setPlayerRef(playerRef);
  }, [setPlayerRef]);

  useEffect(() => {
    if ("mediaSession" in navigator) {
      const isIPhone = /iPhone/i.test(navigator.userAgent);
      const displayTitle =
        isIPhone && currentSong?.explicit
          ? `${currentSong?.name} 🅴`
          : currentSong?.name;
      navigator.mediaSession.metadata = new MediaMetadata({
        title: displayTitle || "Unknown Title",
        artist: currentSong?.artist.name || "Unknown Artist",
        album: currentSong?.albumName || "",
        artwork: [
          {
            src: currentSong?.artwork.hdUrl || "default-image.jpg",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      });

      navigator.mediaSession.setActionHandler("play", () => {
        setIsPlaying(true);
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        setIsPlaying(false);
      });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        nextSong();
      });
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        previousSong();
      });
      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (details.seekTime && playerRef.current) {
          playerRef.current.seekTo(details.seekTime, "seconds");
        }
      });
      const updatePositionState = () => {
        if (playerRef.current) {
          const internalPlayer = playerRef.current.getInternalPlayer();
          navigator.mediaSession.setPositionState({
            duration: duration,
            playbackRate: internalPlayer ? internalPlayer.playbackRate : 1,
            position: playerRef.current.getCurrentTime(),
          });
        }
      };
      const positionUpdateInterval = setInterval(updatePositionState, 1000);
      return () => {
        clearInterval(positionUpdateInterval);
      };
    }
  }, [currentSong, isPlaying, duration, nextSong, previousSong, setIsPlaying]);

  // Avoid rendering on the server or without a valid URL to keep SSR and CSR output consistent
  if (!mounted || !currentSong?.src) return null;

  return (
    <ReactPlayer
      ref={playerRef}
      url={currentSong?.src}
      playing={isPlaying}
      onEnded={nextSong}
      volume={volume}
      onProgress={({ playedSeconds }) =>
        useAudioStoreNew.getState().setCurrentTime(playedSeconds)
      }
      onDuration={(duration) =>
        useAudioStoreNew.getState().setDuration(duration)
      }
      width="0px"
      height="0px"
    />
  );
};
