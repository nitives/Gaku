"use client";
import { Heading, SafeView } from "@/components/mobile/SafeView";
import { PlaylistPlayer } from "@/components/PlaylistPlayer";
import React, { useState, useEffect } from "react";

// const fetchPlaylist = async () => {
//   try {
//     const res = await fetch("./api/fetchPlaylist");
//     console.log("page.tsx | res:", res);
//     const data = await res.json();
//     console.log("page.tsx | data:", data);
//     if (data.error) {
//       throw new Error(data.error);
//     }
//     return data.playlist;
//   } catch (error) {
//     console.error("Error fetching playlist:", error.message);
//     return "";
//   }
// };

const extractLinks = (playlist: string) => {
  const regex = /(https?:\/\/[^\s]+)/g;
  // console.log("1 | playlist:", playlist, "| regex:", regex);
  // console.log("page.tsx | 1 | playlist:", playlist, "| regex:", regex);
  const links = playlist.match(regex);
  // console.log(
  //   "page.tsx | 1 | playlist:",
  //   playlist,
  //   "| regex:",
  //   regex,
  //   "| links:",
  //   links
  // );
  return links || [];
};

export default function Home() {
  const [links, setLinks] = useState<string[]>([]);

  // useEffect(() => {
  //   const getPlaylist = async () => {
  //     const playlist = await fetchPlaylist();
  //     const extractedLinks = extractLinks(playlist);
  //     setLinks(extractedLinks);
  //   };
  //   getPlaylist();
  // }, []);

  return (
    <SafeView>
      <Heading>Home</Heading>
      {/* {links.length > 0 ? <PlaylistPlayer links={links} /> : <p>Loading...</p>} */}
      {/* <AudioPlayerHLS src={jsss} /> */}
    </SafeView>
  );
}
