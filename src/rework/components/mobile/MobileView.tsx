import React from "react";
import { NavigationBar } from "./navigation/NavigationBar";
import { useAudioStoreNew } from "@/context/AudioContextNew";
import Link from "next/link";

export const MobileView = () => {
  const { currentSong } = useAudioStoreNew();
  return (
    <div>
      {/* MobileView */}
      <Link href={"/album/2093/1776273075"}>2093</Link>
      <NavigationBar song={currentSong} />
    </div>
  );
};
