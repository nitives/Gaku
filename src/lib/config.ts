export interface Config {
  APP_NAME: string;
  SOUNDCLOUD: {
    CLIENT_ID: string;
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
    },
    DISCOGS: {
      APIKEY: process.env.DISCOGS_APIKEY || "",
    },
  };
}
