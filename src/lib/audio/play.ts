import { useAudioStoreNew } from "@/context/AudioContextNew";
import { getURLFromID, mapSCDataToSongOrPlaylist } from "./fetchers";

export const usePlaylistFetcher = () => {
  const { setQueue, addToQueue } = useAudioStoreNew();
  const handleFetchPlaylist = async (url: any, id?: boolean) => {
    if (!url) return;
    if (id) {
      console.log("handleFetchPlaylist | Fetching URL from ID " + url + id);
      getURLFromID(url).then((url) => {
        console.log("handleFetchPlaylist | Fetched URL: " + url);
        handleFetchPlaylist(url);
      });
    }
    const { initialSongs, loadRemaining } = await mapSCDataToSongOrPlaylist(
      url
    );
    await setQueue(initialSongs);
    const remainingSongs = await loadRemaining();
    addToQueue(remainingSongs);
  };
  return { handleFetchPlaylist };
};
