import { Song } from "./types";
import { fetchPlaylistM3U8 } from "@/lib/utils";

/**
 * Fetch additional metadata (like HD cover) for a given song, without fetching M3U8.
 */
export async function fetchSongMedia(song: Song): Promise<{ HDCover: string }> {
  try {
    const trackInfoResponse = await fetch(`/api/track/info/${song.id}`);
    if (!trackInfoResponse.ok) {
      console.error(`Failed to fetch track info for song ID ${song.id}`);
      return { HDCover: song.artwork.url ?? "" };
    }

    const trackInfo = await trackInfoResponse.json();
    const HDCover = await getHDCover(trackInfo.permalink_url);

    return { HDCover: HDCover ?? song.artwork.url };
  } catch (error) {
    console.error("Error fetching song media:", error);
    return { HDCover: song.artwork.url ?? "" };
  }
}

/**
 * Fetch just the M3U8 URL for a given song.
 * This is separated so we can control when to fetch M3U8.
 */
export async function fetchM3U8ForSong(song: Song): Promise<string> {
  try {
    const trackInfoResponse = await fetch(`/api/track/info/${song.id}`);
    if (!trackInfoResponse.ok) {
      console.error(
        `Failed to fetch track info for M3U8 on song ID ${song.id}`
      );
      return "";
    }

    const trackInfo = await trackInfoResponse.json();
    return await fetchPlaylistM3U8(trackInfo.permalink_url);
  } catch (error) {
    console.error("Error fetching M3U8 URL:", error);
    return "";
  }
}

/**
 * Given a SoundCloud URL, returns either a single Song or a set of initial Songs plus
 * a function to load the remaining playlist tracks.
 * If the URL is a playlist (contains "/sets/"), it loads incrementally.
 * Otherwise, it returns a single song.
 */
export async function mapSCDataToSongOrPlaylist(
  url: string,
  initialCount = 3,
  isID?: boolean
): Promise<{ initialSongs: Song[]; loadRemaining: () => Promise<Song[]> }> {
  try {
    if (url.includes("/sets/")) {
      return await mapPlaylistUrlToSongsIncrementally(url, initialCount);
    } else {
      const track = await mapTrackUrlToSong(url, isID ? true : false);
      return { initialSongs: [track], loadRemaining: async () => [] };
    }
  } catch (error) {
    console.error("Error mapping URL to Song or Playlist:", error);
    // Return empty data on error
    return { initialSongs: [], loadRemaining: async () => [] };
  }
}

/**
 * Converts a single track URL to a Song object without fetching M3U8.
 */
async function mapTrackUrlToSong(url: string, isID: boolean): Promise<Song> {
  try {
    console.log("mapTrackUrlToSong", url);
    const trackId = isID ? Number(url) : await getIDFromURL(url);
    console.log("trackId", trackId);
    const response = await fetch(`/api/track/info/${trackId}`);
    if (!response.ok) {
      console.error(`Failed to fetch track info for ID ${trackId}`);
      return createEmptySong(trackId);
    }

    const data = await response.json();
    const HDCover = await getHDCover(data.permalink_url);

    return {
      albumName: data.publisher_metadata?.album_title || "",
      artistName: data.publisher_metadata?.artist || data.user?.username || "",
      artistId: data.user?.id || -1,
      artwork: {
        hdUrl: HDCover,
        url: data.artwork_url,
      },
      id: data.id,
      songHref: data.permalink_url,
      name: data.title,
      explicit: data.publisher_metadata.explicit || false,
      src: "",
    };
  } catch (error) {
    console.error("Error mapping track URL to song:", error);
    return createEmptySong(-1); // Use a default number for unknown ID
  }
}

/**
 * Load a playlist incrementally:
 * - initialSongs: First `initialCount` songs
 * - loadRemaining: A function to load remaining songs later
 */
async function mapPlaylistUrlToSongsIncrementally(
  url: string,
  initialCount: number
): Promise<{ initialSongs: Song[]; loadRemaining: () => Promise<Song[]> }> {
  try {
    console.log("mapPlaylistUrlToSongsIncrementally", url);
    const playlistId = await getIDFromURL(url);
    const response = await fetch(`/api/playlist/${playlistId}`);
    if (!response.ok) {
      console.error(`Failed to fetch playlist with ID ${playlistId}`);
      return { initialSongs: [], loadRemaining: async () => [] };
    }

    const playlistData = await response.json();
    const tracks = playlistData.tracks || [];
    const initialTracks = tracks.slice(0, initialCount);
    const initialSongs = await mapTracksToSongs(initialTracks);

    const loadRemaining = async (): Promise<Song[]> => {
      const remainingTracks = tracks.slice(initialCount);
      return await mapTracksToSongs(remainingTracks);
    };

    return { initialSongs, loadRemaining };
  } catch (error) {
    console.error("Error mapping playlist URL to songs incrementally:", error);
    return { initialSongs: [], loadRemaining: async () => [] };
  }
}

