import { dev } from "@/lib/utils";
import { unstable_cache } from "next/cache";
import {
  SoundCloudHydrationData,
  SoundCloudAlbum,
} from "@/lib/types/soundcloud";

async function fetchSoundCloudCredentials(): Promise<{
  clientId: string;
  guestKey: string;
}> {
  try {
    const htmlRes = await fetch("https://soundcloud.com", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });
    const html = await htmlRes.text();

    let clientId: string | null = null;

    const hydrationStartStr = "window.__sc_hydration = ";
    const startIndex = html.indexOf(hydrationStartStr);

    if (startIndex === -1) {
      dev.error("| [CLIENT ID] | Could not find window.__sc_hydration in HTML");
    } else {
      const jsonStart = startIndex + hydrationStartStr.length;
      const endIndex = html.indexOf(";</script>", jsonStart);
      if (endIndex !== -1) {
        const hydrationStr = html.slice(jsonStart, endIndex);
        try {
          const hydrationData = JSON.parse(
            hydrationStr,
          ) as SoundCloudHydrationData[];
          for (const item of hydrationData) {
            if (item?.hydratable === "apiClient") {
              clientId = item.data.id;
              break;
            }
          }
        } catch (err) {
          dev.error(
            "| [CLIENT ID] | Failed to parse window.__sc_hydration JSON",
            err,
          );
        }
      }
    }

    if (!clientId) throw new Error("Client ID not found in the HTML");

    const playlistUrl = `https://api-v2.soundcloud.com/playlists/801471273?representation=full&client_id=${clientId}&app_version=1772785214`;
    const playlistRes = await fetch(playlistUrl);
    if (!playlistRes.ok)
      throw new Error(
        `Failed to fetch playlist for guest key: ${playlistRes.statusText}`,
      );

    const playlistData = (await playlistRes.json()) as SoundCloudAlbum;
    const guestKey = playlistData?.tracks?.[0]?.track_authorization;
    if (!guestKey) throw new Error("Guest key not found in playlist response");

    return { clientId, guestKey };
  } catch (err) {
    console.error("Failed to fetch SoundCloud Credentials:", err);
    throw err;
  }
}

export const getSoundCloudCredentials = unstable_cache(
  async () => fetchSoundCloudCredentials(),
  ["soundcloud-credentials"],
  { revalidate: 1209600 },
);

export interface Config {
  APP_NAME: string;
  SOUNDCLOUD: {
    CLIENT_ID: string;
    API_KEY: string;
  };
  APPLE: {
    MUSIC: {
      AUTH: string;
      USER_TOKEN: string;
      USE_PERSONAL_TOKEN: boolean;
    };
    TEAM_ID: string;
    KEY_ID: string;
    PRIVATE_KEY_PEM: string;
  };
  DISCOGS: {
    APIKEY: string;
  };
}

export function conf(): Config {
  return {
    APP_NAME: "Gaku",
    APPLE: {
      MUSIC: {
        AUTH: process.env.APPLE_AUTH || "",
        USER_TOKEN: process.env.APPLE_MEDIA_USER_TOKEN || "",
        USE_PERSONAL_TOKEN: true,
      },
      TEAM_ID: process.env.APPLE_MUSIC_TEAM_ID!,
      KEY_ID: process.env.APPLE_MUSIC_KEY_ID!,
      PRIVATE_KEY_PEM: process.env.APPLE_MUSIC_PRIVATE_KEY! || "",
    },
    SOUNDCLOUD: {
      CLIENT_ID: process.env.SOUNDCLOUD_CLIENT_ID || "",
      API_KEY: process.env.SOUNDCLOUD_API_KEY || "",
    },
    DISCOGS: {
      APIKEY: process.env.DISCOGS_APIKEY || "",
    },
  };
}

export async function scAuth() {
  const { clientId, guestKey } = await getSoundCloudCredentials();
  if (!clientId) {
    throw new Error(
      "Failed to fetch SoundCloud Client ID. Please set it in the .env file.",
    );
  }
  if (!guestKey) {
    throw new Error(
      "Failed to fetch SoundCloud Guest Key. Please set it in the .env file.",
    );
  }
  if (!clientId || !guestKey) {
    throw new Error(
      "Failed to fetch SoundCloud Credentials. Please set them in the .env file.",
    );
  }
  console.log("Successfully fetched SoundCloud Credentials");
  return {
    CLIENT_ID: clientId,
    GUEST_KEY: guestKey,
  };
}
