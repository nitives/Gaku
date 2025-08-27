// app/providers/UserDataProvider.tsx
"use client";
import { createContext, useContext, useMemo } from "react";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });

type Ctx = {
  settings?: any;
  songs?: any[];
  loading: boolean;
  error?: Error;
};

const Ctx = createContext<Ctx>({ loading: true });

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  // Load in parallel, non-blocking, and only once (shared SWR cache).
  const { data: settings, error: settingsErr } = useSWR(
    "/api/user/settings",
    fetcher,
    {
      suspense: false,
      revalidateOnFocus: false,
    }
  );
  const { data: songs, error: songsErr } = useSWR("/api/user/songs", fetcher, {
    suspense: false,
    revalidateOnFocus: false,
    dedupingInterval: 15_000, // coalesce repeated mounts
    keepPreviousData: true,
  });

  const value = useMemo<Ctx>(
    () => ({
      settings,
      songs,
      loading: !settings || !songs,
      error: settingsErr || songsErr,
    }),
    [settings, songs, settingsErr, songsErr]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useUser = () => useContext(Ctx);
