export const env = {
  SOUNDCLOUD_CLIENT_ID: process.env.SOUNDCLOUD_CLIENT_ID ?? "",
  SOUNDCLOUD_API_KEY: process.env.SOUNDCLOUD_API_KEY ?? "",
  APPLE_AUTH: process.env.APPLE_AUTH ?? "",
  APPLE_MEDIA_USER_TOKEN: process.env.APPLE_MEDIA_USER_TOKEN ?? "",
  GENIUS_ACCESS_TOKEN: process.env.GENIUS_ACCESS_TOKEN ?? "",
  MUSIX_API_KEY: process.env.MUSIX_API_KEY ?? "",
};

export function requireEnv<K extends keyof typeof env>(key: K) {
  const val = env[key];
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val;
}
