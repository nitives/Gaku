"use client";
import { createContext, useContext, useMemo } from "react";
import useSWR from "swr";
import { useUser as useClerkUser } from "@clerk/nextjs";

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
  const { isSignedIn: isLoggedIn } = useClerkUser() || { isSignedIn: false };

  // Only fetch when logged in; when not logged in pass null to SWR to skip fetching.
  const { data: settings, error: settingsErr } = useSWR(
    isLoggedIn ? "/api/user/settings" : null,
    fetcher,
    {
      suspense: false,
      revalidateOnFocus: false,
    }
  );

  const { data: songs, error: songsErr } = useSWR(
    isLoggedIn ? "/api/user/songs" : null,
    fetcher,
    {
      suspense: false,
      revalidateOnFocus: false,
      dedupingInterval: 15_000,
      keepPreviousData: true,
    }
  );

  const value = useMemo<Ctx>(
    () => ({
      settings,
      songs,
      // If not logged in, nothing is loading (we're intentionally not fetching).
      loading: isLoggedIn ? !settings || !songs : false,
      error: settingsErr || songsErr,
    }),
    [settings, songs, settingsErr, songsErr, isLoggedIn]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useUser = () => useContext(Ctx);
