"use client";
import { AudioPlayer } from "@/components/player/AudioPlayer";
import useAudioStore from "@/context/AudioContext";
import { useEffect } from "react";

export const PersistentAudioPlayer = () => {
  const {
    currentTrack,
    playlistUrl,
    cover,
    playNextTrack,
    playPreviousTrack,
    isPlaying,
  } = useAudioStore();

  useEffect(() => {
    const setPageTitle = async () => {
      // const fixedTitle = artistNameRemove(currentTrack.user.username, currentTrack.title)
      const fixedTitle = currentTrack?.title;
      if (!currentTrack) {
        console.log("No current track | PersistentAudioPlayer");
      }
      const title = fixedTitle ? `${fixedTitle}` : "Gaku";
      document.title = title;
    };

    if (currentTrack) {
      setPageTitle();
    }
  }, [currentTrack]);

  // const artistNameRemove = (artistName: string, trackTitle: string): string => {
  //   // Create a regular expression to match the artist name and a dash
  //   const regex = new RegExp(`^${artistName}\\s*-\\s*`, "i");
  //   // Replace the artist name and dash with an empty string
  //   return trackTitle.replace(regex, "").trim();
  // };

  if (!playlistUrl || !currentTrack) return null;

  // console.log("PersistentAudioPlayer");
  // console.log("PersistentAudioPlayer | currentTrack:", currentTrack);
  // console.log(
  //   "PersistentAudioPlayer | currentTrack Username:",
  //   currentTrack.user.username
  // );

  return (
    <div className="pb-[20rem] z-[200] absolute">
      <AudioPlayer
        height="100%"
        img={cover || currentTrack.artwork_url || ""}
        // title={artistNameRemove(currentTrack.user.username, currentTrack.title)}
        title={currentTrack.title}
        artist={currentTrack.user?.username || currentTrack.artist}
        album={currentTrack.publisher_metadata?.album_title || ""}
        src={playlistUrl}
        isExplicit={currentTrack.publisher_metadata?.explicit === true}
        onNext={playNextTrack}
        onEnded={playNextTrack}
        onPrevious={playPreviousTrack} // Automatically play the next track when the current one ends
      />
    </div>
  );
};
