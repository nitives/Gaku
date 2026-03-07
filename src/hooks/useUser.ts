import { useMemo, useCallback } from "react";
import { useLocalSettings } from "./useLocalSettings";

// Define the type for a song
interface Song {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export const useUser = () => {
  const { settings, loaded, updateSetting } = useLocalSettings();

  // Derive Song[] from stored IDs (newest first = index 0)
  const librarySongs: Song[] = useMemo(() => {
    const ids = settings.librarySongIds ?? [];
    const now = Date.now();
    return ids.map((id, i) => ({
      id,
      // Synthetic timestamps: earlier entries get slightly older timestamps
      // so sort-by-createdAt-desc preserves insertion order (newest first)
      createdAt: new Date(now - i * 1000).toISOString(),
      updatedAt: new Date(now - i * 1000).toISOString(),
    }));
  }, [settings.librarySongIds]);

  const addSongToLibrary = useCallback(
    (soundcloudId: string) => {
      const current = settings.librarySongIds ?? [];
      if (current.includes(soundcloudId)) return;
      updateSetting("librarySongIds", [soundcloudId, ...current]);
    },
    [settings.librarySongIds, updateSetting],
  );

  const removeSongFromLibrary = useCallback(
    (soundcloudId: string) => {
      const current = settings.librarySongIds ?? [];
      updateSetting(
        "librarySongIds",
        current.filter((id) => id !== soundcloudId),
      );
    },
    [settings.librarySongIds, updateSetting],
  );

  return {
    settings: {
      data: loaded ? settings : undefined,
      isLoading: !loaded,
      error: null,
    },
    librarySongs,
    isLoading: !loaded,
    error: null,
    addSongToLibrary,
    removeSongFromLibrary,
  };
};
