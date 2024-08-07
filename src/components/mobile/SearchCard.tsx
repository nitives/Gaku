import Image from "next/image";
import React, { useState, useEffect } from "react";
import { IoHeartOutline, IoHeart } from "react-icons/io5";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { useLibrary } from "@/hooks/useLibrary"; // Adjust the path according to your structure

export const SearchCard = ({
  className,
  id,
  title,
  artistName,
  image,
  artist,
  track,
  playlist,
  verified,
  premium,
  isExplicit,
  onClick,
}: {
  className?: string;
  id?: string;
  title?: string;
  artistName?: string;
  image?: string;
  artist?: boolean;
  track?: boolean;
  playlist?: boolean;
  verified?: boolean;
  premium?: boolean;
  isExplicit?: boolean;
  onClick?: () => void;
}) => {
  const { addSong, removeSong, isSongInLibrary } = useLibrary();
  const songId = `${id}`; // Unique identifier for the song
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    // Check if the song is already in the library on component mount
    setIsFavorited(isSongInLibrary(songId));
  }, [songId, isSongInLibrary]);

  const handleFavoriteClick = () => {
    if (isFavorited) {
      removeSong(songId);
      setIsFavorited(false);
    } else {
      addSong({
        id: songId,
        title: title || "Unknown Title",
        artist: artistName || "Unknown Artist",
      });
      setIsFavorited(true);
    }
  };

  return (
    <div
      className={`${className || ""}w-full py-4 flex items-center gap-4 px-4`}
    >
      <div onClick={onClick} className="absolute w-[90%] h-20 bg-black/0" />
      <div>
        <Image
          width={1000}
          height={1000}
          src={
            image ||
            "https://t3.ftcdn.net/jpg/05/16/27/58/360_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg"
          }
          alt={title || ""}
          className={`min-w-16 aspect-square size-16 ${
            artist ? "rounded-full" : "rounded-lg"
          }`}
          onError={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(to right, #FFA500, #FF4500)";
            e.currentTarget.src =
              "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; // 1x1 transparent gif
          }}
        />
      </div>
      {artist && (
        <div>
          <h1>{title}</h1>
          <h2 className="text-muted-foreground">Artist</h2>
          {verified === true && (
            <span className="text-muted-foreground">
              <RiVerifiedBadgeFill className="text-[#699fff]" />
            </span>
          )}
        </div>
      )}
      {track && (
        <>
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1
                  title={title}
                  className="truncate max-w-[75vw] max-sm:max-w-[50vw]"
                >
                  {isExplicit ? `${title} 🅴` : title}
                </h1>
                {premium === true && (
                  <span
                    title="This content is a preview because of SoundCloud encryption"
                    className="bg-orange-500 p-0.5 text-xs rounded-md"
                  >
                    Go+
                  </span>
                )}
              </div>
              <h2 className="text-muted-foreground">Song · {artistName}</h2>
            </div>
            <div onClick={handleFavoriteClick} className="cursor-pointer">
              {isFavorited ? (
                <IoHeart className="scale-y-[.95] text-red-500" size={24} />
              ) : (
                <IoHeartOutline
                  className="scale-y-[.95] text-muted-foreground/30"
                  size={24}
                />
              )}
            </div>
          </div>
        </>
      )}
      {playlist && (
        <div>
          <h1 className="truncate max-w-[75vw] max-sm:max-w-[50vw]">{title}</h1>
          <h2 className="text-muted-foreground">Playlist</h2>
        </div>
      )}
    </div>
  );
};
