import React from "react";
import Image from "next/image";
import { ImageBlur } from "@/components/ImageBlur";
import { Skeleton } from "@/components/ui/skeleton";

interface SongCard {
  src: string;
  title: string;
  artist: string;
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

export const SongCard = ({ src, title, artist }: SongCard) => {
  if (!src && !title && !artist) return <SongCardSkeleton />;
  return (
    <div className="min-w-[15rem] min-h-[20rem]">
      <div className="text-white rounded-2xl overflow-hidden">
        <ImageBlur blur="120" className="min-h-[20.5rem]" src={src}>
          <Image
            className="border-b border-border/50 aspect-square"
            src={src}
            alt={title || "Title"}
            width={500}
            height={500}
          />
          <div className="p-2 text-center">
            <p className="font-bold">{title || "Title"}</p>
            <p>{artist || "Artist"}</p>
          </div>
        </ImageBlur>
      </div>
    </div>
  );
};
