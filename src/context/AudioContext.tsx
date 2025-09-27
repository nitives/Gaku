import { create } from "zustand";
import { Song } from "@/lib/audio/types";
import { fetchM3U8ForSong, fetchSongData } from "@/lib/audio/fetchers";
import { showToast } from "@/hooks/useToast";
import { loadState, saveState } from "@/lib/audio/persist";
import { reseedFromTime, shuffleIndices } from "@/lib/audio/shuffle";
import ReactPlayer from "react-player";

type RepeatMode = "off" | "one" | "all";

interface AudioState {
  // Core state
  currentSong: Song | null;
  currentIndex: number; // index into queue
  queue: Song[];
  isPlaying: boolean;
  playerRef: React.RefObject<ReactPlayer | null> | null;

  // Timing/state
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  playbackRate: number;
  // Engine
  audioCtx: AudioContext | null;
  mediaNode: MediaElementAudioSourceNode | null;
  gainNode: GainNode | null;
  engineReady: boolean;
  suspendTimer: any;

  crossfadeEnabled: boolean;
  crossfadeSeconds: number;

  fineProgress: number;
  rafId: number | null;

  // Order & modes
  shuffle: boolean;
  shuffleSeed: number;
  shuffleOrder: number[]; // permutation of indices
  shufflePtr: number; // pointer into shuffleOrder
  repeat: RepeatMode;
  history: number[]; // stack of previously played indices

  // Manual Up Next management
  upNext: Song[]; // items injected to play before derived order
  later: Song[]; // items appended after derived order

  // Public API
  playNow: (songs: Song[] | Song, startIndex?: number) => Promise<void>;
  playNext: (song: Song | Song[]) => void;
  playLater: (song: Song | Song[]) => void;
  removeAt: (index: number) => void; // index in queue
  move: (from: number, to: number) => void;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (ms: number) => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unmute: () => void;
  setPlaybackRate: (rate: number) => void;
  setShuffle: (enabled: boolean) => void;
  setRepeat: (mode: RepeatMode) => void;
  seekMs?: (ms: number) => void;
  initializeEngineIfNeeded?: () => void;

  // Compatibility
  setQueue: (songs: Song[]) => Promise<void>;
  addToQueue: (songs: Song[]) => void;
  playSongAtIndex: (index: number) => Promise<void>;
  nextSong: () => Promise<void>;
  previousSong: () => Promise<void>;
  setIsPlaying: (playing: boolean) => void;
  prefetchNextN: (n: number) => Promise<void>;
  setPlayerRef: (ref: React.RefObject<ReactPlayer | null>) => void;
  setAnimatedURL: (url: string) => void;

  setDuration: (duration: number) => void;
  setCurrentTime: (time: number) => void;

  startFineProgressUpdates: () => void;
  stopFineProgressUpdates: () => void;

  isFullscreen: boolean;
  setFullscreen: (fullscreen: boolean) => void;

  // Helpers
  rebuildShuffleOrder: () => void;
  persist: () => void;
  applyPlaybackRate: () => void;
  applyVolume: () => void;
  scheduleSuspend: () => void;
}

