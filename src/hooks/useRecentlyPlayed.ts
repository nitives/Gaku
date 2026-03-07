"use client";
import { useEffect, useCallback } from "react";
import { useAudioStore } from "@/context/AudioContext";

export interface RecentlyPlayedItem {
  id: number;
  title: string;
  subtitle: string;
  artworkUrl: string;
  href: string;
  explicit: boolean;
  playedAt: number;
}

const STORAGE_KEY = "gaku-recently-played";
const MAX_ITEMS = 30;

function readItems(): RecentlyPlayedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeItems(items: RecentlyPlayedItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addRecentlyPlayed(
  item: Omit<RecentlyPlayedItem, "playedAt">,
): void {
  const current = readItems().filter((i) => i.id !== item.id);
  const updated: RecentlyPlayedItem[] = [
    { ...item, playedAt: Date.now() },
    ...current,
  ].slice(0, MAX_ITEMS);
  writeItems(updated);
}

export function getRecentlyPlayed(): RecentlyPlayedItem[] {
  return readItems();
}

/** Subscribes to the audio store and records each new current song. */
export function useRecentlyPlayedTracker(): void {
  const currentSong = useAudioStore((s) => s.currentSong);

  useEffect(() => {
    if (!currentSong) return;
    addRecentlyPlayed({
      id: currentSong.id,
      title: currentSong.name,
      subtitle: currentSong.artist?.name ?? "",
      artworkUrl: currentSong.artwork?.hdUrl ?? currentSong.artwork?.url ?? "",
      href: `/song/${currentSong.artist?.permalink ?? "track"}/${currentSong.id}`,
      explicit: currentSong.explicit ?? false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?.id]);
}

export function useRecentlyPlayed(): RecentlyPlayedItem[] {
  // Just read synchronously for SSR-safe initial render; real value is set in Sections client component
  if (typeof window === "undefined") return [];
  return readItems();
}
