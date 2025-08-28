"use client";
import React, { ReactNode } from "react";
import { ScrollPage } from "./ScrollPage";
import { Sidebar } from "../navigation/Sidebar";
import style from "./Main.module.css";
import { PlayerBar } from "../player/new/PlayerBar";
import { useIsPWA } from "@/hooks/useIsPWA";
import { MobileView } from "../mobile/MobileView";
import { useAudioStore } from "@/context/AudioContext";

interface ContentProps {
  children?: ReactNode;
}

export const Content = ({ children }: ContentProps) => {
  const isPWA = useIsPWA();
  // Get fullscreen state from audio store
  const isFullscreen = useAudioStore(
    (state: { isFullscreen: boolean }) => state.isFullscreen
  );

  // Array of pages that should have a minimal layout (no sidebar, player, etc.)
  const minimalLayoutPages = [
    "sign-in",
    "sign-up",
    "forgot-password",
    "reset-password",
  ];

  // Check if current path matches any minimal layout page
  const isMinimalLayout =
    typeof window !== "undefined" &&
    minimalLayoutPages.some((page) => window.location.pathname.includes(page));

  return (
    <div aria-label="Content">
      {isPWA ? (
        <>
          <MobileView />
        </>
      ) : isMinimalLayout ? (
        <div className={style.Content}>{children}</div>
      ) : (
        <div className={`${style.Content} ${isFullscreen ? "invisible" : ""}`}>
          <Sidebar />
          <PlayerBar />
          <ScrollPage>{children}</ScrollPage>
        </div>
      )}
    </div>
  );
};
