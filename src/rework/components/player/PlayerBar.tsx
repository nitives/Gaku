import React from "react";
import style from "./PlayerBar.module.css";
import Image from "next/image";
import { Artwork } from "./Artwork";
import { TrackInfo } from "./TrackInfo";

const EXAMPLE_ALBUM_COVER =
  "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/bd/3b/a9/bd3ba9fb-9609-144f-bcfe-ead67b5f6ab3/196589564931.jpg/1000x1000bb.jpg";

export const PlayerBar = () => {
  return (
    <div className={style.PlayerBar}>
      <Player />
    </div>
  );
};

const Player = () => {
  return (
    <div className={style.Player}>
      <Artwork src={EXAMPLE_ALBUM_COVER} />
      <TrackInfo />
    </div>
  );
};
