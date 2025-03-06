"use client";
import { Banner } from "@/rework/components/navigation/search/page/Banner";
import { Spinner } from "@/rework/components/extra/Spinner";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import SearchResults from "@/rework/components/navigation/search/page/SearchResults";
import { TryAgain } from "@/rework/components/extra/TryAgain";
import { Suspense } from "react";

const fetchSoundCloudResults = async (query: string | null) => {
  if (!query) return null;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(); // abort the request
  }, 15000); // 15s
  try {
    const response = await fetch(
      `/api/soundcloud/search?q=${encodeURIComponent(query)}&type=full`,
      { signal: controller.signal }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch search results");
    }
    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
};

// Create a separate component that uses useSearchParams
function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") || "";

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["soundcloudSearch", query],
    queryFn: () => fetchSoundCloudResults(query),
    enabled: Boolean(query),
    staleTime: 60_000, // 1 minute
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  if (!searchParams) return null;

  if (!data) {
    return (
      <div>
        <Banner query={query} />
        {isLoading && <Spinner />}
        {error && (
          <TryAgain
            errorMessage={(error as Error).message}
            errorName={(error as Error).name}
            onTryAgain={() => {
              refetch();
            }}
          />
        )}
      </div>
    );
  } else {
    return (
      <div>
        <Banner query={query} />
        <SearchResults data={data} />
      </div>
    );
  }
}

// Main page component with Suspense
export default function Search() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
