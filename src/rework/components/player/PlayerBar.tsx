"use client";
import React, { memo, useState } from "react";
import style from "./PlayerBar.module.css";
import { Artwork } from "./Artwork";
import { TrackInfo } from "./TrackInfo";
import { Controls } from "./Controls";
import { useAudioStoreNew } from "@/context/AudioContextNew";
import { motion } from "framer-motion";
import { FullScreen } from "./FullScreenButton";
import { useThemedPlaceholder } from "@/lib/utils/themedPlaceholder";

const EXAMPLE_ALBUM_COVER =
  "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/bd/3b/a9/bd3ba9fb-9609-144f-bcfe-ead67b5f6ab3/196589564931.jpg/1000x1000bb.jpg";

export const PlayerBar = () => {
  return (
    <div className={style.PlayerBar}>
      <Player />
    </div>
  );
};

const Player = memo(() => {
  const { currentSong } = useAudioStoreNew();
  const PLACEHOLDER_IMAGE = useThemedPlaceholder();
  return (
    <>
      <motion.div className={style.Player}>
        <div
          data-name="Track Info and Artwork"
          className={style.TrackInfoAndArtwork}
        >
          <Artwork
            src={
              currentSong?.artwork.hdUrl ||
              currentSong?.artwork.url ||
              PLACEHOLDER_IMAGE
            }
          />
          <TrackInfo />
        </div>
        <Controls />
        <FullScreen.Button />
      </motion.div>
      <FullScreen.Screen />
    </>
  );
});

Player.displayName = "Player";
