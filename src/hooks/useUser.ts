import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { showToast } from "./useToast";

// Define the type for a song
interface Song {
  id: string;
  createdAt: string;
  updatedAt: string;
}

interface UserSettings {
  createdAt: Date;
  highlightedQueries: boolean;
  id: string;
  showSidebarIcons: boolean;
  themeColor: string;
  updatedAt: Date;
  userId: string;
  soundcloudUserId: string;
}

// Define the type for the library songs
type LibrarySongs = Song[];

export const useUser = () => {
  const queryClient = useQueryClient();

  // Fetch the user's library songs
  const { data, isLoading, error } = useQuery<LibrarySongs>({
    queryKey: ["librarySongIDs"],
    queryFn: async () => (await axios.get("/api/user/songs")).data,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Add a song to the user's library
  const { mutate: addSong } = useMutation({
    mutationFn: async (soundcloudId: string) => {
      const response = await axios.post("/api/user/songs", { soundcloudId });
      return response.data as Song;
    },
    // Optimistic update
    onMutate: async (soundcloudId: string) => {
      await queryClient.cancelQueries({ queryKey: ["librarySongIDs"] });
      const previous = queryClient.getQueryData<LibrarySongs>([
        "librarySongIDs",
      ]);

      const optimistic: Song = {
        id: soundcloudId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<LibrarySongs>(["librarySongIDs"], (old) => {
        const base = old ?? [];
        // avoid duplicates
        if (base.some((s) => s.id === soundcloudId)) return base;
        return [...base, optimistic];
      });

      return { previous } as { previous?: LibrarySongs };
    },
    onError: (_err, _vars, ctx) => {
      // rollback
      if (ctx?.previous) {
        queryClient.setQueryData(["librarySongIDs"], ctx.previous);
      }
      showToast("error", `Failed to add song`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["librarySongIDs"] });
    },
  });

  // Remove a song from the user's library
  const { mutate: removeSong } = useMutation({
    mutationFn: async (soundcloudId: string) => {
      const response = await axios.delete("/api/user/songs", {
        data: { soundcloudId },
      });
      return response.data as { success: boolean };
    },
    onMutate: async (soundcloudId: string) => {
      await queryClient.cancelQueries({ queryKey: ["librarySongIDs"] });
      const previous = queryClient.getQueryData<LibrarySongs>([
        "librarySongIDs",
      ]);

      queryClient.setQueryData<LibrarySongs>(["librarySongIDs"], (old) => {
        const base = old ?? [];
        return base.filter((s) => s.id !== soundcloudId);
      });

      return { previous } as { previous?: LibrarySongs };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["librarySongIDs"], ctx.previous);
      }
      showToast("error", `Failed to remove song`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["librarySongIDs"] });
    },
  });

  const {
    data: settings,
    isLoading: isLoadingSettings,
    error: settingsError,
  } = useQuery<UserSettings>({
    queryKey: ["userSettings"],
    queryFn: async () => {
      const response = await axios.get("/api/user/settings");
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    settings: {
      data: settings,
      isLoading: isLoadingSettings,
      error: settingsError,
    },
    librarySongs: data, // Array of songs or undefined if not loaded
    isLoading, // Boolean indicating loading state
    error, // Any error from fetching songs
    addSongToLibrary: addSong, // Function to add a song
    removeSongFromLibrary: removeSong, // Function to remove a song
  };
};
