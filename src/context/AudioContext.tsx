"use client";
import { fetchPlaylistM3U8 } from "@/lib/utils";
import React, { createContext, useState, useContext } from "react";

type AudioContextType = {
  currentTrack: any;
  setCurrentTrack: (track: any) => void;
  playlistUrl: string | null;
  setPlaylistUrl: (url: string | null) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  cover: any;
  setHDCover: (cover: any) => void;
  playNextTrack: () => void;
  playPreviousTrack: () => void;
  setGlobalPlaylist: (tracks: any[]) => void; // Add this line to set the playlist
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cover, setHDCover] = useState<any>(null);
  const [playlist, setPlaylist] = useState<any[]>([]);

  const setGlobalPlaylist = (tracks: any[]) => {
    setPlaylist(tracks);
  };

  const playNextTrack = async () => {
    console.log("Playing next track...");
    console.log("Current track:", currentTrack);
    console.log("Playlist:", playlist);
    console.log("Playlist URL:", playlistUrl);
    console.log(
      "Current index:",
      playlist.findIndex((track) => track.id === currentTrack.id)
    );
    console.log(
      "Next track:",
      playlist[playlist.findIndex((track) => track.id === currentTrack.id) + 1]
    );
    console.log("Playlist length:", playlist.length);
    console.log("----------------------------");
    if (currentTrack && playlist.length > 0) {
      const currentIndex = playlist.findIndex(
        (track) => track.id === currentTrack.id
      );
      if (currentIndex < playlist.length - 1) {
        const nextTrack = playlist[currentIndex + 1];
        console.log("Next track:", nextTrack);
        setCurrentTrack(nextTrack);
        const response = await fetch(`/api/track/info/${nextTrack.id}`);
        const nextTrackData = await response.json();
        console.log("Next track data:", nextTrackData);
        setPlaylistUrl(await fetchPlaylistM3U8(nextTrackData.permalink_url)); // Update the URL to play the next track
        setHDCover(nextTrackData.artwork_url);
      }
    }
  };

  const playPreviousTrack = async () => {
    if (currentTrack && playlist.length > 0) {
      const currentIndex = playlist.findIndex(
        (track) => track.id === currentTrack.id
      );
      if (currentIndex > 0) {
        const previousTrack = playlist[currentIndex - 1];
        setCurrentTrack(previousTrack);
        const response = await fetch(`/api/track/info/${previousTrack.id}`);
        const previousTrackData = await response.json();
        setPlaylistUrl(
          await fetchPlaylistM3U8(previousTrackData.permalink_url)
        ); // Update the URL to play the previous track
      }
    }
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        setCurrentTrack,
        playlistUrl,
        setPlaylistUrl,
        isPlaying,
        setIsPlaying,
        cover,
        setHDCover,
        playNextTrack,
        playPreviousTrack,
        setGlobalPlaylist, // Add this to the context value
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};
