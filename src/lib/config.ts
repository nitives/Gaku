export interface Config {
  APP_NAME: string;
  SOUNDCLOUD: {
    CLIENT_ID: string;
    API_KEY: string;
  };
  DISCOGS: {
    APIKEY: string;
  };
}

export function conf(): Config {
  return {
    APP_NAME: "Gaku",
    SOUNDCLOUD: {
      CLIENT_ID: process.env.SOUNDCLOUD_CLIENT_ID || "",
      API_KEY: process.env.SOUNDCLOUD_API_KEY || "",
    },
    DISCOGS: {
      APIKEY: process.env.DISCOGS_APIKEY || "",
    },
  };
}
