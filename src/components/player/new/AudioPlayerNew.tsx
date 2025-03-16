"use client";
import React, { useEffect, useRef, useState } from "react";
import { useAudioStoreNew } from "@/context/AudioContextNew";
import ReactPlayer from "react-player";
import { Controls } from "./controls/Controls";
import { SoundCloudKit } from "@/lib/audio/fetchers";

export const AudioPlayerNew = () => {
  const {
    currentSong,
    isPlaying,
    nextSong,
    previousSong,
    setQueue,
    queue,
    duration,
    setPlayerRef,
    setIsPlaying,
    volume,
  } = useAudioStoreNew();
  const playerRef = useRef<ReactPlayer>(null);

  useEffect(() => {
    console.log("AudioStateNew | state:", queue);
  }, [setQueue, currentSong, queue]);

  useEffect(() => {
    // Set the player ref inside the store
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
            src: SoundCloudKit.getHD(
              currentSong?.artwork?.url || "default-image.jpg"
            ),
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
    <>
      {/* <UrlInput onLoadUrl={(url) => handleLoadUrl(url)} /> */}
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
      <Controls />
    </>
  );
};

interface UrlInputProps {
  onLoadUrl: (url: string) => void;
}

const UrlInput: React.FC<UrlInputProps> = ({ onLoadUrl }) => {
  const [testUrl, setTestUrl] = useState("");
  return (
    <div>
      <input
        type="text"
        value={testUrl}
        onChange={(e) => setTestUrl(e.target.value)}
        placeholder="Enter a SoundCloud URL"
      />
      <button onClick={() => onLoadUrl(testUrl)}>Load Track/Playlist</button>
      <p>https://soundcloud.com/lilyeat/gone-4-a-min</p>
      <p>https://soundcloud.com/selecta-775244148/5-osamason-only-azure</p>
      <p>https://soundcloud.com/octobersveryown/drake-champagne-poetry</p>
      <p>https://soundcloud.com/octobersveryown/drake-n-2-deep-feat-future</p>
      <p>https://soundcloud.com/jackboysofficial/out-west-feat-young-thug</p>
    </div>
  );
};
