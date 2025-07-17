import { SoundCloudKit } from "./audio/fetchers";
import type { SoundCloudArtist } from "./types/soundcloud";

export const artistMappings: Record<string, string> = {
  octobersveryown: "Drake",
  "Ken Car$on": "Ken Carson",
};

export async function fetchArtistData(artistId: string, _artistName: string) {
  const data = (await SoundCloudKit.getData(artistId, "artist", {
    include: ["spotlight", "latest"],
  })) as SoundCloudArtist;
  return data;
}
