import { useAudioStoreNew } from "@/context/AudioContextNew";
import { getURLFromID, mapSCDataToSongOrPlaylist } from "./fetchers";

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const usePlaylistFetcher = () => {
  const { setQueue, addToQueue } = useAudioStoreNew();
  const handleFetchPlaylist = async (url: any, isID?: boolean) => {
    if (!url) return;
    const { initialSongs, loadRemaining } = await mapSCDataToSongOrPlaylist(
      url,
      3,
      isID ? true : false
    );
    await setQueue(initialSongs);
    const remainingSongs = await loadRemaining();
    addToQueue(remainingSongs);
  };

  const shufflePlaylist = async (url: string, id?: boolean) => {
    if (!url) return;
    let allSongs = [];
    if (id) {
      console.log("shufflePlaylist | Fetching URL from ID " + url + id);
      const resolvedUrl = await getURLFromID(url);
      url = resolvedUrl;
    }
    const { initialSongs, loadRemaining } = await mapSCDataToSongOrPlaylist(
      url
    );
    allSongs = [...initialSongs];
    const remainingSongs = await loadRemaining();
    allSongs = [...allSongs, ...remainingSongs];
    if (allSongs.length === 0) {
      console.warn("shufflePlaylist | No songs found in the playlist.");
      return;
    }
    // Shuffle all songs
    const shuffledSongs = shuffleArray(allSongs);
    // Set the shuffled playlist in the queue
    await setQueue(shuffledSongs);
  };

  return { handleFetchPlaylist, shufflePlaylist };
};
