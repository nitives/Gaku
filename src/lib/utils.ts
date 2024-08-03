import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const clientId = "HdNkyvYLhMiAeZEVUCvn8NQOVKjIj9OS";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function FetchSearch(query: string) {
  try {
    const response = await fetch(`/api/soundcloud?q=${query}`);
    console.log("FetchSearch | response:", response);
    if (!response.ok) throw new Error("FetchSearch | Failed to fetch data");
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error:", error);
  }
}

export async function fetchPlaylistM3U8(trackUrl: string) {
  try {
    const response = await fetch(
      `/api/soundcloud/music?trackUrl=${encodeURIComponent(trackUrl)}`
    );
    console.log("fetchPlaylistM3U8 | response:", response);
    if (!response.ok) throw new Error("Failed to fetch playlist URL");
    const data = await response.json();
    console.log("API fetchPlaylistM3U8 | data:", data);
    return data.playlistUrl;
  } catch (error) {
    console.error("Error fetching playlist URL:", error);
  }
}