const PREFETCH_COUNT = 2;
const PERSIST_KEY = "audio-engine:v1";
const PERSIST_MAX_AGE_MS = 6 * 60 * 60 * 1000; // 6 hours
const AUTORESUME_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export const useAudioStore = create<AudioState>(
  (set: (partial: Partial<AudioState>) => void, get: () => AudioState) => ({
    currentSong: null,
    currentIndex: -1,
    queue: [],
    isPlaying: false,
    playerRef: null,

    currentTime: 0,
    duration: 0,
    volume: 0.15,
    muted: false,
    playbackRate: 1,
    audioCtx: null,
    mediaNode: null,
    gainNode: null,
    engineReady: false,
    suspendTimer: null,
    crossfadeEnabled: false,
    crossfadeSeconds: 6,
    fineProgress: 0,
    rafId: null,

    shuffle: false,
    shuffleSeed: reseedFromTime(),
    shuffleOrder: [],
    shufflePtr: -1,
    repeat: "off",
    history: [],

    upNext: [],
    later: [],

    setIsPlaying: (playing: boolean) => {
      set({ isPlaying: playing });
      if (playing) {
        get().startFineProgressUpdates();
        // resume audio context promptly on play
        try {
          const ctx = get().audioCtx;
          if (ctx && ctx.state === "suspended") ctx.resume();
        } catch {}
      } else {
        get().stopFineProgressUpdates();
        get().scheduleSuspend();
      }
      // persist lightweight playback flag
      get().persist();
    },

    setPlayerRef: (ref) => set({ playerRef: ref }),

    _mediaEl: undefined as unknown as () => HTMLMediaElement | null,

    // New Public API
    playNow: async (songs, startIndex = 0) => {
      const list = Array.isArray(songs) ? songs : [songs];
      if (list.length === 0) return;
      // Reset order and history, compute shuffle order if needed
      let shuffleOrder: number[] = [];
      let shufflePtr = -1;
      const shuffle = get().shuffle;
      if (shuffle) {
        shuffleOrder = shuffleIndices(list.length, get().shuffleSeed);
        const target = shuffleOrder[startIndex] ?? 0;
        shufflePtr = shuffleOrder.findIndex((i) => i === target);
      }
      set({
        queue: list,
        currentIndex: shuffle ? shuffleOrder[shufflePtr] : startIndex,
        shuffleOrder,
        shufflePtr,
        history: [],
        upNext: [],
        later: [],
      });
      await get().playSongAtIndex(get().currentIndex);
    },

    playNext: (songOrList) => {
      const songs = Array.isArray(songOrList) ? songOrList : [songOrList];
      set({ upNext: [...get().upNext, ...songs] });
      get().persist();
    },

    playLater: (songOrList) => {
      const songs = Array.isArray(songOrList) ? songOrList : [songOrList];
      set({ later: [...get().later, ...songs] });
      get().persist();
    },

    removeAt: (index) => {
      const { queue, currentIndex } = get();
      if (index < 0 || index >= queue.length) return;
      const newQueue = queue.slice();
      newQueue.splice(index, 1);
      let newCurrent = currentIndex;
      if (index === currentIndex) {
        // Removing current — move to same index item after removal
        newCurrent = Math.min(index, newQueue.length - 1);
      } else if (index < currentIndex) {
        newCurrent = currentIndex - 1;
      }
      set({ queue: newQueue, currentIndex: newCurrent });
      // Rebuild shuffle order if enabled
      if (get().shuffle) get().rebuildShuffleOrder();
      get().persist();
    },

    move: (from, to) => {
      const { queue, currentIndex } = get();
      if (
        from < 0 ||
        from >= queue.length ||
        to < 0 ||
        to >= queue.length ||
        from === to
      )
        return;
      const newQueue = queue.slice();
      const [it] = newQueue.splice(from, 1);
      newQueue.splice(to, 0, it);
      // Adjust current index
      let newCurrent = currentIndex;
      if (from === currentIndex) newCurrent = to;
      else if (from < currentIndex && to >= currentIndex) newCurrent -= 1;
      else if (from > currentIndex && to <= currentIndex) newCurrent += 1;
      set({ queue: newQueue, currentIndex: newCurrent });
      if (get().shuffle) get().rebuildShuffleOrder();
      get().persist();
    },

    next: async () => {
      const {
        repeat,
        upNext,
        later,
        queue,
        currentIndex,
        shuffle,
        shuffleOrder,
        shufflePtr,
      } = get();

      // Repeat one
      if (repeat === "one") {
        const inst = get().playerRef?.current as any;
        const el: HTMLMediaElement | null =
          inst?.getInternalPlayer?.() ?? inst?.el ?? inst?.player ?? null;
        if (el) {
          try {
            el.currentTime = 0;
          } catch {}
          try {
            await el.play?.();
          } catch {}
          set({ isPlaying: true, currentTime: 0, fineProgress: 0 });
        } else {
          await get().playSongAtIndex(currentIndex);
        }
        return;
      }

      // Manual Up Next first
      if (upNext.length > 0) {
        const [song, ...rest] = upNext;
        // If this song exists in queue, jump to it; otherwise append and play it
        const idx = queue.findIndex((s) => s.id === song.id);
        if (idx >= 0) {
          set({ upNext: rest });
          await get().playSongAtIndex(idx);
        } else {
          const newQueue = queue.concat([song]);
          set({
            queue: newQueue,
            upNext: rest,
            currentIndex: newQueue.length - 1,
          });
          if (shuffle) get().rebuildShuffleOrder();
          await get().playSongAtIndex(get().currentIndex);
        }
        return;
      }

      // Derived order
      if (shuffle) {
        let ptr = shufflePtr + 1;
        if (ptr >= shuffleOrder.length) {
          if (later.length > 0) {
            const [song, ...rest] = later;
            const newQueue = queue.concat([song]);
            set({ queue: newQueue, later: rest });
            get().rebuildShuffleOrder();
            set({
              shufflePtr: get().shuffleOrder.findIndex(
                (i) => i === newQueue.length - 1
              ),
            });
            await get().playSongAtIndex(newQueue.length - 1);
            return;
          }
          if (get().repeat === "all") {
            ptr = 0; // restart same deterministic order
          } else {
            get().setIsPlaying(false);
            return;
          }
        }
        const targetIdx = get().shuffleOrder[ptr];
        set({ shufflePtr: ptr });
        await get().playSongAtIndex(targetIdx);
        return;
      } else {
        let nextIdx = currentIndex + 1;
        if (nextIdx >= queue.length) {
          if (later.length > 0) {
            const [song, ...rest] = later;
            const newQueue = queue.concat([song]);
            set({ queue: newQueue, later: rest });
            await get().playSongAtIndex(newQueue.length - 1);
            return;
          }
          if (repeat === "all") nextIdx = 0;
          else {
            get().setIsPlaying(false);
            return;
          }
        }
        await get().playSongAtIndex(nextIdx);
        return;
      }
    },

    previous: async () => {
      const inst = get().playerRef?.current as any;
      const el: HTMLMediaElement | null =
        inst?.getInternalPlayer?.() ?? inst?.el ?? inst?.player ?? null;

      // If media progressed >3s, just restart track
      if (el) {
        const t = el.currentTime || 0;
        if (t > 3) {
          el.currentTime = 0;
          set({ currentTime: 0, fineProgress: 0 });
          return;
        }
      }
      const { history, currentIndex } = get();
      if (history.length > 0) {
        const last = history[history.length - 1];
        set({ history: history.slice(0, -1) });
        await get().playSongAtIndex(last);
      } else if (currentIndex > 0) {
        await get().playSongAtIndex(currentIndex - 1);
      }
    },

    play: () => get().setIsPlaying(true),
    pause: () => get().setIsPlaying(false),
    toggle: () => get().setIsPlaying(!get().isPlaying),

    // Note: `seek` expects seconds for backward-compatibility with existing UI
    seek: (seconds: number) => {
      const inst = get().playerRef?.current as any;
      const el: HTMLMediaElement | null =
        inst?.getInternalPlayer?.() ?? inst?.el ?? inst?.player ?? null;
      if (el) {
        try {
          el.currentTime = seconds;
        } catch {}
        set({ currentTime: seconds, fineProgress: seconds });
      }
    },

    // ms-based API for future UI
    seekMs: (ms: number) => {
      const seconds = ms / 1000;
      get().seek(seconds);
    },

    setVolume: (volume: number) => {
      set({ volume });
      get().persist();
    },
    mute: () => set({ muted: true }),
    unmute: () => set({ muted: false }),
    setPlaybackRate: (rate: number) => {
      set({ playbackRate: Math.max(0.5, Math.min(3, rate)) });
      get().applyPlaybackRate();
    },
    setShuffle: (enabled: boolean) => {
      const { queue } = get();
      if (enabled) {
        const seed = get().shuffleSeed; // keep session seed
        const order = shuffleIndices(queue.length, seed);
        const ptr = order.findIndex((i) => i === get().currentIndex);
        set({
          shuffle: true,
          shuffleSeed: seed,
          shuffleOrder: order,
          shufflePtr: ptr,
        });
      } else {
        set({ shuffle: false, shuffleOrder: [], shufflePtr: -1 });
      }
      get().persist();
    },
    setRepeat: (mode: RepeatMode) => {
      set({ repeat: mode });
      get().persist();
    },

    // Compatibility wrappers
    setQueue: async (songs: Song[]) => {
      await get().playNow(songs, 0);
    },
    addToQueue: (songs: Song[]) => {
      get().playLater(songs);
    },

    playSongAtIndex: async (index: number) => {
      const { queue, currentIndex, history } = get();
      if (index < 0 || index >= queue.length) {
        console.warn("Invalid index for playSongAtIndex");
        return;
      }
      let selectedSong = queue[index];
      // Fetch media if needed
      const needsMedia = !selectedSong.src || !selectedSong.artwork?.hdUrl;
      if (needsMedia) {
        const { HDCover, M3U8url } = await fetchSongData(selectedSong);
        selectedSong = {
          ...selectedSong,
          artwork: { ...selectedSong.artwork, hdUrl: HDCover },
          src: M3U8url,
        };
      }
      const newQueue = [...queue];
      newQueue[index] = selectedSong;
      // push history if jumping forward to a different song
      const newHistory =
        currentIndex >= 0 && index !== currentIndex
          ? [...history, currentIndex]
          : history;

      set({
        currentSong: selectedSong,
        currentIndex: index,
        queue: newQueue,
        isPlaying: true,
        history: newHistory,
      });

      await get().prefetchNextN(PREFETCH_COUNT);
      get().startFineProgressUpdates();
      get().persist();
    },

    nextSong: async () => {
      await get().next();
    },

    previousSong: async () => {
      await get().previous();
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
              showToast("error", "Failed to prefetch song");
            });
          fetchPromises.push(promise);
        }
      }
      await Promise.all(fetchPromises);
    },

    setDuration: (duration: number) => set({ duration }),
    setCurrentTime: (time: number) => {
      set({ currentTime: time, fineProgress: time });
      // backup lightweight progress
      get().persist();
    },

    // setVolume defined above

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
      const { rafId, isPlaying } = get();
      if (isPlaying && rafId === null) {
        const update = () => {
          const inst = get().playerRef?.current as any;
          const el: HTMLMediaElement | null =
            inst?.getInternalPlayer?.() ?? inst?.el ?? inst?.player ?? null;
          if (!get().isPlaying || !el) {
            get().stopFineProgressUpdates();
            return;
          }
          const t = el.currentTime || 0;
          set({ currentTime: t, fineProgress: t });
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

    // Helpers (added by closure augmentation below)
    rebuildShuffleOrder: () => {},
    persist: () => {},
    applyPlaybackRate: () => {},
    applyVolume: () => {},
    scheduleSuspend: () => {},
    initializeEngineIfNeeded: () => {
      const { engineReady, playerRef } = get();
      if (engineReady) return;
      const inst = playerRef?.current as any;
      const media: HTMLMediaElement | null =
        inst?.getInternalPlayer?.() ?? inst?.el ?? inst?.player ?? null;
      if (!media) return;
      try {
        const Ctx =
          (window as any).AudioContext || (window as any).webkitAudioContext;
        const ctx = new Ctx();
        const source = ctx.createMediaElementSource(media);
        const gain = ctx.createGain();
        source.connect(gain).connect(ctx.destination);
        set({
          audioCtx: ctx,
          mediaNode: source,
          gainNode: gain,
          engineReady: true,
        });
        (get() as any).applyVolume?.();
        (get() as any).applyPlaybackRate?.();
      } catch {}
    },
  })
);

