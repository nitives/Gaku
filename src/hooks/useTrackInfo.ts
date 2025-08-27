"use client";

import { useQuery } from "@tanstack/react-query";

const ONE_DAY_MS = 1000 * 60 * 60 * 24;

async function fetchTrackInfo(id: number) {
  const res = await fetch(`/api/track/info/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch track info: ${res.status}`);
  return res.json();
}

/**
 * useTrackInfo
 * - Caches per-track info for 1 day (customize as needed)
 */
export function useTrackInfo(id?: number) {
  return useQuery({
    queryKey: ["soundcloud", "track", id],
    queryFn: () => fetchTrackInfo(id as number),
    enabled: typeof id === "number" && !Number.isNaN(id),
    staleTime: ONE_DAY_MS,
    gcTime: ONE_DAY_MS,
    retry: 1,
  });
}
