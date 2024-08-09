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
  name?: string; // Optional name field
  songs: Song[];
}

export function useLibrary() {
  const [library, setLibrary] = useState<LibraryData | null>(null);

  useEffect(() => {
    // Check the database first
    const syncLibraryWithLocalStorage = async () => {
      try {
        const response = await fetch("/api/library/sync", {
          method: "GET",
        });

        if (response.ok) {
          const dbLibrary = await response.json();
          if (dbLibrary) {
            setLibrary(dbLibrary); // Use database data if available
            localStorage.setItem("userLibrary", JSON.stringify(dbLibrary));
          } else {
            const storedLibrary = localStorage.getItem("userLibrary");
            if (storedLibrary) {
              const localLibrary = JSON.parse(storedLibrary);
              setLibrary(localLibrary);
              syncLibraryWithDatabase(localLibrary); // Sync to DB if not present
            }
          }
        }
      } catch (error) {
        console.error("Error fetching library from database:", error);
        const storedLibrary = localStorage.getItem("userLibrary");
        if (storedLibrary) {
          setLibrary(JSON.parse(storedLibrary));
        }
      }
    };

    syncLibraryWithLocalStorage();
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

  const updateLibraryName = (key: string, name: string) => {
    if (library && library.key === key) {
      const updatedLibrary = { ...library, name };
      setLibrary(updatedLibrary);
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
    updateLibraryName,
    addSong,
    removeSong,
    importLibrary,
    isSongInLibrary,
  };
}
