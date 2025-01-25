"use client";
import React from "react";
import { useRouter } from "next/navigation";
import useSearch from "@/hooks/useSearch";
import { SearchBar } from "./SearchBar";
import SearchDropdown from "./SearchDropdown";

const Search = () => {
  const router = useRouter();
  const { query, results, showDropdown, handleInputChange, setShowDropdown } =
    useSearch("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setShowDropdown(false);
    }
  };

  const handleBlur = () => {
    // Use setTimeout to allow click events on dropdown to fire first
    setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  return (
    <div className="relative">
      <SearchBar
        query={query}
        placeholder="Search"
        handleInputChange={(e) => handleInputChange(e.target.value)}
        onBlur={handleBlur}
        onSubmit={handleSubmit}
      />
      {showDropdown && results && (
        <SearchDropdown
          typedQuery={query}
          results={results}
          setShowDropdown={setShowDropdown}
        />
      )}
    </div>
  );
};

export default Search;
