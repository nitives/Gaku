"use client";
import { AudioPlayerHLS } from "@/components/AudioPlayerHLS";
import { useAudio } from "@/context/AudioContext";
import { useEffect } from "react";

export const PersistentAudioPlayer = () => {
  const { currentTrack, playlistUrl, cover, playNextTrack, playPreviousTrack, isPlaying } = useAudio();

  useEffect(() => {
    const setPageTitle = async () => {
      const fixedTitle = artistNameRemove(currentTrack.user.username, currentTrack.title)
      const title = fixedTitle ? `${fixedTitle}` : "Gaku";
      document.title = title;
    };

    if (currentTrack) {
      setPageTitle();
    }
  }, [currentTrack]);

  const artistNameRemove = (artistName: string, trackTitle: string): string => {
    // Create a regular expression to match the artist name and a dash
    const regex = new RegExp(`^${artistName}\\s*-\\s*`, "i");
    // Replace the artist name and dash with an empty string
    return trackTitle.replace(regex, "").trim();
  };

  if (!playlistUrl || !currentTrack) return null;

  return (
    <div className="pb-[20rem] z-[200] absolute">
      <AudioPlayerHLS
        height="100%"
        img={cover || currentTrack.artwork_url || ""}
        title={artistNameRemove(currentTrack.user.username, currentTrack.title)}
        artist={currentTrack.user.username}
        album={currentTrack.publisher_metadata?.album_title || ""}
        src={playlistUrl}
        isExplicit={currentTrack.publisher_metadata?.explicit === true}
        onNext={playNextTrack}
        onEnded={playNextTrack}
        onPrevious={playPreviousTrack}  // Automatically play the next track when the current one ends
      />
    </div>
  );
};