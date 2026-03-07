/**
 * SoundCloud API Endpoint Catalog
 *
 * Central reference for every SoundCloud API endpoint used in Gaku.
 * Each entry documents what credential it requires.
 *
 * Credential types:
 *   CLIENT_ID  – Auto-scraped from soundcloud.com HTML. No manual setup needed.
 *   GUEST_KEY  – Auto-extracted from a public playlist's track_authorization.
 *                No manual setup needed. Valid ~14 days.
 *   API_KEY    – Manual OAuth token from the SC developer portal.
 *                Only needed as a fallback when GUEST_KEY is unavailable.
 *
 * See: src/app/api/soundcloud/README.md for full narrative docs.
 */

// ---------------------------------------------------------------------------
// Auth requirement levels
// ---------------------------------------------------------------------------

export const SC_AUTH = {
  /** Only the auto-generated CLIENT_ID is required. No manual API key needed. */
  CLIENT_ID_ONLY: "CLIENT_ID_ONLY",
  /**
   * Requires an OAuth token in the Authorization header.
   * GUEST_KEY (auto-generated) is sufficient — SOUNDCLOUD_API_KEY is a fallback.
   */
  OAUTH_TOKEN: "OAUTH_TOKEN",
  /** No credentials — plain HTML scraping. */
  NONE: "NONE",
} as const;

export type ScAuth = (typeof SC_AUTH)[keyof typeof SC_AUTH];

// ---------------------------------------------------------------------------
// Endpoint shape
// ---------------------------------------------------------------------------

