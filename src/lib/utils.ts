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
    if (!response.ok) throw new Error("Failed to fetch playlist URL");
    const data = await response.json();
    return data.playlistUrl;
  } catch (error) {
    console.error("Error fetching playlist URL | fetchPlaylistM3U8:", error);
  }
}

export async function fetchUserData(profileUrl: string) {
  try {
    const response = await fetch(
      `/api/soundcloud/user/userData?profileUrl=${profileUrl}`
    );
    if (!response.ok) throw new Error("Failed to fetch users data");
    const data = await response.json();
    return data;
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

export const dev = {
  log: (message?: any, ...optionalParams: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `%c[LOG]`,
        "color: #9ae517; font-weight: bold",
        message,
        ...optionalParams
      );
    }
  },
  info: (message?: any, ...optionalParams: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      console.info(
        `%c[INFO]`,
        "color: blue; font-weight: bold",
        message,
        ...optionalParams
      );
    }
  },
  warn: (message?: any, ...optionalParams: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `%c[WARN]`,
        "color: orange; font-weight: bold",
        message,
        ...optionalParams
      );
    }
  },
  error: (message?: any, ...optionalParams: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      console.error(
        `%c[ERROR]`,
        "color: red; font-weight: bold",
        message,
        ...optionalParams
      );
    }
  },
  debug: (message?: any, ...optionalParams: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(
        `%c[DEBUG]`,
        "color: purple; font-weight: bold",
        message,
        ...optionalParams
      );
    }
  },
};