// Augment store with helpers that need closure access
type Store = ReturnType<typeof useAudioStore.getState> & {
  rebuildShuffleOrder: () => void;
  persist: () => void;
  applyPlaybackRate: () => void;
  applyVolume: () => void;
  scheduleSuspend: () => void;
};

const attachHelpers = () => {
  const get = useAudioStore.getState;
  const set = useAudioStore.setState;

  (useAudioStore.getState() as Store).rebuildShuffleOrder = () => {
    const { queue, shuffleSeed, currentIndex } = get();
    const order = shuffleIndices(queue.length, shuffleSeed);
    const ptr = order.findIndex((i) => i === currentIndex);
    set({ shuffleOrder: order, shufflePtr: ptr });
  };

  (useAudioStore.getState() as Store).applyPlaybackRate = () => {
    const { playerRef, playbackRate } = get();
    try {
      const inst = playerRef?.current as any;
      const el: HTMLMediaElement | null =
        inst?.getInternalPlayer?.() ?? inst?.el ?? inst?.player ?? null;
      if (el) el.playbackRate = playbackRate;
    } catch {}
  };

  (useAudioStore.getState() as Store).applyVolume = () => {
    const { gainNode, volume, muted } = get();
    try {
      if (gainNode)
        gainNode.gain.value = muted ? 0 : Math.max(0, Math.min(1, volume));
    } catch {}
  };

  (useAudioStore.getState() as Store).persist = () => {
    const {
      queue,
      currentIndex,
      isPlaying,
      volume,
      muted,
      playbackRate,
      shuffle,
      shuffleSeed,
      repeat,
      currentTime,
    } = get();
    // Only persist minimal fields of songs to reduce storage, but here we keep full for simplicity
    saveState(PERSIST_KEY, {
      queue,
      currentIndex,
      isPlaying,
      volume,
      muted,
      playbackRate,
      shuffle,
      shuffleSeed,
      repeat,
      currentTime,
      crossfadeEnabled: get().crossfadeEnabled,
      crossfadeSeconds: get().crossfadeSeconds,
    });
  };

  (useAudioStore.getState() as Store).scheduleSuspend = () => {
    const { audioCtx, suspendTimer } = get();
    if (!audioCtx) return;
    if (suspendTimer) clearTimeout(suspendTimer);
    const timer = setTimeout(async () => {
      try {
        if (audioCtx.state === "running") await audioCtx.suspend();
      } catch {}
    }, 20_000); // 20s idle
    set({ suspendTimer: timer });
  };

  (useAudioStore.getState() as Store).initializeEngineIfNeeded = () => {
    const { engineReady, playerRef } = get();
    if (engineReady) return;

    const inst = playerRef?.current as any;
    const media: HTMLMediaElement | null =
      inst?.getInternalPlayer?.() ?? inst?.el ?? inst?.player ?? null;

    if (!media) return;
    try {
      const Ctx =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new Ctx();
      const source = ctx.createMediaElementSource(media);
      const gain = ctx.createGain();
      source.connect(gain).connect(ctx.destination);
      set({
        audioCtx: ctx,
        mediaNode: source,
        gainNode: gain,
        engineReady: true,
      });
      (get() as any).applyVolume?.();
      (get() as any).applyPlaybackRate?.();
    } catch {}
  };
};

