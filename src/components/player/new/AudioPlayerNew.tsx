"use client";
import React, { useEffect, useRef, useState } from "react";
import { useAudioStoreNew } from "@/context/AudioContextNew";
import ReactPlayer from "react-player";
import { mapSCDataToSongOrPlaylist } from "@/lib/audio/fetchers";
import { Controls } from "./controls/Controls";

export const AudioPlayerNew = () => {
  const {
    currentSong,
    isPlaying,
    nextSong,
    setQueue,
    addToQueue,
    queue,
    setPlayerRef,
  } = useAudioStoreNew();

  const playerRef = useRef<ReactPlayer>(null);

  useEffect(() => {
    console.log("AudioStateNew | state:", queue);
  }, [setQueue, currentSong, queue]);

  useEffect(() => {
    // Set the player ref inside the store
    setPlayerRef(playerRef);
  }, [setPlayerRef]);

  const handleLoadUrl = async (url: string) => {
    if (!url) return;
    // Get initial songs and a function to load remaining
    const { initialSongs, loadRemaining } = await mapSCDataToSongOrPlaylist(
      url,
      3
    );

    // Set the queue with the initial songs, starts playing as soon as first song is ready
    await setQueue(initialSongs);

    // Load the remaining tracks in the background
    const remainingSongs = await loadRemaining();
    // Add them to the queue as they come in
    addToQueue(remainingSongs);
  };

  return (
    <>
      <UrlInput onLoadUrl={(url) => handleLoadUrl(url)} />
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
