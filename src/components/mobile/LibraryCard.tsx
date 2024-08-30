import Image from "next/image";
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import "../../styles/album.css";
import { useTheme } from "next-themes";

export const LibraryCard = ({
  songId,
  onClick,
  isExplicit,
}: {
  songId: string;
  onClick: () => void;
  isExplicit?: boolean;
}) => {
  const [songData, setSongData] = useState<any>(null);
  const { theme } = useTheme();

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
        className="w-full py-[1.5px] flex items-center gap-3 cursor-pointer hover:bg-foreground/5 standalone:active:bg-foreground/5 transition-colors duration-150"
      >
        <div className="size-12">
          <div className="album-container album-shadow !w-12 !mb-0">
            <Image
              width={1000}
              height={1000}
              src={
                songData.artwork_url ||
                (theme === "light"
                  ? "/assets/placeholders/missing_song_light.png"
                  : "/assets/placeholders/missing_song_dark.png")
              }
              alt={songData.title || ""}
              className="size-12 rounded-md"
              onError={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(to right, #FFA500, #FF4500)";
                e.currentTarget.src =
                  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; // 1x1 transparent gif
              }}
              draggable={false}
              unoptimized={true}
            />
            <div className="album-border !border-[0.5px] !border-white/50 !rounded-md" />
          </div>
        </div>
        <div className="flex flex-col flex-grow justify-center w-[70vw] standalone:w-[65vw]">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-base leading-[1.25rem]">
              {songData.title}
            </p>
            {isExplicit && <p className="opacity-50 scale-110">🅴</p>}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {songData.user.username}
          </p>
          <div className="w-[77%] h-[1px] bg-muted-foreground/10 absolute translate-y-[1.75rem]" />
        </div>
      </div>
    </>
  );
};
export const LibraryCardSkeleton = () => {
  return (
    <>
      <div className="w-full py-[1.5px] flex items-center gap-3 cursor-pointer transition-colors duration-150">
        <div className="min-w-12">
          <Skeleton className="size-12 rounded-md aspect-square" />
        </div>
        <div className="flex flex-col flex-grow gap-1 justify-between w-[70vw] standalone:w-[65vw]">
          <div className="flex items-center gap-2 w-[70vw] standalone:w-[65vw]">
            <Skeleton className="w-[25vw] h-[1rem]" />
          </div>
          <Skeleton className="w-[15vw] h-[1rem]" />
        </div>
      </div>
    </>
  );
};

// a<div
// onClick={onClick}
// className="w-full py-4 flex items-center gap-4 px-4 cursor-pointer hover:bg-foreground/5 transition-colors duration-150 rounded-xl"
// >
// <div className="min-w-16">
//   <Image
//     width={1000}
//     height={1000}
//     src={
//       songData.artwork_url ||
//       "https://t3.ftcdn.net/jpg/05/16/27/58/360_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg"
//     }
//     alt={songData.title || ""}
//     className="size-16 rounded-lg"
//     onError={(e) => {
//       e.currentTarget.style.background =
//         "linear-gradient(to right, #FFA500, #FF4500)";
//       e.currentTarget.src =
//         "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; // 1x1 transparent gif
//     }}
//     draggable={false}
//     unoptimized={true}
//   />
// </div>
// <div className="flex flex-col flex-grow">
//   <div className="flex items-center gap-2 w-[70vw] standalone:w-[65vw]">
//     <h1 title={songData.title} className="whitespace-nowrap truncate">
//       {songData.publisher_metadata?.explicit
//         ? `${songData.title} 🅴`
//         : songData.title}
//     </h1>
//     {/* {premium === true && (
//       <span
//         title="This content is a preview because of SoundCloud encryption"
//         className="bg-orange-500 p-0.5 text-xs rounded-md"
//       >
//         Go+
//       </span>
//     )} */}
//   </div>
//   <h2 className="text-muted-foreground">{songData.user.username}</h2>
// </div>
// {/* <div onClick={handleFavoriteClick} className="cursor-pointer">
//   {isFavorited ? (
//     <IoHeart className="scale-y-[.95] text-red-500" size={24} />
//   ) : (
//     <IoHeartOutline className="scale-y-[.95]" size={24} />
//   )}
// </div> */}
// a</div>
