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
  songs: Song[];
}

export function useLibrary() {
  const [library, setLibrary] = useState<LibraryData | null>(null);

  useEffect(() => {
    const storedLibrary = localStorage.getItem("userLibrary");
    if (storedLibrary) {
      setLibrary(JSON.parse(storedLibrary));
    }
  }, []);

  useEffect(() => {
    if (library) {
      localStorage.setItem("userLibrary", JSON.stringify(library));
      syncLibraryWithDatabase(library); // Sync with the database whenever the library changes
    }
  }, [library]);

  const createLibrary = () => {
    const newLibrary: LibraryData = {
      key: generateLibraryKey(),
      songs: [],
    };
    setLibrary(newLibrary);
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
    }
  };

  const removeSong = (songId: string) => {
    if (library) {
      const updatedLibrary = {
        ...library,
        songs: library.songs.filter((song) => song.id !== songId),
      };
      setLibrary(updatedLibrary);
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
        localStorage.setItem("userLibrary", JSON.stringify(data));
        return data; // Return the data to indicate success
      } else if (response.status === 404) {
        return { error: "Library not found" }; // Handle case when library is not found
      } else {
        throw new Error("Failed to import library");
      }
    } catch (error) {
      console.error("Error importing library:", error);
      return { error: "Error importing library" }; // Return error for further handling
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
    createLibrary,
    addSong,
    removeSong,
    importLibrary,
    isSongInLibrary,
  };
}
