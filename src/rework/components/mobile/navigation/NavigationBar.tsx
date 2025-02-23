import React from "react";
import style from "./Navigation.module.css";
import { Artwork } from "../../player/Artwork";
import { Song } from "@/lib/audio/types";
import { useThemedPlaceholder } from "@/lib/utils/themedPlaceholder";

export const NavigationBar = ({ song }: { song: Song | any }) => {
  return (
    <div className={style.NavigationBar}>
      <div className={style.NavigationContent}>
        <TrackContent song={song} />
        <Controls />
      </div>
    </div>
  );
};

const Controls = () => {
  return (
    <div className={style.Controls}>
      <button className={style.Button}>Home</button>
      <button className={style.Button}>Search</button>
      <button className={style.Button}>Library</button>
    </div>
  );
};

const TrackContent = ({ song }: { song: Song | undefined }) => {
  const PLACEHOLDER_IMAGE = useThemedPlaceholder();
  return (
    <div className={style.TrackContent}>
      <Artwork
        src={song?.artwork.hdUrl || song?.artwork.url || PLACEHOLDER_IMAGE}
      />
      <div className={style.TrackInfo}>
        <h3 className={style.TrackTitle}>
          {!song ? "Not Playing" : `${song.name}`}
        </h3>
      </div>
    </div>
  );
};
