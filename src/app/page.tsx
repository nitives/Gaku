"use client";
import { Heading, SafeView } from "@/components/mobile/SafeView";
import { PlaylistPlayer } from "@/components/PlaylistPlayer";
import React, { useState, useEffect } from "react";

const jsss =
  "https://cf-hls-media.sndcdn.com/playlist/ladE0RdPLsfF.128.mp3/playlist.m3u8?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiKjovL2NmLWhscy1tZWRpYS5zbmRjZG4uY29tL3BsYXlsaXN0L2xhZEUwUmRQTHNmRi4xMjgubXAzL3BsYXlsaXN0Lm0zdTgqIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzIyMjYyMTczfX19XX0_&Signature=SUzB9E6Y55P6ZzF8rOowidsUCOana03jfNBrmdlcvM6nUUSCjNTZ65YSGN3AVKZsE4~o7mc-YvNiUk5kCBEnAxG2QqSER5UX4Loe4AvZJE0H-6F~y3NZotklu8h6VbzugCxr1~Y1Qo0fjvMui-C6RsogaVZzC-DNE~8vytIRIzcwf~D9hnsLjgg5VahrANDU~zogxzIAq5gtrklPJKEBm3FuWspS-ZYpWHD5vAHROkScA8fAKS1HEU8zDw9kFI8RRD-Lc-MuFPiTi-JV45iL3odog5VJDVzgG4PFbHYuq7ZWu6ijOGXrAqs2jJ5zbkwtrPWt0inD4O5tuAIQyrJZDw__&Key-Pair-Id=APKAI6TU7MMXM5DG6EPQ";

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
