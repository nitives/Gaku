import { Skeleton } from "@/components/ui/skeleton";
import { BackButton, SafeView } from "../mobile/SafeView";

export const PlaylistSkeleton = () => {
  return (
    <SafeView backButton className="z-10 relative">
      <div className="flex flex-col items-center justify-center gap-1 bg-blend-overlay pt-4">
        <div className="album-container album-shadow">
          {/* Album Cover Skeleton */}
          <Skeleton className="w-[235px] h-[235px] rounded-2xl" />
          <div className="album-border" />
        </div>

        <div className="flex flex-col items-center justify-center mt-2 gap-1">
          {/* Playlist Title Skeleton */}
          <Skeleton className="w-[150px] h-[20px] rounded-md" />

          {/* Artist Link Skeleton */}
          <Skeleton className="w-[100px] h-[20px] rounded-md" />

          {/* Genre, Year, Lossless Skeleton */}
          <div className="flex text-xs spacer items-center justify-center">
            <Skeleton className="w-[200px] h-[18px] rounded-md" />
          </div>
        </div>

        <div className="flex w-full justify-between items-start gap-5 pb-5 pt-2">
          {/* Play Button Skeleton */}
          <Skeleton className="flex-1 h-[3rem] rounded-2xl" />
          {/* Shuffle Button Skeleton */}
          <Skeleton className="flex-1 h-[3rem] rounded-2xl" />
        </div>
      </div>

      <ul className="music-cards">
        {/* List of Track Skeletons */}
        {Array(5)
          .fill("")
          .map((_, index) => (
            <li key={index} className="cursor-pointer flex items-center mb-2">
              {/* Track Number Skeleton */}
              <Skeleton className="w-[20px] h-[20px] rounded-full mr-4" />
              {/* Track Title Skeleton */}
              <Skeleton className="w-[200px] h-[20px] rounded-md" />
            </li>
          ))}
      </ul>
    </SafeView>
  );
};
