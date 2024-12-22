import { create } from "zustand";
import { Song } from "@/lib/audio/types";
import { fetchSongMedia, fetchM3U8ForSong } from "@/lib/audio/fetchers";
import React from "react";
import ReactPlayer from "react-player";

interface AudioStateNew {
  currentSong: Song | null;
  currentIndex: number;
  queue: Song[];
  isPlaying: boolean;
  playerRef: React.RefObject<ReactPlayer> | null;

  currentTime: number;
  duration: number;
  
  // Add a finer resolution progress time
  fineProgress: number; 
  rafId: number | null; // To store requestAnimationFrame ID

  setQueue: (songs: Song[]) => Promise<void>;
  addToQueue: (songs: Song[]) => void;
  playSongAtIndex: (index: number) => Promise<void>;
  nextSong: () => Promise<void>;
  previousSong: () => Promise<void>;
  setIsPlaying: (playing: boolean) => void;
  prefetchNextN: (n: number) => Promise<void>;
  setPlayerRef: (ref: React.RefObject<ReactPlayer>) => void;

  setDuration: (duration: number) => void;
  setCurrentTime: (time: number) => void;
  seek: (time: number) => void;

  startFineProgressUpdates: () => void;
  stopFineProgressUpdates: () => void;
}

const PREFETCH_COUNT = 2;

export const useAudioStoreNew = create<AudioStateNew>((set, get) => ({
  currentSong: null,
  currentIndex: -1,
  queue: [],
  isPlaying: false,
  playerRef: null,

  currentTime: 0,
  duration: 0,
  fineProgress: 0,
  rafId: null,

  setIsPlaying: (playing) => {
    set({ isPlaying: playing });
    // If starting playback, start updates; if pausing, stop them
    if (playing) {
      get().startFineProgressUpdates();
    } else {
      get().stopFineProgressUpdates();
    }
  },
  
  setPlayerRef: (ref) => set({ playerRef: ref }),

  setQueue: async (songs: Song[]) => {
    set({ queue: songs, currentIndex: 0 });
    await get().playSongAtIndex(0);
  },

  addToQueue: (songs: Song[]) => {
    const { queue } = get();
    set({ queue: [...queue, ...songs] });
  },

  playSongAtIndex: async (index: number) => {
    const { queue } = get();
    if (index < 0 || index >= queue.length) {
      console.warn("Invalid index for playSongAtIndex");
      return;
    }

    let selectedSong = queue[index];
    const media = await fetchSongMedia(selectedSong);
    selectedSong = {
      ...selectedSong,
      artwork: { ...selectedSong.artwork, hdUrl: media.HDCover },
    };

    const M3U8url = await fetchM3U8ForSong(selectedSong);
    selectedSong = { ...selectedSong, src: M3U8url };

    const newQueue = [...queue];
    newQueue[index] = selectedSong;
    set({
      currentSong: selectedSong,
      currentIndex: index,
      queue: newQueue,
      isPlaying: true,
    });

    await get().prefetchNextN(PREFETCH_COUNT);
    // Start fine updates if playing
    get().startFineProgressUpdates();
  },

  nextSong: async () => {
    const { currentIndex, queue, playSongAtIndex, setIsPlaying } = get();
    const nextIndex = currentIndex + 1;
    if (nextIndex >= queue.length) {
      console.log("No more songs in the queue.");
      setIsPlaying(false);
      return;
    }
    await playSongAtIndex(nextIndex);
  },

  previousSong: async () => {
    const { currentIndex, playSongAtIndex, playerRef } = get();
    if (!playerRef || !playerRef.current) {
      console.warn("No playerRef is set. Cannot determine current time.");
      return;
    }

    const currentTime = playerRef.current.getCurrentTime();
    if (currentTime > 3) {
      playerRef.current.seekTo(0);
      set({ currentTime: 0, fineProgress: 0 });
    } else {
      const prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        console.log("Already at the start of the queue.");
        return;
      }
      await playSongAtIndex(prevIndex);
    }
  },

  prefetchNextN: async (n: number) => {
    const { queue, currentIndex } = get();
    const end = Math.min(currentIndex + n + 1, queue.length);

    for (let i = currentIndex + 1; i < end; i++) {
      const song = queue[i];
      if (!song.src) {
        fetchM3U8ForSong(song)
          .then((M3U8url) => {
            const newQueue = [...get().queue];
            newQueue[i] = { ...song, src: M3U8url };
            set({ queue: newQueue });
          })
          .catch((err) => {
            console.error(`Failed to prefetch M3U8 for ${song.name}:`, err);
          });
      }
    }
  },

  setDuration: (duration: number) => set({ duration }),
  setCurrentTime: (time: number) => set({ currentTime: time, fineProgress: time }),
  seek: (time: number) => {
    const { playerRef } = get();
    if (playerRef && playerRef.current) {
      playerRef.current.seekTo(time);
      set({ currentTime: time, fineProgress: time });
    }
  },

  startFineProgressUpdates: () => {
    // Use requestAnimationFrame to update fineProgress ~60 times per second
    const { rafId, playerRef, isPlaying } = get();
    if (isPlaying && playerRef && playerRef.current && rafId === null) {
      const update = () => {
        const { playerRef, isPlaying } = get();
        if (!isPlaying || !playerRef?.current) {
          get().stopFineProgressUpdates();
          return;
        }
        const currentTime = playerRef.current.getCurrentTime();
        set({ fineProgress: currentTime });
        const newRafId = requestAnimationFrame(update);
        set({ rafId: newRafId });
      };
      const newRafId = requestAnimationFrame(update);
      set({ rafId: newRafId });
    }
  },

  stopFineProgressUpdates: () => {
    const { rafId } = get();
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      set({ rafId: null });
    }
  },
}));