export interface ScEndpoint {
  /** Human-readable name */
  name: string;
  /** URL pattern — {id} / {url} are placeholders */
  url: string;
  /** Auth level required */
  auth: ScAuth;
  /** Description of what this endpoint returns */
  description: string;
  /** Which Next.js route file(s) use this endpoint */
  usedIn: string[];
  /** Extra notes about behaviour or gotchas */
  notes?: string;
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export const SC_ENDPOINTS = {
  // ------------------------------------------------------------------
  // CLIENT_ID only — no manual API key ever needed
  // ------------------------------------------------------------------

  search: {
    name: "Search",
    url: "https://api-v2.soundcloud.com/search?q=…&client_id={CLIENT_ID}",
    auth: SC_AUTH.CLIENT_ID_ONLY,
    description: "Full-text search across tracks, playlists, and users.",
    usedIn: [
      "src/app/api/soundcloud/route.ts",
      "src/app/api/soundcloud/search/route.ts",
    ],
  },

  searchQueries: {
    name: "Search Autocomplete",
    url: "https://api-v2.soundcloud.com/search/queries?q=…&client_id={CLIENT_ID}",
    auth: SC_AUTH.CLIENT_ID_ONLY,
    description: "Search query suggestions / autocomplete.",
    usedIn: ["src/app/api/soundcloud/search/route.ts"],
  },

  mixedSelections: {
    name: "Home Mixed Selections",
    url: "https://api-v2.soundcloud.com/mixed-selections?client_id={CLIENT_ID}",
    auth: SC_AUTH.CLIENT_ID_ONLY,
    description: "Home page featured sections (charts, genres, etc.).",
    usedIn: ["src/app/api/soundcloud/home/section/route.ts"],
  },

  track: {
    name: "Track Info",
    url: "https://api-v2.soundcloud.com/tracks/{id}?client_id={CLIENT_ID}",
    auth: SC_AUTH.CLIENT_ID_ONLY,
    description: "Full metadata for a single track.",
    usedIn: [
      "src/app/api/soundcloud/[id]/route.ts",
      "src/app/api/track/info/[id]/route.ts",
      "src/app/api/soundcloud/music/route.ts",
    ],
  },

  tracksBulk: {
    name: "Bulk Track Info",
    url: "https://api-v2.soundcloud.com/tracks?ids={id,id,…}&client_id={CLIENT_ID}",
    auth: SC_AUTH.CLIENT_ID_ONLY,
    description: "Fetch metadata for up to 50 tracks in one request.",
    usedIn: [
      "src/app/api/soundcloud/[id]/route.ts",
      "src/app/api/playlist/[id]/route.ts",
    ],
    notes:
      "soundcloud/[id]/route.ts incorrectly passes GUEST_KEY as client_id here — should use CLIENT_ID.",
  },

  playlist: {
    name: "Playlist / Album",
    url: "https://api-v2.soundcloud.com/playlists/{id}?client_id={CLIENT_ID}",
    auth: SC_AUTH.CLIENT_ID_ONLY,
    description: "Playlist or album details including the track list.",
    usedIn: [
      "src/app/api/soundcloud/[id]/route.ts",
      "src/app/api/playlist/[id]/route.ts",
    ],
  },

  user: {
    name: "User / Artist Profile",
    url: "https://api-v2.soundcloud.com/users/{id}?client_id={CLIENT_ID}",
    auth: SC_AUTH.CLIENT_ID_ONLY,
    description: "User profile metadata (bio, avatar, followers, etc.).",
    usedIn: [
      "src/app/api/soundcloud/[id]/route.ts",
      "src/app/api/artist/info/[id]/route.ts",
      "src/app/api/soundcloud/user/route.ts",
    ],
  },

  userTracks: {
    name: "User Tracks",
    url: "https://api-v2.soundcloud.com/users/{id}/tracks?client_id={CLIENT_ID}",
    auth: SC_AUTH.CLIENT_ID_ONLY,
    description: "Tracks uploaded by a user.",
    usedIn: [
      "src/app/api/soundcloud/[id]/route.ts",
      "src/app/api/artist/recent/[id]/route.ts",
    ],
  },

  userLikes: {
    name: "User Likes",
    url: "https://api-v2.soundcloud.com/users/{id}/likes?client_id={CLIENT_ID}",
    auth: SC_AUTH.CLIENT_ID_ONLY,
    description: "Tracks liked by a user.",
    usedIn: ["src/app/api/soundcloud/user/route.ts"],
  },

  userStream: {
    name: "User Stream (Recent Activity)",
    url: "https://api-v2.soundcloud.com/stream/users/{id}?client_id={CLIENT_ID}",
    auth: SC_AUTH.CLIENT_ID_ONLY,
    description: "A user's recent activity / uploads stream.",
    usedIn: ["src/app/api/soundcloud/[id]/route.ts"],
  },

  resolveV2: {
    name: "Resolve Permalink (v2)",
    url: "https://api-v2.soundcloud.com/resolve?url={url}&client_id={CLIENT_ID}",
    auth: SC_AUTH.CLIENT_ID_ONLY,
    description:
      "Resolve a SoundCloud permalink URL to a track / playlist / user entity.",
    usedIn: [
      "src/app/api/soundcloud/music/route.ts",
      "src/app/api/soundcloud/resolve/route.ts",
    ],
  },

  resolveV1: {
    name: "Resolve Permalink (v1)",
    url: "https://api.soundcloud.com/resolve.json?url={url}&client_id={CLIENT_ID}",
    auth: SC_AUTH.CLIENT_ID_ONLY,
    description:
      "Legacy v1 permalink resolver. Returns a redirect to the entity.",
    usedIn: ["src/app/api/soundcloud/resolve/route.ts"],
  },

  hlsStream: {
    name: "HLS Stream URL",
    url: "{transcoding_url}?client_id={CLIENT_ID}",
    auth: SC_AUTH.CLIENT_ID_ONLY,
    description:
      "Resolve a track's HLS transcoding URL to the actual M3U8 playlist URL. " +
      "The base URL comes from track.media.transcodings[].url.",
    usedIn: ["src/app/api/soundcloud/music/route.ts"],
  },

  // ------------------------------------------------------------------
  // OAuth token required — GUEST_KEY (auto-generated) is sufficient.
  // SOUNDCLOUD_API_KEY is only a fallback.
  // ------------------------------------------------------------------

  userSpotlight: {
    name: "User / Artist Spotlight",
    url: "https://api-v2.soundcloud.com/users/{id}/spotlight",
    auth: SC_AUTH.OAUTH_TOKEN,
    description:
      "The artist's hand-picked spotlight / featured tracks. " +
      "Requires Authorization: OAuth header.",
    usedIn: [
      "src/app/api/artist/spotlight/[id]/route.ts",
      "src/app/api/soundcloud/[id]/route.ts (when include=spotlight — uses client_id only, may be unreliable)",
    ],
    notes:
      "artist/spotlight/[id]/route.ts correctly sends `Authorization: OAuth ${GUEST_KEY}`. " +
      "soundcloud/[id]/route.ts passes client_id instead of the OAuth header when include=spotlight — this is inconsistent.",
  },

  // ------------------------------------------------------------------
  // No auth — HTML scraping
  // ------------------------------------------------------------------

  scrapeClientId: {
    name: "Scrape Client ID",
    url: "https://soundcloud.com",
    auth: SC_AUTH.NONE,
    description:
      "Fetch the SoundCloud homepage and parse window.__sc_hydration to extract the current client_id.",
    usedIn: ["src/app/api/soundcloud/auth/route.ts"],
  },

  scrapeTrackId: {
    name: "Scrape Track / Playlist ID from Permalink",
    url: "{permalink_url}",
    auth: SC_AUTH.NONE,
    description:
      'Fetch a SoundCloud permalink page and scrape <meta property="al:ios:url"> to extract a numeric ID.',
    usedIn: ["src/app/api/soundcloud/getid/[url]/route.ts"],
  },

  scrapeUserId: {
    name: "Scrape User ID from Profile Page",
    url: "{profile_url}",
    auth: SC_AUTH.NONE,
    description:
      'Fetch a SoundCloud profile page and scrape <meta property="twitter:app:url:googleplay"> for the user ID.',
    usedIn: ["src/app/api/soundcloud/user/route.ts"],
  },
} as const satisfies Record<string, ScEndpoint>;

// ---------------------------------------------------------------------------
// Convenience helpers
// ---------------------------------------------------------------------------

/** All endpoints that only need the auto-generated CLIENT_ID. */
export const CLIENT_ID_ONLY_ENDPOINTS = Object.values(SC_ENDPOINTS).filter(
  (e) => e.auth === SC_AUTH.CLIENT_ID_ONLY,
);

/** All endpoints that need an OAuth token (GUEST_KEY is sufficient). */
export const OAUTH_ENDPOINTS = Object.values(SC_ENDPOINTS).filter(
  (e) => e.auth === SC_AUTH.OAUTH_TOKEN,
);

/** All endpoints that require no credentials at all (HTML scraping). */
export const NO_AUTH_ENDPOINTS = Object.values(SC_ENDPOINTS).filter(
  (e) => e.auth === SC_AUTH.NONE,
);
