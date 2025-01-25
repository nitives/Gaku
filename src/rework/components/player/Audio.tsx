"use client";
import { useAudioStoreNew } from "@/context/AudioContextNew";
import { useEffect, useRef } from "react";
import ReactPlayer from "react-player";

export const Audio = () => {
  const { currentSong, isPlaying, nextSong, setPlayerRef } = useAudioStoreNew();
  const playerRef = useRef<ReactPlayer>(null);
  useEffect(() => {
    setPlayerRef(playerRef);
  }, [setPlayerRef]);
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
