"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";

export interface LocalSettings {
  themeColor: string;
  highlightedQueries: boolean;
  showSidebarIcons: boolean;
  soundcloudProfileUrl: string;
  soundcloudUserId: string;
  librarySongIds: string[];
}

export const DEFAULT_SETTINGS: LocalSettings = {
  themeColor: "#5891fa",
  highlightedQueries: false,
  showSidebarIcons: true,
  soundcloudProfileUrl: "",
  soundcloudUserId: "",
  librarySongIds: [],
};

const STORAGE_KEY = "gaku-settings";
const CHANGE_EVENT = "gaku-settings-change";
const CLERK_META_KEY = "gakuSettings";

function read(): LocalSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function write(settings: LocalSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  window.dispatchEvent(
    new CustomEvent<LocalSettings>(CHANGE_EVENT, { detail: settings }),
  );
}

export function exportSettings(): void {
  const settings = read();
  const blob = new Blob([JSON.stringify(settings, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "gaku-settings.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function useLocalSettings() {
  const [settings, setSettings] = useState<LocalSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { user, isLoaded: clerkLoaded, isSignedIn } = useUser();
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize settings from Clerk metadata (if signed in) or localStorage.
  // Re-runs when the user account changes so signing in/out updates settings.
  useEffect(() => {
    if (!clerkLoaded) return;
    if (isSignedIn && user?.unsafeMetadata?.[CLERK_META_KEY]) {
      const merged: LocalSettings = {
        ...DEFAULT_SETTINGS,
        ...(user.unsafeMetadata[CLERK_META_KEY] as Partial<LocalSettings>),
      };
      write(merged);
      setSettings(merged);
    } else {
      setSettings(read());
    }
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clerkLoaded, user?.id]);

  // Cross-tab and same-tab change listeners
  useEffect(() => {
    const handler = (e: Event) => {
      setSettings((e as CustomEvent<LocalSettings>).detail);
    };
    const storageHandler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setSettings(read());
    };
    window.addEventListener(CHANGE_EVENT, handler);
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener(CHANGE_EVENT, handler);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  // Debounced sync to Clerk (800ms) — silently falls back to local-only on failure
  const syncToClerk = useCallback(
    (updated: LocalSettings) => {
      if (!user) return;
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      setIsSyncing(true);
      syncTimerRef.current = setTimeout(() => {
        user
          .update({ unsafeMetadata: { [CLERK_META_KEY]: updated } })
          .catch(console.error)
          .finally(() => setIsSyncing(false));
      }, 800);
    },
    [user],
  );

  const updateSetting = useCallback(
    <K extends keyof LocalSettings>(key: K, value: LocalSettings[K]) => {
      const updated = { ...read(), [key]: value };
      write(updated);
      setSettings(updated);
      if (user) syncToClerk(updated);
    },
    [user, syncToClerk],
  );

  const importSettings = useCallback(
    (file: File): Promise<void> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const merged: LocalSettings = {
              ...DEFAULT_SETTINGS,
              ...JSON.parse(e.target?.result as string),
            };
            write(merged);
            setSettings(merged);
            if (user) syncToClerk(merged);
            resolve();
          } catch {
            reject(new Error("Invalid settings file"));
          }
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsText(file);
      }),
    [user, syncToClerk],
  );

  return {
    settings,
    loaded,
    isSignedIn: isSignedIn ?? false,
    isSyncing,
    updateSetting,
    exportSettings,
    importSettings,
  };
}
