import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function FetchHipHopEvents() {
  try {
    const response = await fetch(`/api/soundcloud/events/top50hiphop`);
    console.log("FetchHipHopEvents | response:", response);
    if (!response.ok)
      throw new Error("FetchHipHopEvents | Failed to fetch data");
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error | FetchHipHopEvents:", error);
  }
}

export async function FetchNewHotEvents() {
  try {
    const response = await fetch(`/api/soundcloud/events/new&hot`);
    console.log("FetchNewHotEvents | response:", response);
    if (!response.ok)
      throw new Error("FetchNewHotEvents | Failed to fetch data");
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error | FetchNewHotEvents:", error);
  }
}

export async function FetchSearch(query: string) {
  try {
    const response = await fetch(`/api/soundcloud?q=${query}`);
    console.log("FetchSearch | response:", response);
    if (!response.ok) throw new Error("FetchSearch | Failed to fetch data");
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error | FetchSearch:", error);
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
    console.error("Error fetching playlist URL | fetchPlaylistM3U8:", error);
  }
}

export async function fetchUserData(trackUrl: string) {
  try {
    const response = await fetch(
      `/api/soundcloud/user/userData?profileUrl=${encodeURIComponent(trackUrl)}`
    );
    console.log("fetchUserData | response:", response);
    if (!response.ok) throw new Error("Failed to fetch users data");
    const data = await response.json();
    console.log("API fetchUserData | data:", data);
    return data.playlistUrl;
  } catch (error) {
    console.error("Error fetching users data | fetchUserData:", error);
  }
}

export async function fetchLyrics(title: string, artist: string) {
  try {
    // Replace "octobersveryown" with "Drake"
    if (artist.toLowerCase() === "octobersveryown") {
      artist = "Drake";
    }
    console.log(`fetchLyrics | artist and title:", ${artist} - ${title})`);
    const response = await fetch(
      `https://lyrix.vercel.app/getLyricsByName/${artist}/${title}/?remix=false`
    );
    console.log("fetchLyrics | response:", response);
    if (!response.ok) throw new Error("Failed to fetch lyrics");
    const data = await response.json();
    console.log("API fetchLyrics | data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching lyrics | fetchLyrics:", error);
  }
}

export async function fetchRichSyncLyrics(title: string, artist: string) {
  try {
    // Replace "octobersveryown" with "Drake"
    if (artist.toLowerCase() === "octobersveryown") {
      artist = "Drake";
    }

    const response = await fetch(
      `/api/lyrics/get?artist=${artist}&track=${title}`
    );
    console.log("fetchRichSyncLyrics | response:", response);
    if (!response.ok) throw new Error("Failed to fetch lyrics");
    const data = await response.json();
    console.log("API fetchRichSyncLyrics | data:", data);
    return data;
  } catch (error) {
    console.error(
      "Error fetching rich sync lyrics | fetchRichSyncLyrics:",
      error
    );
  }
}