attachHelpers();

// Attempt to restore state on first import (client only)
if (typeof window !== "undefined") {
  (async () => {
    const data = await loadState<any>(PERSIST_KEY, PERSIST_MAX_AGE_MS, 1);
    if (!data) return;
    useAudioStore.setState({
      queue: data.queue ?? [],
      currentIndex: data.currentIndex ?? -1,
      isPlaying: false, // don't auto play until engine ready
      volume: typeof data.volume === "number" ? data.volume : 0.15,
      muted: !!data.muted,
      playbackRate: data.playbackRate ?? 1,
      shuffle: !!data.shuffle,
      shuffleSeed: data.shuffleSeed ?? reseedFromTime(),
      repeat: (data.repeat as RepeatMode) ?? "off",
      currentTime: data.currentTime ?? 0,
      fineProgress: data.currentTime ?? 0,
      crossfadeEnabled: !!data.crossfadeEnabled,
      crossfadeSeconds:
        typeof data.crossfadeSeconds === "number" ? data.crossfadeSeconds : 6,
    });
    // Recompute shuffle order
    const st = useAudioStore.getState();
    if (st.shuffle) (st as Store).rebuildShuffleOrder();
    // Auto-resume if updated recently
    const saved = await loadState<any>(PERSIST_KEY, AUTORESUME_WINDOW_MS, 1);
    if (saved && saved.currentIndex >= 0) {
      // Try to resume playback after user gesture, UI should call play()
    }
  })();
}
