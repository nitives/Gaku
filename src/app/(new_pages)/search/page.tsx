"use client";

import { Banner } from "@/rework/components/navigation/search/page/Banner";
import { Spinner } from "@/rework/components/extra/Spinner";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import SearchResults from "@/rework/components/navigation/search/page/SearchResults";

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

export default function Search() {
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

type TryAgainProps = {
  errorName: string;
  errorMessage: string;
  onTryAgain: () => void;
};

export function TryAgain({
  errorMessage,
  errorName,
  onTryAgain,
}: TryAgainProps) {
  return (
    <div className="w-fit h-[95vh] flex flex-col items-center justify-center text-center m-auto">
      <p style={{ textAlign: "center", fontWeight: 600 }}>{errorName}</p>
      <p style={{ color: "var(--systemSecondary)", maxWidth: "10rem" }}>
        {errorMessage}
      </p>
      <button id="TryAgainSearchButton" onClick={onTryAgain}>
        Try again
      </button>
    </div>
  );
}