/**
 * Maps an array of track objects to Song objects without fetching M3U8.
 */
async function mapTracksToSongs(tracks: any[]): Promise<Song[]> {
  const songs: Song[] = [];
  for (const track of tracks) {
    try {
      const HDCover = await getHDCover(track.permalink_url);
      const song: Song = {
        albumName: track.publisher_metadata?.album_title || "",
        artistName:
          track.publisher_metadata?.artist || track.user?.username || "",
        artistId: track.user?.id || -1,
        artwork: {
          hdUrl: HDCover,
          url: track.artwork_url,
        },
        id: track.id,
        songHref: track.permalink_url,
        name: track.title,
        explicit: track.publisher_metadata.explicit || false,
        src: "", // M3U8 fetched later in the store
      };
      songs.push(song);
    } catch (error) {
      console.error("Error mapping track to song:", error);
      // Insert a fallback empty song or skip
      // Skipping might be better so you don't end up with a broken track
    }
  }
  return songs;
}

/**
 * Fetches the HD cover image given a track/playlist permalink URL.
 */
export async function getHDCover(url: string): Promise<string> {
  try {
    const response = await fetch(`/api/extra/cover/${encodeURIComponent(url)}`);
    if (!response.ok) {
      console.warn(`Failed to fetch HD cover for ${url}`);
      return "";
    }

    const data = await response.json();
    return data.imageUrl || "";
  } catch (error) {
    console.error("Error fetching HD cover:", error);
    return "";
  }
}

/**
 * Given a SoundCloud track or playlist URL, returns its ID.
 * Ensure the `/api/soundcloud/getid/[url]` endpoint can handle both single tracks and playlists.
 */
export async function getIDFromURL(url: string): Promise<number> {
  try {
    const response = await fetch(
      `/api/soundcloud/getid/${encodeURIComponent(url)}`
    );
    if (!response.ok) {
      console.error(`Failed to get ID from URL: ${url}`);
      return -1;
    }

    const data = await response.json();
    return data.trackId;
  } catch (error) {
    console.error("Error getting ID from URL:", error);
    return -1;
  }
}

export async function getURLFromID(id: string) {
  try {
    const response = await fetch(`/api/track/info/${id}`);
    if (!response.ok) {
      console.error(`Failed to get URL from ID: ${id}`);
      return "";
    }
    const data = await response.json();
    console.log("getURLFromID data", data);
    return data.permalink_url;
  } catch (error) {
    console.error("Error getting URL from ID:", error);
    return "";
  }
}

/**
 * Creates a minimal Song object with default values, useful for error fallback.
 */
function createEmptySong(id: number): Song {
  return {
    albumName: "",
    artistName: "",
    artistId: -1,
    artwork: {
      hdUrl: "",
      url: "",
    },
    id,
    songHref: "",
    name: "Unknown Track",
    explicit: false,
    src: "",
  };
}

export const AppleKit = {
  /**
   * Fetch Apple Lyrics for a song.
   */
  async getLyrics(
    title: string,
    artist: string,
    file: boolean = false
  ): Promise<string> {
    try {
      const cleanedTitle = title.split("(")[0].trim();
      const cleanedArtist = artist
        .replace(/&|feat\.|featuring/gi, "")
        .split(/[(),]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .join("+");

      const query = `${cleanedTitle.replace(/ /g, "+")}+${cleanedArtist}`;
      const response = await fetch(`/api/apple/lyrics/${query}`);

      if (!response.ok) {
        console.error(`Failed to get ID from URL: ${query}`);
        return "";
      }

      const data = await response.json();
      const formatTTMLResponse = (data: any) => {
        if (typeof data === "string") {
          return data.replace(/\\/g, "");
        }
        return data;
      };

      if (file) {
        return formatTTMLResponse(data.data[0].attributes.ttml);
      }

      return data;
    } catch (error) {
      console.error("Error getting Apple lyrics:", error);
      return "";
    }
  },

  /**
   * Fetch Apple Data.
   */
  async getMediaData(
    title: string,
    artist: string,
    type: "albums" | "songs"
  ): Promise<any> {
    try {
      const cleanedTitle = title.split("(")[0].trim();
      let cleanedArtist = artist;
      if (cleanedArtist.toLowerCase() === "octobersveryown") {
        cleanedArtist = "Drake";
      } else {
        cleanedArtist = cleanedArtist
          .replace(/&|feat\.|featuring/gi, "")
          .split(/[(),]/)
          .map((s) => s.trim())
          .filter(Boolean)
          .join("+");
      }
      const query = `${cleanedTitle.replace(/ /g, "+")}+${cleanedArtist}`;
      const response = await fetch(`/api/apple/song/${query}?type=${type}`);

      if (!response.ok) {
        console.error(
          `Response not OK | Failed to get data from AppleKit: ${query}`
        );
        return "";
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error getting Apple data:", error);
      return "";
    }
  },
};
