import { artistMappings } from "../artist";
import { Song } from "./types";
import { fetchPlaylistM3U8, dev } from "@/lib/utils";
import { EditorialVideo } from "../types/apple";
import { showToast } from "@/hooks/useToast";
import toast from "react-hot-toast";

/**
 * Unified fetch helper with toast-based error handling
 */
async function fetchJson<T>(
  url: string,
  errorMessage: string
): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`${errorMessage} | ${res.status}`);
      showToast("error", errorMessage);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    showToast("error", errorMessage);
    return null;
  }
}

/**
 * Convenience wrapper for repeated track info requests
 */
async function fetchTrackInfo(id: number) {
  return fetchJson<any>(
    `/api/track/info/${id}`,
    `Failed to fetch track info for ID ${id}`
  );
}

/**
 * Fetch additional metadata (like HD cover) for a given song, without fetching M3U8.
 */
export async function fetchSongMedia(song: Song): Promise<{ HDCover: string }> {
  try {
    dev.log("fetchSongMedia", song);
    const trackInfo = await fetchTrackInfo(song.id);
    if (!trackInfo) return { HDCover: song.artwork.url ?? "" };
    // const HDCover = await getHDCover(trackInfo.permalink_url);
    const HDCover = SoundCloudKit.getHD(trackInfo.artwork_url);

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
    dev.log(`fetchM3U8ForSong | ${song.name} |`, song);
    const trackInfo = await fetchTrackInfo(song.id);
    if (!trackInfo) return "";
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
    dev.log("mapSCDataToSongOrPlaylist | url:", url, "isID:", isID);
    if (!isID && url.includes("/sets/")) {
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
    dev.log("mapTrackUrlToSong | url:", url, "isID:", isID);
    const trackId = Number(url);
    const data = await fetchTrackInfo(trackId);
    if (!data) return createEmptySong(trackId);
    console.log("mapTrackUrlToSong data", data);
    // const HDCover = await getHDCover(data.permalink_url);
    const HDCover = SoundCloudKit.getHD(data.artwork_url);

    if (window.location.pathname.includes("/album/")) {
      const albumID = window.location.pathname.includes("/album/")
        ? window.location.pathname.split("/").pop()
        : data.publisher_metadata?.album_id || 222;
      const fetchedAlbumName = await SoundCloudKit.getData(albumID, "albums");
      const albumName =
        data.publisher_metadata?.album_title || fetchedAlbumName.title;
      const appleKitCover = await AppleKit.getMediaData(
        albumName,
        data.publisher_metadata.artist || data.user?.username,
        "albums"
      );
      dev.log("appleKitCover", appleKitCover);
      const animatedURL = (
        appleKitCover?.data[0]?.attributes?.editorialVideo as EditorialVideo
      )?.motionSquareVideo1x1?.video;
      return {
        albumName: albumName,
        artist: {
          id: data.user?.id || -1,
          name: data.user?.username || "",
          url: `/artist/${data.user?.permalink}/${data.user?.id}`,
          soundcloudURL: data.user?.permalink_url || "",
          permalink: data.user?.permalink || "",
          verified: false,
          followers: 0,
          city: "",
          avatar: data.user?.avatar_url || "",
        },
        metadata: {
          artistName: data.publisher_metadata?.artist || "",
          albumTitle: data.publisher_metadata?.album_title || "",
        },
        artwork: {
          hdUrl: HDCover,
          url: data.artwork_url,
          animatedURL: animatedURL,
        },
        id: data.id,
        songHref: data.permalink_url,
        name: data.title,
        explicit: data.publisher_metadata?.explicit || false,
        src: "",
      };
    }

    return {
      albumName: data.publisher_metadata?.album_title || "",
      artist: {
        id: data.user?.id || -1,
        name: data.user?.username || "",
        url: `/artist/${data.user?.permalink}/${data.user?.id}`,
        soundcloudURL: data.user?.permalink_url || "",
        permalink: data.user?.permalink || "",
        verified: false,
        followers: 0,
        city: "",
        avatar: data.user?.avatar_url || "",
      },
      metadata: {
        artistName: data.publisher_metadata?.artist || "",
        albumTitle: data.publisher_metadata?.album_title || "",
      },
      artwork: {
        hdUrl: HDCover,
        url: data.artwork_url,
      },
      id: data.id,
      songHref: data.permalink_url,
      name: data.title,
      explicit: data.publisher_metadata?.explicit || false,
      src: "",
    };
  } catch (error) {
    console.error(
      "mapTrackUrlToSong | Error mapping track URL to song:",
      error
    );
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
    dev.log("mapPlaylistUrlToSongsIncrementally", url);
    const playlistId = await getIDFromURL(url);
    const playlistData = await fetchJson<any>(
      `/api/playlist/${playlistId}`,
      `Failed to fetch playlist`
    );
    if (!playlistData)
      return { initialSongs: [], loadRemaining: async () => [] };

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
  dev.log("mapTracksToSongs", tracks);
  const songs: Song[] = [];
  for (const track of tracks) {
    try {
      // const HDCover = await getHDCover(track.artwork_url);
      const HDCover = SoundCloudKit.getHD(track.artwork_url);
      const song: Song = {
        albumName: track.publisher_metadata?.album_title || "",
        artist: {
          id: track.user.id,
          name: track.user.username,
          url: `/artist/${track.user.permalink}/${track.user.id}`,
          soundcloudURL: track.user.permalink_url,
          permalink: track.user.permalink,
          verified: false,
          followers: 0,
          city: "",
          avatar: track.user.avatar_url,
        },
        metadata: {
          artistName: track.publisher_metadata?.artist || "",
          albumTitle: track.publisher_metadata?.album_title || "",
        },
        artwork: {
          hdUrl: HDCover,
          url: track.artwork_url,
          animatedURL: "",
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
  dev.log("getHDCover", url);
  try {
    const data = await fetchJson<any>(
      `/api/extra/cover/${encodeURIComponent(url)}`,
      `Failed to fetch HD cover`
    );
    if (!data) return "";
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
    dev.log("getIDFromURL", url);
    const data = await fetchJson<any>(
      `/api/soundcloud/getid/${encodeURIComponent(url)}`,
      `Failed to get ID from URL`
    );
    if (!data) return -1;
    return data.trackId;
  } catch (error) {
    console.error("Error getting ID from URL:", error);
    return -1;
  }
}

export async function getURLFromID(id: string) {
  dev.log("getURLFromID", id);
  try {
    const data = await fetchTrackInfo(Number(id));
    if (!data) return "";
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
  dev.log("createEmptySong", id);
  return {
    albumName: "",
    artist: {
      id: -1,
      name: "Unknown Artist",
      url: "",
      soundcloudURL: "",
      permalink: "",
      verified: false,
      followers: 0,
      city: "",
      avatar: "",
    },
    metadata: {
      artistName: "Unknown Artist",
      albumTitle: "Unknown Album",
    },
    artwork: {
      hdUrl: "",
      url: "",
      animatedURL: "",
    },
    id,
    songHref: "",
    name: "Unknown Track",
    explicit: false,
    src: "",
  };
}

export async function fetchSongData(
  song: Song
): Promise<{ HDCover: string; M3U8url: string }> {
  try {
    dev.log("fetchSongData", song);
    const trackInfo = await fetchTrackInfo(song.id);
    if (!trackInfo) throw new Error("Failed to fetch track info");

    // const HDCover = await getHDCover(trackInfo.artwork_url);
    const HDCover = SoundCloudKit.getHD(trackInfo.artwork_url);
    const M3U8url = await fetchPlaylistM3U8(trackInfo.permalink_url);

    return { HDCover: HDCover ?? song.artwork.url, M3U8url };
  } catch (error) {
    console.error("Error fetching song data:", error);
    return { HDCover: song.artwork.url ?? "", M3U8url: "" };
  }
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
      let cleanedArtist = artist;
      cleanedArtist = artistMappings[cleanedArtist] || cleanedArtist;
      cleanedArtist = cleanedArtist
        .replace(/&|feat\.|featuring/gi, "")
        .split(/[(),]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .join("+");

      const query = `${cleanedTitle.replace(/ /g, "+")}+${cleanedArtist}`;
      const data = await fetchJson<any>(
        `/api/apple/lyrics/${query}`,
        `Failed to fetch lyrics for ${title}`
      );
      if (!data) return "";
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
      const cleanedTitle = title;
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
      const data = await fetchJson<any>(
        `/api/apple/song/${query}?type=${type}`,
        `Failed to get data from AppleKit`
      );
      return data || "";
    } catch (error) {
      console.error("Error getting Apple data:", error);
      return "";
    }
  },

  /**
   * Fetch Artist Data.
   */
  async getArtistData(artist: string): Promise<any> {
    try {
      const query = artist.replace(/ /g, "+");
      dev.log("AppleKit | Artist | Query: ", query);
      const data = await fetchJson<any>(
        `/api/apple/artist/${query}`,
        `Failed to get data for artist ${query} from AppleKit`
      );
      return data || "";
    } catch (error) {
      console.error("Error getting Apple data:", error);
      return "";
    }
  },
};

/**
 * Interact with Gaku's SoundCloud API.
 */
export const SoundCloudKit = {
  /**
   * Fetch SoundCloud Data for a song or album.
   */
  async getData(
    id: string | number,
    type: "albums" | "songs" | "playlists" | "artist",
    options?: {
      include?: string | string[]; // updated to allow multiple includes
    }
  ): Promise<any> {
    try {
      // Build query
      const queryParams = new URLSearchParams();
      queryParams.set("type", type);

      if (options?.include) {
        // If it's an array, join with commas; otherwise use as-is
        const includeValue = Array.isArray(options.include)
          ? options.include.join(",")
          : options.include;
        queryParams.set("include", includeValue);
      }

      // Now we have something like ?type=artist&include=spotlight,latest
      const data = await fetchJson<any>(
        `/api/soundcloud/${id}?${queryParams}`,
        `Failed to get data from SoundCloud`
      );
      return data || "";
    } catch (error) {
      console.error("SoundCloudKit | getData | Error fetching data:", error);
      return "";
    }
  },
  async findUserByPermalink(permalink: string) {
    try {
      // You may need to create your own Next API route that calls SoundCloud "resolve" or "search" endpoints
      const userData = await fetchJson<any>(
        `/api/soundcloud/resolve?permalink=${permalink}`,
        `Failed to resolve user`
      );
      return userData; // expected to contain .id or null
    } catch (err) {
      console.error("findUserByPermalink error", err);
      return null;
    }
  },
  /**
   * Fetch SoundCloud home page sections.
   */
  async getHomeSections() {
    const data = await fetchJson<any>(
      `/api/soundcloud/home/section`,
      `Failed to fetch home page`
    );
    if (!data) throw new Error("Failed to fetch home page");
    return data;
  },
  async getUserData(userId: string) {
    try {
      const userData = await fetchJson<any>(
        `/api/soundcloud/user?profileUrl=${userId}&type=id`,
        `Failed to fetch user data`
      );
      return userData;
    } catch (err) {
      toast.error("Error fetching user data");
      console.error("getUserData error", err);
      return null;
    }
  },
  /**
   * Get HD version of the current image.
   */
  getHD(url: string) {
    return url.replace("large", "t500x500");
  },
};
