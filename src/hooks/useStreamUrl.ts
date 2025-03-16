import { useQuery } from "@tanstack/react-query";

export function useStreamUrl(trackId: number) {
  return useQuery({
    queryKey: ["streamUrl", trackId],
    queryFn: async () => {
      const response = await fetch(`/api/streams/${trackId}`);
      if (!response.ok) throw new Error("Failed to fetch streaming URL");
      const data = await response.json();
      return data.url as string;
    },
    staleTime: 4 * 60 * 1000, // Consider the URL stale after 4 minutes
    refetchInterval: 4 * 60 * 1000, // Automatically refetch every 4 minutes
    enabled: !!trackId,
  });
}
