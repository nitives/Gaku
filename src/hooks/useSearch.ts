import { useState, useEffect } from "react";
import { SoundCloudSearchResult } from "@/lib/types/soundcloud";

type SoundCloudCollection = SoundCloudSearchResult;

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function useSearch(defaultValue: string) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<SoundCloudCollection>();
  const [showDropdown, setShowDropdown] = useState(false);

  // Debounce the raw `query`
  const debouncedQuery = useDebounce(query, 10);

  const handleInputChange = (newQuery: string) => {
    setQuery(newQuery);
    setShowDropdown(true);
  };

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults(undefined);
      return;
    }

    const fetchResults = async () => {
      try {
        const res = await fetch(
          `/api/soundcloud/search?q=${encodeURIComponent(debouncedQuery)}`
        );
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const data: SoundCloudSearchResult = await res.json();
        setResults(data);
      } catch (error) {
        console.error("Search request error:", error);
        setResults(undefined);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  return {
    query,
    results,
    showDropdown,
    handleInputChange,
    setShowDropdown,
  };
}
