import Image from "next/image";
import React from "react";
import { RiVerifiedBadgeFill } from "react-icons/ri";

export const SearchCard = ({
  className,
  title,
  artistName,
  image,
  artist,
  track,
  playlist,
  verified,
  premium,
  isExplicit,
}: {
  className?: string;
  title?: string;
  artistName?: string;
  image?: string;
  artist?: boolean;
  track?: boolean;
  playlist?: boolean;
  verified?: boolean;
  premium?: boolean;
  isExplicit?: boolean;
}) => {
  return (
    <div className={`${className} w-full py-4 flex items-center gap-4 px-4 `}>
      <div className="min-w-16">
        <Image
          width={1000}
          height={1000}
          src={
            image ||
            "https://t3.ftcdn.net/jpg/05/16/27/58/360_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg"
          }
          alt={title || ""}
          className={`size-16 ${artist ? "rounded-full" : "rounded-lg"}`}
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
        <div className="flex flex-col flex-grow">
          <div className="flex items-center gap-2 w-[70vw] standalone:w-[65vw]">
            <h1 title={title} className="whitespace-nowrap truncate">
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
      )}
      {playlist && (
        <div>
          <h1>{title}</h1>
          <h2 className="text-muted-foreground">Playlist</h2>
        </div>
      )}
    </div>
  );
};
