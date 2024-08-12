import { useState, useEffect } from "react";
import { generateLibraryKey } from "../lib/utils/libraryKey";

interface Song {
  id: string;
  title: string;
  artist: string;
  addedAt: string;
}

interface LibraryData {
  key: string;
  name?: string;
  songs: Song[];
}

export function useLibrary() {
  const [library, setLibrary] = useState<LibraryData | null>(null);
  const [globalLibraryKey, setGlobalLibraryKey] = useState<string | null>(null);

  useEffect(() => {
    const storedKey = localStorage.getItem("GAKU_libraryKey");
    if (storedKey) {
      setGlobalLibraryKey(storedKey);
      fetchLibrary(storedKey);
    }
  }, []);

  const fetchLibrary = async (key: string) => {
    try {
      const response = await fetch(`/api/library/sync?key=${key}`);
      if (response.ok) {
        const data = await response.json();
        setLibrary(data);
      }
    } catch (error) {
      console.error("Error fetching library:", error);
    }
  };

  const createLibrary = () => {
    const newKey = generateLibraryKey();
    localStorage.setItem("GAKU_libraryKey", newKey);
    setGlobalLibraryKey(newKey);
    const newLibrary: LibraryData = {
      key: newKey,
      songs: [],
    };
    syncLibraryWithDatabase(newLibrary);
    setLibrary(newLibrary);
  };

  const updateLibraryName = (key: string, name: string) => {
    if (library && library.key === key) {
      const updatedLibrary = { ...library, name };
      setLibrary(updatedLibrary);
      syncLibraryWithDatabase(updatedLibrary);
    } else {
      console.error("Library not found for the given key.");
    }
  };

  const addSong = (song: Omit<Song, "addedAt">) => {
    if (library) {
      const updatedLibrary = {
        ...library,
        songs: [
          { ...song, addedAt: new Date().toISOString() },
          ...library.songs,
        ],
      };
      setLibrary(updatedLibrary);
      syncLibraryWithDatabase(updatedLibrary);
    } else {
      console.error("Failed to add song: Library not found.");
    }
  };

  const removeSong = (songId: string) => {
    if (library) {
      const updatedLibrary = {
        ...library,
        songs: library.songs.filter((song) => song.id !== songId),
      };
      setLibrary(updatedLibrary);
      syncLibraryWithDatabase(updatedLibrary);
    } else {
      console.error("Failed to remove song: Library not found.");
    }
  };

  const isSongInLibrary = (songId: string): boolean => {
    return library?.songs.some((song) => song.id === songId) || false;
  };

  const importLibrary = async (key: string) => {
    try {
      const response = await fetch(`/api/library/sync?key=${key}`);
      if (response.ok) {
        const data = await response.json();
        setLibrary(data);
        localStorage.setItem("GAKU_libraryKey", key);
        setGlobalLibraryKey(key);
        return data;
      } else if (response.status === 404) {
        return { error: "Library not found" };
      } else {
        throw new Error("Failed to import library");
      }
    } catch (error) {
      console.error("Error importing library:", error);
      return { error: "Error importing library" };
    }
  };

  const syncLibraryWithDatabase = async (library: LibraryData) => {
    try {
      const response = await fetch("/api/library/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(library),
      });
      if (!response.ok) {
        throw new Error("Failed to sync library with database");
      }
    } catch (error) {
      console.error("Error syncing library with database:", error);
    }
  };

  return {
    library,
    setLibrary,
    createLibrary,
    updateLibraryName,
    addSong,
    removeSong,
    importLibrary,
    isSongInLibrary,
    globalLibraryKey,
  };
}
