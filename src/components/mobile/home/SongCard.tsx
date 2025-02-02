import React from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { CanvasBackground } from "@/components/CanvasBackground";

interface SongCard {
  img: string;
  title: string;
  artist: string;
  id?: string;
  kind?: string;
  onClick?: () => void;
}

const SongCardSkeleton = () => {
  return (
    <>
      <div className="min-w-[15rem] min-h-[7.5rem]">
        <div className="text-white bg-foreground/5 rounded-2xl overflow-hidden">
          <Skeleton className="size-full aspect-square rounded-xl" />
          <div className="p-2 text-center flex flex-col items-center gap-1">
            <Skeleton className="bg-foreground/5 w-full h-[1rem] rounded-xl" />
            <Skeleton className="bg-foreground/5 w-[50%] h-[1rem] rounded-xl" />
          </div>
        </div>
      </div>
    </>
  );
};

export const SongCard = ({
  onClick,
  img,
  title,
  artist,
  id,
  kind,
}: SongCard) => {
  if (!img && !title && !artist) return <SongCardSkeleton />;
  return (
    <div onClick={onClick} className="min-w-[15rem] h-[22rem] max-sm:h-[20rem]">
      <div className="text-white rounded-2xl overflow-hidden">
        <CanvasBackground
          blur={120}
          className="h-[22rem] max-sm:h-[20rem]"
          src={img}
        >
          <Image
            className="border-b border-border/50 aspect-square"
            src={img}
            alt={title || "Title"}
            width={500}
            height={500}
            draggable={false}
            unoptimized={true}
          />
          <div className="p-2 pb-3 text-center h-[25%] flex flex-col justify-center items-center">
            <p className="font-bold">{title || "Title"}</p>
            <p>{artist || "Artist"}</p>
          </div>
        </CanvasBackground>
      </div>
    </div>
  );
};
