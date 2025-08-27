"use client";
import { useAudioStore } from "@/context/AudioContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const TrackInfo = () => {
  const { currentSong } = useAudioStore();
  if (!currentSong) {
    return (
      <div className="px-2 grid items-center" aria-label="Track Info">
        <span aria-label="No Song" className="flex gap-1">
          <h2 style={{ fontWeight: 500 }}>No song playing</h2>
        </span>
      </div>
    );
  }
  return (
    <div className="grid items-center px-2" aria-label="Track Info">
      <span
        aria-label={`Name of the track: ${currentSong.name}`}
        className="flex gap-1"
      >
        <h2 style={{ fontWeight: 500 }}>{currentSong.name}</h2>
        {currentSong.explicit && <span className="text-[#aeaeae]">🅴</span>}
      </span>
      <Link
        href={currentSong.artist.url}
        style={{ fontWeight: 400, opacity: 0.7 }}
        aria-label={`Name of the artist: ${currentSong.artist.name}`}
        className="w-fit hover:underline cursor-pointer -mt-2"
      >
        {currentSong.artist.name}
      </Link>
    </div>
  );
};
