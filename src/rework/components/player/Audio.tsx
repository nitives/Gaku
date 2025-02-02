"use client";
import { useAudioStoreNew } from "@/context/AudioContextNew";
import { useEffect, useRef } from "react";
import ReactPlayer from "react-player";

export const Audio = () => {
  const {
    currentSong,
    isPlaying,
    nextSong,
    previousSong,
    duration,
    setPlayerRef,
    setIsPlaying,
  } = useAudioStoreNew();
  const playerRef = useRef<ReactPlayer>(null);
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

  return (
    <ReactPlayer
      ref={playerRef}
      url={currentSong?.src}
      playing={isPlaying}
      onEnded={nextSong}
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
