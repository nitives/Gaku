import { useAudioStore } from "@/context/AudioContext";
import Image from "next/image";
import { useThemedPlaceholder } from "@/lib/utils/themedPlaceholder";

export const QueueView = () => {
  const { queue, currentIndex } = useAudioStore();
  const PLACEHOLDER_IMAGE = useThemedPlaceholder();

  // Filter queue to show only upcoming songs (after current song)
  const upcomingSongs = queue.slice(currentIndex + 1);

  if (!upcomingSongs.length) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <p className="opacity-50 select-none">No upcoming songs in queue</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-center text-lg font-semibold mb-4 opacity-75 mt-4">
          Up Next
        </h3>
        {upcomingSongs.map((song, index) => (
          <div
            key={`${song.id}-${index}`}
            className="flex items-center p-3 border-b border-white/10 hover:bg-white/5 transition"
          >
            <div className="w-10 h-10 relative mr-3">
              <Image
                src={song.artwork?.url || PLACEHOLDER_IMAGE}
                alt={song.name || "Song cover"}
                fill
                className="object-cover rounded-md"
              />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-medium text-sm truncate">{song.name}</p>
              <p className="text-xs opacity-70 truncate">{song.artist.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
