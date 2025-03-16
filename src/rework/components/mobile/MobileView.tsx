import React from "react";
import { NavigationBar } from "./navigation/NavigationBar";
import { useAudioStoreNew } from "@/context/AudioContextNew";
import Link from "next/link";

export const MobileView = () => {
  const { currentSong } = useAudioStoreNew();
  return (
    <div>
      {/* MobileView */}
      <p>PWA View isn&apos;t complete yet</p>
      <Link href={"/album/2093/1776273075"}>Link to Yeat - 2093 | Album</Link>
      <NavigationBar song={currentSong} />
    </div>
  );
};
