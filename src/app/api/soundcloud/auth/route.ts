import { dev } from "@/lib/utils";
import { unstable_cache } from "next/cache";
import {
  SoundCloudHydrationData,
  SoundCloudAlbum,
} from "@/lib/types/soundcloud";

interface SoundCloudCredentials {
  clientId: string;
  guestKey: string;
}

async function fetchSoundCloudCredentials(): Promise<SoundCloudCredentials> {
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

      if (endIndex === -1) {
        dev.error(
          "| [CLIENT ID] | Could not find end of window.__sc_hydration script",
        );
      } else {
        const hydrationStr = html.slice(jsonStart, endIndex);

        try {
          const hydrationData = JSON.parse(
            hydrationStr,
          ) as SoundCloudHydrationData[];
          dev.log(
            "| [CLIENT ID] | Parsed window.__sc_hydration JSON successfully",
          );
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

    dev.log("| [CLIENT ID] | Fetched SoundCloud Client ID:", clientId);

    if (!clientId) {
      throw new Error("Client ID not found in the HTML");
    }

    // Fetch the guest key (track_authorization) using a public playlist
    const playlistUrl = `https://api-v2.soundcloud.com/playlists/801471273?representation=full&client_id=${clientId}&app_version=1772785214`;
    const playlistRes = await fetch(playlistUrl);
    dev.log(
      "| [GUEST KEY] | playlist for guest key, status:",
      playlistRes.status,
    );
    if (!playlistRes.ok) {
      throw new Error(
        `| [GUEST KEY] | Failed to fetch playlist for guest key: ${playlistRes.statusText}`,
      );
    }

    dev.log("| [GUEST KEY] | Fetching guest key from playlist");

    const playlistData = (await playlistRes.json()) as SoundCloudAlbum;
    const guestKey = playlistData?.tracks?.[0]?.track_authorization;
    dev.log("| [GUEST KEY] | Fetched guest key:", guestKey);

    if (!guestKey) {
      throw new Error(
        `[GUEST KEY] | Guest key (track_authorization) not found in the playlist response`,
      );
    }

    dev.log("| [GUEST KEY] | Fetched SoundCloud Guest Key successfully.");

    return {
      clientId,
      guestKey,
    };
  } catch (error) {
    console.error("Failed to fetch SoundCloud Credentials:", error);
    throw error;
  }
}

// 2. Next.js cache wrapper to keep them for 2 weeks
export const getSoundCloudCredentials = unstable_cache(
  async () => {
    return await fetchSoundCloudCredentials();
  },
  ["soundcloud-credentials"], // Cache key
  {
    revalidate: 1209600, // 14 days in seconds
  },
);
