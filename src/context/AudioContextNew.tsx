import { create } from "zustand";
import { Song } from "@/lib/audio/types";
import { fetchM3U8ForSong, fetchSongData } from "@/lib/audio/fetchers";
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
  volume: number;

  fineProgress: number;
  rafId: number | null;

  setQueue: (songs: Song[]) => Promise<void>;
  addToQueue: (songs: Song[]) => void;
  playSongAtIndex: (index: number) => Promise<void>;
  nextSong: () => Promise<void>;
  previousSong: () => Promise<void>;
  setIsPlaying: (playing: boolean) => void;
  prefetchNextN: (n: number) => Promise<void>;
  setPlayerRef: (ref: React.RefObject<ReactPlayer>) => void;
  setAnimatedURL: (url: string) => void;

  setDuration: (duration: number) => void;
  setCurrentTime: (time: number) => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;

  startFineProgressUpdates: () => void;
  stopFineProgressUpdates: () => void;

  isFullscreen: boolean;
  setFullscreen: (fullscreen: boolean) => void;
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
  volume: 0.15,
  fineProgress: 0,
  rafId: null,

  setIsPlaying: (playing) => {
    set({ isPlaying: playing });
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

    // Use the new consolidated function
    const { HDCover, M3U8url } = await fetchSongData(selectedSong);

    // Update song with fetched data
    selectedSong = {
      ...selectedSong,
      artwork: { ...selectedSong.artwork, hdUrl: HDCover },
      src: M3U8url,
    };

    const newQueue = [...queue];
    newQueue[index] = selectedSong;
    set({
      currentSong: selectedSong,
      currentIndex: index,
      queue: newQueue,
      isPlaying: true,
    });

    await get().prefetchNextN(PREFETCH_COUNT);
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
    const fetchPromises = [];
    for (let i = currentIndex + 1; i < end; i++) {
      const song = queue[i];
      if (!song.src) {
        const promise = fetchM3U8ForSong(song)
          .then((M3U8url) => {
            const newQueue = [...get().queue];
            newQueue[i] = { ...song, src: M3U8url };
            set({ queue: newQueue });
          })
          .catch((err) => {
            console.error(`Failed to prefetch M3U8 for ${song.name}:`, err);
          });
        fetchPromises.push(promise);
      }
    }
    await Promise.all(fetchPromises);
  },

  setDuration: (duration: number) => set({ duration }),
  setCurrentTime: (time: number) =>
    set({ currentTime: time, fineProgress: time }),
  seek: (time: number) => {
    const { playerRef } = get();
    if (playerRef && playerRef.current) {
      playerRef.current.seekTo(time);
      set({ currentTime: time, fineProgress: time });
    }
  },

  setVolume: (volume: number) => {
    set({ volume });
  },

  setAnimatedURL: (url: string) => {
    const { currentSong } = get();
    if (currentSong) {
      set({
        currentSong: {
          ...currentSong,
          artwork: {
            ...currentSong.artwork,
            animatedURL: url,
          },
        },
      });
    }
  },

  startFineProgressUpdates: () => {
    const { rafId, playerRef, isPlaying } = get();
    if (isPlaying && playerRef && playerRef.current && rafId === null) {
      const update = () => {
        const { playerRef, isPlaying } = get();
        if (!isPlaying || !playerRef?.current) {
          get().stopFineProgressUpdates();
          return;
        }
        const currentTime = playerRef.current.getCurrentTime();
        set({ currentTime: currentTime, fineProgress: currentTime });
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

  isFullscreen: false,
  setFullscreen: (fullscreen: boolean) => set({ isFullscreen: fullscreen }),
}));
