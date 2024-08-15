import Image from "next/image";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";

export const LibraryCard = ({
  songId,
  onClick,
}: {
  songId: string;
  onClick: () => void;
}) => {
  const [songData, setSongData] = useState<any>(null);

  useEffect(() => {
    const fetchSongData = async () => {
      try {
        const response = await fetch(`/api/track/info/${songId}`);
        const data = await response.json();
        setSongData(data);
      } catch (error) {
        console.error("Error fetching song data:", error);
      }
    };

    fetchSongData();
  }, [songId]);

  if (!songData) {
    return <LibraryCardSkeleton />; // or a skeleton loader
  }


  return (
    <>
      <div
        onClick={onClick}
        className="w-full py-4 flex items-center gap-4 px-4 cursor-pointer hover:bg-foreground/5 transition-colors duration-150 rounded-xl"
      >
        <div className="min-w-16">
          <Image
            width={1000}
            height={1000}
            src={
              songData.artwork_url ||
              "https://t3.ftcdn.net/jpg/05/16/27/58/360_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg"
            }
            alt={songData.title || ""}
            className="size-16 rounded-lg"
            onError={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(to right, #FFA500, #FF4500)";
              e.currentTarget.src =
                "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; // 1x1 transparent gif
            }}
            draggable={false}
            unoptimized={true}
          />
        </div>

        <div className="flex flex-col flex-grow">
          <div className="flex items-center gap-2 w-[70vw] standalone:w-[65vw]">
            <h1 title={songData.title} className="whitespace-nowrap truncate">
              {songData.publisher_metadata?.explicit
                ? `${songData.title} 🅴`
                : songData.title}
            </h1>
            {/* {premium === true && (
              <span
                title="This content is a preview because of SoundCloud encryption"
                className="bg-orange-500 p-0.5 text-xs rounded-md"
              >
                Go+
              </span>
            )} */}
          </div>
          <h2 className="text-muted-foreground">{songData.user.username}</h2>
        </div>
        {/* <div onClick={handleFavoriteClick} className="cursor-pointer">
          {isFavorited ? (
            <IoHeart className="scale-y-[.95] text-red-500" size={24} />
          ) : (
            <IoHeartOutline className="scale-y-[.95]" size={24} />
          )}
        </div> */}
      </div>
    </>
  );
};

export const LibraryCardSkeleton = () => {
  return (
    <>
      <div className="w-full py-4 flex items-center gap-4 px-4 cursor-pointer hover:bg-foreground/5 transition-colors duration-150 rounded-xl">
        <div className="min-w-16">
          <Skeleton className="size-16 rounded-lg aspect-square" />
        </div>
        <div className="flex flex-col flex-grow gap-1">
          <div className="flex items-center gap-2 w-[70vw] standalone:w-[65vw]">
            <Skeleton className="w-[25%] h-[1.75rem]" />
          </div>
          <Skeleton className="w-[25%] h-[1.75rem]" />
        </div>
      </div>
    </>
  );
};
