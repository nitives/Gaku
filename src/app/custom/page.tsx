"use client";
import {
  Heading,
  SubHeading,
  SafeView,
  Input,
  ScrollHeader,
} from "@/components/mobile/SafeView";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const imageUrls = Array(10).fill(
  "https://i1.sndcdn.com/artworks-ZgIld06mOEDk-0-large.jpg"
);

export default function Home() {
  return (
    <>
      <SafeView>
        <ScrollHeader title="Search" />
        <Heading>Search</Heading>
        <Input className="mb-5" placeholder="Search" />
        {/* <Input className="mb-5" placeholder="Search" /> */}
        {/* <SubHeading subtitle="Made for you">Top Picks for You </SubHeading> */}
        {/* <div
          className={`sticky top-[-1px] z-10 py-4 standalone:pt-[6vh]  ${
            isScrolled
              ? "bg-red-500 backdrop-blur-lg border-b"
              : "bg-transparent"
          } transition-all duration-150`}
        >
          <Input placeholder="Search" />
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
            />
          ))}
        </div>
      </SafeView>
    </>
  );
}
