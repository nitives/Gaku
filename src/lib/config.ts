import { getSoundCloudCredentials } from "@/app/api/soundcloud/auth/route";

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
