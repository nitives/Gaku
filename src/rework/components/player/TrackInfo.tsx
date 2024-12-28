"use client";
import { useRouter } from "next/navigation";
import React from "react";

const TEST_DATA = {
  title: "Used (feat. Don Toliver)",
  artist: {
    name: "SZA",
    url: "/artist/SZA/312938480",
  },
  explicit: true,
};

export const TrackInfo = () => {
  const router = useRouter();
  if (!TEST_DATA) {
    return (
      <div className="px-2 grid items-center" aria-label="Track Info">
        <span aria-label="No Song" className="flex gap-1">
          <h2 style={{ fontWeight: 500 }}>No song playing</h2>
        </span>
      </div>
    );
  }

  return (
    <div className="grid items-center px-2" aria-label="Track Info">
      <span aria-label="Track Title" className="flex gap-1">
        <h2 style={{ fontWeight: 500 }}>{TEST_DATA.title}</h2>
        {TEST_DATA.explicit && <span className="text-[#aeaeae]">🅴</span>}
      </span>
      <p
        onClick={() => router.push(TEST_DATA.artist.url)}
        style={{ fontWeight: 400 }}
        aria-label="Track Artist"
        className="w-fit hover:underline cursor-pointer -mt-2"
      >
        {TEST_DATA.artist.name}
      </p>
    </div>
  );
};
