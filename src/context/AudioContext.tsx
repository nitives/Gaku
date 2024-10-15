"use client";
import { create } from "zustand";
import { fetchPlaylistM3U8 } from "@/lib/utils";

interface AudioState {
  currentTrack: any | null;
  playlistUrl: string | null;
  isPlaying: boolean;
  cover: string | null;
  playlist: any[];
  setCurrentTrack: (track: any | null) => void;
  setPlaylistUrl: (url: string | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setHDCover: (cover: string) => void;
  setGlobalPlaylist: (tracks: any[]) => void;
  playNextTrack: () => Promise<void>;
  playPreviousTrack: () => Promise<void>;
}

const useAudioStore = create<AudioState>((set, get) => ({
  currentTrack: null,
  playlistUrl: null,
  isPlaying: false,
  cover: null,
  playlist: [],
  setCurrentTrack: (track) => set({ currentTrack: track }),
  setPlaylistUrl: (url) => set({ playlistUrl: url }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setHDCover: (cover) => set({ cover }),
  setGlobalPlaylist: (tracks) => set({ playlist: tracks }),
  playNextTrack: async () => {
    const {
      playlist,
      setCurrentTrack,
      setPlaylistUrl,
      setHDCover,
      setGlobalPlaylist,
    } = get();
    if (playlist.length > 1) {
      const nextTrack = playlist[1];
      setCurrentTrack(nextTrack);
      const response = await fetch(`/api/track/info/${nextTrack.id}`);
      const nextTrackData = await response.json();
      setPlaylistUrl(await fetchPlaylistM3U8(nextTrackData.permalink_url));
      const fetchCover = async (query: string) => {
        const url = encodeURIComponent(query);
        const response = await fetch(`/api/extra/cover/${url}`);
        const data = await response.json();
        setHDCover(data.imageUrl);
      };
      await fetchCover(nextTrackData.permalink_url);
      setGlobalPlaylist(playlist.slice(1));
    } else {
      console.log("No more tracks in the playlist");
    }
  },

  playPreviousTrack: async () => {
    const {
      playlist,
      currentTrack,
      setCurrentTrack,
      setPlaylistUrl,
      setHDCover,
    } = get();
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
        );

        const fetchCover = async (query: string) => {
          const url = encodeURIComponent(query);
          const response = await fetch(`/api/extra/cover/${url}`);
          const data = await response.json();
          setHDCover(data.imageUrl);
        };
        await fetchCover(previousTrackData.permalink_url);
      } else {
        console.log("Reached the beginning of the playlist");
      }
    } else {
      console.log("No current track or empty playlist");
    }
  },
}));

export default useAudioStore;
