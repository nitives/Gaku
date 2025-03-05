import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// Define the type for a song
interface Song {
  id: string;
  createdAt: string;
  updatedAt: string;
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
  const { mutate } = useMutation({
    mutationFn: async (soundcloudId: string) => {
      const response = await axios.post("/api/user/songs", { soundcloudId });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the librarySongs query to refetch the updated list
      queryClient.invalidateQueries({ queryKey: ["librarySongs"] });
    },
  });

  return {
    librarySongs: data, // Array of songs or undefined if not loaded
    isLoading, // Boolean indicating loading state
    error, // Any error from fetching songs
    addSongToLibrary: mutate, // Function to add a song
  };
};
