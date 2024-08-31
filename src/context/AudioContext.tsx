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
  setGlobalPlaylist: (tracks: any[]) => void;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentTrack, setCurrentTrack] = useState<any>('');
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cover, setHDCover] = useState<any>(null);
  const [playlist, setPlaylist] = useState<any[]>([]);

  const setGlobalPlaylist = (tracks: any[]) => {
    setPlaylist(tracks);
  };

  const fetchCover = async (query: string) => {
    const url = encodeURIComponent(query);
    const response = await fetch(`/api/extra/cover/${url}`);
    console.log("fetchCover | response:", response);
    const data = await response.json();
    console.log("fetchCover | Query:", query, "img:", data);
    setHDCover(data.imageUrl);
  };

  const playNextTrack = async () => {
    console.log("Playing next track...");
    console.log("Current track:", currentTrack);
    console.log("Next track:", playlist[1]);
    console.log("Playlist:", playlist);
    if (playlist.length > 1) {
      const nextTrack = playlist[1];
      setCurrentTrack(nextTrack);
      const response = await fetch(`/api/track/info/${nextTrack.id}`);
      const nextTrackData = await response.json();
      setPlaylistUrl(await fetchPlaylistM3U8(nextTrackData.permalink_url));

      // Fetch HD cover
      await fetchCover(nextTrackData.permalink_url);

      // Remove the first song from the playlist
      setPlaylist((prevPlaylist) => prevPlaylist.slice(1));
    } else {
      console.log("No more tracks in the playlist");
    }
    console.log("----------------------------");
  };

  const playPreviousTrack = async () => {
    console.log("Playing previous track...");
    console.log("Current track:", currentTrack);
    console.log("Playlist:", playlist);
    console.log("Playlist URL:", playlistUrl);
    if (currentTrack && playlist.length > 0) {
      const currentIndex = playlist.findIndex(
        (track) => track.id === currentTrack.id
      );
      console.log("Current index:", currentIndex);
      if (currentIndex > 0) {
        const previousTrack = playlist[currentIndex - 1];
        console.log("Previous track:", previousTrack);
        setCurrentTrack(previousTrack);
        const response = await fetch(`/api/track/info/${previousTrack.id}`);
        const previousTrackData = await response.json();
        console.log("Previous track data:", previousTrackData);
        setPlaylistUrl(
          await fetchPlaylistM3U8(previousTrackData.permalink_url)
        );

        // Fetch HD cover
        await fetchCover(previousTrackData.permalink_url);
      } else {
        console.log("Reached beginning of playlist");
      }
    } else {
      console.log("No current track or empty playlist");
    }
    console.log("----------------------------");
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
        setGlobalPlaylist,
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
