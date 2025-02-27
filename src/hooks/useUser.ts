import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const useUser = () => {
  const queryClient = useQueryClient();

  // Fetch the user's library songs
  const getLibrarySongs = useQuery({
    queryKey: ['librarySongs'],
    queryFn: async () => {
      const response = await axios.get('/api/user/library');
      return response.data;
    },
  });

  // Add a song to the user's library
  const addSongToLibrary = useMutation({
    mutationFn: async (soundcloudId: string) => {
      const response = await axios.post('/api/user/library', { soundcloudId });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate the librarySongs query to refetch the updated list
      queryClient.invalidateQueries({ queryKey: ['librarySongs'] });
    },
  });

  return {
    librarySongs: getLibrarySongs.data, // Array of songs or undefined if not loaded
    isLoading: getLibrarySongs.isLoading, // Boolean indicating loading state
    error: getLibrarySongs.error, // Any error from fetching songs
    addSongToLibrary: addSongToLibrary.mutate, // Function to add a song
  };
};