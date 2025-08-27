"use client";

import { useQuery, QueryKey } from "@tanstack/react-query";
import type { SoundCloudSections } from "@/lib/types/soundcloud";

// 2 days in milliseconds
const TWO_DAYS_MS = 1000 * 60 * 60 * 24 * 2;

export const homeSectionsQueryKey: QueryKey = [
  "soundcloud",
  "home",
  "sections",
];

async function fetchHomeSections(): Promise<SoundCloudSections> {
  const res = await fetch("/api/soundcloud/home/section", {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch home sections: ${res.status}`);
  }
  return res.json();
}

/**
 * useHomeSections
 * - Caches SoundCloud home sections for 2 days
 * - Data considered fresh for 2 days (staleTime)
 * - Garbage-collected from cache after 2 days of inactivity (gcTime)
 */
export function useHomeSections() {
  return useQuery<SoundCloudSections>({
    queryKey: homeSectionsQueryKey,
    queryFn: fetchHomeSections,
    staleTime: TWO_DAYS_MS,
    gcTime: TWO_DAYS_MS,
    // Disable retries for now; adjust as desired
    retry: 1,
  });
}
