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
    };
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
      },
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
