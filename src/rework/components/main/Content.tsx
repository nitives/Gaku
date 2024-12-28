import React, { ReactNode } from "react";
import { ScrollPage } from "./ScrollPage";
import { Sidebar } from "../navigation/Sidebar";
import style from "./Main.module.css";
import { PlayerBar } from "../player/PlayerBar";

interface ContentProps {
  children?: ReactNode;
}

export const Content = ({ children }: ContentProps) => {
  return (
    <div aria-label="Content" className={style.Content}>
      <Sidebar />
      <PlayerBar />
      <ScrollPage>{children}</ScrollPage>
    </div>
  );
};
