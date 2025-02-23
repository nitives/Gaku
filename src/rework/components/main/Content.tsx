"use client";
import React, { ReactNode } from "react";
import { ScrollPage } from "./ScrollPage";
import { Sidebar } from "../navigation/Sidebar";
import style from "./Main.module.css";
import { PlayerBar } from "../player/PlayerBar";
import { useIsPWA } from "@/hooks/useIsPWA";
import { MobileView } from "../mobile/MobileView";

interface ContentProps {
  children?: ReactNode;
}

export const Content = ({ children }: ContentProps) => {
  const isPWA = useIsPWA();

  return (
    <div aria-label="Content">
      {isPWA ? (
        <>
          <MobileView />
        </>
      ) : (
        <div className={style.Content}>
          <Sidebar />
          <PlayerBar />
          <ScrollPage>{children}</ScrollPage>
        </div>
      )}
    </div>
  );
};
