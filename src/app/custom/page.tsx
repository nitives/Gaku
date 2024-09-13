"use client";
import {
  Heading,
  SubHeading,
  SafeView,
  Input,
  ScrollHeader,
} from "@/components/mobile/SafeView";
import Image from "next/image";
import { LinearBlur } from "progressive-blur";

const imageUrls = Array(10).fill(
  "https://i1.sndcdn.com/artworks-kTARXYIL6Ej32m2o-QyPlSg-t500x500.jpg"
);

export default function Home() {
  return (
    <>
      {/* <div className="w-[100vw] h-[100vh] top-0 absolute">
        <LinearBlur side="left" />
      </div> */}

      <div className="w-full flex flex-col gap-2">
        {imageUrls.map((url, index) => (
          <Image
            key={index}
            className="w-full"
            src={url}
            alt={`Logo ${index + 1}`}
            width={100}
            height={100}
            unoptimized={true}
          />
        ))}
      </div>
    </>
  );
}
