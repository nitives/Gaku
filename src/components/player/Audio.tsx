"use client";
import { useAudioStore } from "@/context/AudioContext";
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
    muted,
    playbackRate,
    repeat,
  } = useAudioStore();
  const playerRef = useRef<ReactPlayer>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setPlayerRef(playerRef);
    // Initialize Web Audio engine lazily once the internal element exists
    // This should be triggered after a user gesture causes playback
    const t = setTimeout(() => {
      try {
        useAudioStore.getState().initializeEngineIfNeeded?.();
      } catch {}
    }, 0);
    return () => clearTimeout(t);
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
        try {
          if (!playerRef.current) return;
          const internalPlayer = playerRef.current.getInternalPlayer?.();
          // Prefer store duration, fall back to player's own duration
          let d =
            typeof duration === "number" && isFinite(duration) && duration > 0
              ? duration
              : (playerRef.current as any).getDuration?.() || 0;
          if (!isFinite(d) || d < 0) d = 0;
          // Current playback position
          let pos = playerRef.current.getCurrentTime();
          if (!isFinite(pos) || pos < 0) pos = 0;
          // If duration is unknown/zero, force position to 0 to satisfy API
          if (d <= 0) pos = 0;
          // Otherwise clamp within [0, d]
          else if (pos > d) pos = d;

          navigator.mediaSession.setPositionState({
            duration: d,
            playbackRate: internalPlayer
              ? (internalPlayer as any).playbackRate ?? 1
              : 1,
            position: pos,
          });
        } catch {
          // Swallow MediaSession errors (e.g., during track transitions)
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
      loop={repeat === "one"}
      onEnded={nextSong}
      volume={muted ? 0 : volume}
      playbackRate={playbackRate}
      onProgress={({ playedSeconds }) =>
        useAudioStore.getState().setCurrentTime(playedSeconds)
      }
      onDuration={(duration) => useAudioStore.getState().setDuration(duration)}
      width="0px"
      height="0px"
    />
  );
};
