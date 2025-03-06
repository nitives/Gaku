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
    queryKey: ["librarySongs"],
    queryFn: async () => {
      const response = await axios.get("/api/user/songs");
      return response.data;
    },
  });

  // Add a song to the user's library
  const { mutate: addSong } = useMutation({
    mutationFn: async (soundcloudId: string) => {
      const response = await axios.post("/api/user/songs", { soundcloudId });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the librarySongs query to refetch the updated list
      queryClient.invalidateQueries({ queryKey: ["librarySongs"] });
    },
    onError: () => {
      showToast("error", `Failed to add song`);
    },
  });

  // Remove a song from the user's library
  const { mutate: removeSong } = useMutation({
    mutationFn: async (soundcloudId: string) => {
      const response = await axios.delete("/api/user/songs", {
        data: { soundcloudId },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["librarySongs"] });
    },
    onError: () => {
      showToast("error", `Failed to remove song`);
    },
  });

  const settings = useQuery<UserSettings>({
    queryKey: ["userSettings"],
    queryFn: async () => {
      const response = await axios.get("/api/user/settings");
      return response.data;
    },
  });

  return {
    settings: settings.data,
    librarySongs: data, // Array of songs or undefined if not loaded
    isLoading, // Boolean indicating loading state
    error, // Any error from fetching songs
    addSongToLibrary: addSong, // Function to add a song
    removeSongFromLibrary: removeSong, // Function to remove a song
  };
};
