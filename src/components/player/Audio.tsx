"use client";
import { useAudioStore } from "@/context/AudioContext";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";

type PlayerRef = ReactPlayer | null;

export const Audio = () => {
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
  const playerRef = useRef<PlayerRef>(null);

  const mediaEl = useCallback((): HTMLMediaElement | null => {
    const inst = playerRef.current as ReactPlayer | null;
    const anyInst = inst as unknown as {
      getInternalPlayer?: () => any;
      el?: any;
      player?: any;
    } | null;

    const maybe =
      anyInst?.getInternalPlayer?.() ?? anyInst?.el ?? anyInst?.player ?? null;

    return maybe as unknown as HTMLMediaElement | null;
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setPlayerRef(playerRef as any);
    const t = setTimeout(() => {
      try {
        useAudioStore.getState().initializeEngineIfNeeded?.();
      } catch {}
    }, 0);
    return () => clearTimeout(t);
  }, [setPlayerRef]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
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

    navigator.mediaSession.setActionHandler("play", () => setIsPlaying(true));
    navigator.mediaSession.setActionHandler("pause", () => setIsPlaying(false));
    navigator.mediaSession.setActionHandler("nexttrack", () => nextSong());
    navigator.mediaSession.setActionHandler("previoustrack", () =>
      previousSong()
    );
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      const el = mediaEl();
      if (el && details.seekTime != null) el.currentTime = details.seekTime;
    });

    const updatePositionState = () => {
      try {
        const el = mediaEl();
        if (!el) return;

        let d =
          typeof duration === "number" && isFinite(duration) && duration > 0
            ? duration
            : el.duration || 0;
        if (!isFinite(d) || d < 0) d = 0;

        let pos = el.currentTime || 0;
        if (!isFinite(pos) || pos < 0) pos = 0;
        if (d <= 0) pos = 0;
        else if (pos > d) pos = d;

        navigator.mediaSession.setPositionState({
          duration: d,
          playbackRate: el.playbackRate ?? 1,
          position: pos,
        });
      } catch {}
    };

    const positionUpdateInterval = setInterval(updatePositionState, 1000);
    return () => clearInterval(positionUpdateInterval);
  }, [
    currentSong,
    isPlaying,
    duration,
    nextSong,
    previousSong,
    setIsPlaying,
    mediaEl,
  ]);

  if (!mounted || !currentSong?.src) return null;

  return (
    <ReactPlayer
      ref={playerRef}
      /* ReactPlayer expects `url`, not `src` */
      url={currentSong.src}
      playing={isPlaying}
      loop={repeat === "one"}
      onEnded={nextSong}
      volume={muted ? 0 : volume}
      playbackRate={playbackRate}
      /* onProgress fires ~ every second with playedSeconds */
      onProgress={(state: any) => {
        if (typeof state.playedSeconds === "number") {
          useAudioStore.getState().setCurrentTime(state.playedSeconds);
        } else {
          const t = mediaEl()?.currentTime ?? 0;
          useAudioStore.getState().setCurrentTime(t);
        }
      }}
      /* onDuration gives total seconds once known */
      onDuration={(d: number) => {
        if (typeof d === "number" && isFinite(d)) {
          useAudioStore.getState().setDuration(d);
        }
      }}
      onReady={() => {
        try {
          useAudioStore.getState().initializeEngineIfNeeded?.();
        } catch {}
      }}
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
      onError={(e) => {
        // eslint-disable-next-line no-console
        console.error("ReactPlayer error", e, currentSong);
      }}
      config={{
        file: {
          attributes: {
            preload: "metadata",
            crossOrigin: "anonymous",
          },
          forceAudio: true,
        },
      }}
      width="0px"
      height="0px"
    />
  );
};
