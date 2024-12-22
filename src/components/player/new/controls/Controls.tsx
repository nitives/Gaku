import { useAudioStoreNew } from "@/context/AudioContextNew";
import React, { useState } from "react";
import styles from "./Controls.module.css";

import { IoPlay, IoPlayBack, IoPlayForward } from "react-icons/io5";
import { PiPauseFill } from "react-icons/pi";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";
import { TitleOverflowAnimator } from "@/components/mobile/TitleOverflowAnimator";
import { Song } from "@/lib/audio/types";
import { useMediaQuery } from "@/hooks/use-media-query";
import { CloseButton } from "./components/CloseButton";
import dynamic from "next/dynamic";
// import { AppleLyrics } from "../lyrics/AppleLyrics";
// import { BackgroundRender } from "@applemusic-like-lyrics/react";

// Fix document not defined error
const AppleLyrics = dynamic(
  () => import("../lyrics/AppleLyrics").then((mod) => mod.AppleLyrics),
  {
    ssr: false,
  }
);
// Also fixing document not defined error
const BackgroundRender = dynamic(
  () =>
    import("@applemusic-like-lyrics/react").then((mod) => mod.BackgroundRender),
  {
    ssr: false,
  }
);

export const Controls: React.FC = () => {
  const { currentSong, isPlaying, nextSong, previousSong, setIsPlaying } =
    useAudioStoreNew();
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const handleClose = () => {
    setIsExpanded(false);
  };

  return (
    <>
      {/* Minimized Player */}
      {!isExpanded && (
        <div className={styles.controlsContainer}>
          <div className={styles.controls}>
            <MiniPlayer
              song={currentSong || undefined}
              playing={isPlaying}
              onPlayPause={handlePlayPause}
              onNext={nextSong}
              onExpand={handleExpand}
            />
          </div>
        </div>
      )}

      {/* Expanded Player */}
      <AnimatePresence>
        {isExpanded && (
          <ExpandedPlayer
            key="expanded"
            song={currentSong || undefined}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onNext={nextSong}
            onPrev={previousSong}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </>
  );
};

interface MiniPlayerProps {
  song?: Song;
  playing: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onExpand: () => void;
}

const MiniPlayer = ({
  song,
  onPlayPause,
  playing,
  onNext,
  onExpand,
}: MiniPlayerProps) => {
  const { theme } = useTheme();
  return (
    <div className="fixed bottom-[5rem] left-0 right-0 z-50">
      <div className={styles.miniPlayer}>
        {/* navbar-mini-container mini-control */}
        <motion.div
          onClick={onExpand}
          className="flex items-center w-full cursor-pointer"
        >
          <motion.div layout="preserve-aspect" layoutId="playerImage">
            <Image
              className="size-11 rounded-lg"
              src={
                song?.artwork?.url ||
                (theme === "light"
                  ? "/assets/placeholders/missing_song_light.png"
                  : "/assets/placeholders/missing_song_dark.png")
              }
              alt={song?.name || "Missing Image"}
              width={200}
              height={200}
              unoptimized={true}
              draggable={false}
            />
          </motion.div>
          <motion.div>
            <TitleOverflowAnimator>{song?.name}</TitleOverflowAnimator>
          </motion.div>
        </motion.div>
        <ControlButtons
          onPlayPause={onPlayPause}
          playing={playing}
          onNext={onNext}
        />
      </div>
    </div>
  );
};

interface ControlButtonsProps {
  playing: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev?: () => void;
}

const ControlButtons = ({
  playing,
  onPlayPause,
  onNext,
}: ControlButtonsProps) => {
  const buttonMotionProps = {
    whileHover: { backgroundColor: "rgba(255, 255, 255, 0.05)" },
    whileTap: {
      scale: 0.85,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    transition: { duration: 0.125, ease: "easeInOut" },
    className: "flex flex-col items-center rounded-full p-2",
  };

  return (
    <div className="flex items-center pr-2 gap-2">
      <motion.button {...buttonMotionProps} onClick={onPlayPause}>
        {playing ? <PiPauseFill size={26} /> : <IoPlay size={26} />}
      </motion.button>
      <motion.button {...buttonMotionProps} onClick={onNext}>
        <IoPlayForward size={26} />
      </motion.button>
    </div>
  );
};

interface ExpandedPlayerProps {
  song?: Song;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

const ExpandedPlayer = ({
  song,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onClose,
}: ExpandedPlayerProps) => {
  const { theme } = useTheme();
  const desktop = useMediaQuery("(min-width: 955px)");
  const [lyricsVisible, setLyricsVisible] = useState(false);
  const toggleLyrics = () => setLyricsVisible(!lyricsVisible);
  const isDesktop = desktop;

  const currentTime = useAudioStoreNew((state) => state.currentTime ?? 0);
  const duration = useAudioStoreNew((state) => state.duration ?? 0);
  const seek = useAudioStoreNew((state) => state.seek);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    seek(newTime);
  };

  const buttonMotionProps = {
    whileHover: { backgroundColor: "rgba(255, 255, 255, 0.05)" },
    whileTap: {
      scale: 0.85,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    transition: { duration: 0.125, ease: "easeInOut" },
    className: "flex flex-col items-center rounded-full p-2",
  };

  return (
    <motion.div
      className="fixed inset-0 flex flex-col bg-black text-white z-[110]"
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <motion.div className="flex justify-start z-20 absolute w-full">
        <CloseButton onClick={onClose} />
      </motion.div>
      <motion.div
        className={`${
          !isDesktop ? "flex-col" : ""
        } flex-1 flex items-center justify-center z-10`}
      >
        <motion.span
          layout="preserve-aspect"
          className={`${
            isDesktop
              ? "justify-center h-full flex-col items-center"
              : "flex-row h-fit px-4 items-start my-16 justify-start"
          } flex w-full`}
        >
          <motion.div
            className="relative"
            layout="preserve-aspect"
            layoutId="playerImage"
          >
            <Image
              className={`${
                isDesktop ? "rounded-[1rem]" : "rounded-[6px]"
              } blur-md opacity-25 translate-y-1`}
              src={
                song?.artwork?.hdUrl ||
                song?.artwork?.url ||
                (theme === "light"
                  ? "/assets/placeholders/missing_song_light.png"
                  : "/assets/placeholders/missing_song_dark.png")
              }
              alt={song?.name || "Missing Image"}
              width={isDesktop ? 300 : 50}
              height={isDesktop ? 300 : 50}
              quality={10}
              unoptimized={true}
              draggable={false}
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <Image
                className={`${isDesktop ? "rounded-[1rem]" : "rounded-[6px]"}`}
                src={
                  song?.artwork?.hdUrl ||
                  song?.artwork?.url ||
                  (theme === "light"
                    ? "/assets/placeholders/missing_song_light.png"
                    : "/assets/placeholders/missing_song_dark.png")
                }
                alt={song?.name || "Missing Image"}
                width={isDesktop ? 300 : 50}
                height={isDesktop ? 300 : 50}
                unoptimized={true}
                draggable={false}
              />
            </span>
          </motion.div>
          <motion.div
            className={`${
              isDesktop
                ? "w-[20rem] flex-col mt-3"
                : "w-full h-fit px-4 -mt-2"
            } flex justify-center items-center`}
          >
            <motion.div
              className={`${
                isDesktop
                  ? "w-full justify-center items-center"
                  : "min-w-[100px]"
              } flex flex-col`}
            >
              <motion.h2
                layout="position"
                layoutId="playerTitle"
                className={`${
                  isDesktop ? "text-lg " : "text-sm "
                } font-semibold`}
              >
                {song?.name}
              </motion.h2>
              <motion.h2
                layout="position"
                layoutId="playerArtist"
                className={`${
                  isDesktop ? "text-sm" : "text-xs"
                } text-white/75`}
              >
                {song?.artistName}
              </motion.h2>
            </motion.div>

            <motion.div
              layout="position"
              layoutId="playerSlider"
              className={`${
                isDesktop ? "flex-col mt-4" : "mt-0"
              } w-full flex items-center gap-2`}
            >
              <div className="flex w-full items-center gap-2">
                <span className="text-xs text-white/75">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration || 1}
                  // step="0.1"
                  value={currentTime}
                  onChange={handleSeekChange}
                  className="flex-1"
                />
                <span className="text-xs text-white/75">
                  {formatTime(duration)}
                </span>
              </div>
              <div>
                <ExpandedPlayerControls
                  onPlayPause={onPlayPause}
                  playing={isPlaying}
                  onNext={onNext}
                  onPrev={onPrev}
                />
              </div>
              <div className="flex items-center w-full gap-2 justify-between">
                <button onClick={toggleLyrics} className="text-white">
                  Lyrics
                </button>
                <motion.button {...buttonMotionProps} onClick={toggleLyrics}>
                  <IoPlayForward size={32} />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </motion.span>
        {lyricsVisible && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col size-full items-center justify-center"
          >
            <AppleLyrics />
          </motion.span>
        )}
      </motion.div>
      <BackgroundRender
        fps={60}
        playing={isPlaying}
        style={{
          position: "fixed",
          width: "100%",
          height: "100%",
          inset: "0",
        }}
        album={song?.artwork?.url}
        // albumIsVideo={albumIsVideo}
      />
    </motion.div>
  );
};

/**
 * Formats the given time in seconds to a mm:ss format.
 */
function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

const ExpandedPlayerControls = ({
  playing,
  onPlayPause,
  onNext,
  onPrev,
}: ControlButtonsProps) => {
  const buttonMotionProps = {
    whileHover: { backgroundColor: "rgba(255, 255, 255, 0.05)" },
    whileTap: {
      scale: 0.85,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    transition: { duration: 0.125, ease: "easeInOut" },
    className: "flex flex-col items-center rounded-full p-2",
  };

  return (
    <div className="flex items-center gap-2">
      <motion.button {...buttonMotionProps} onClick={onNext}>
        <IoPlayBack size={32} />
      </motion.button>
      <motion.button {...buttonMotionProps} onClick={onPlayPause}>
        {playing ? <PiPauseFill size={32} /> : <IoPlay size={32} />}
      </motion.button>
      <motion.button {...buttonMotionProps} onClick={onNext}>
        <IoPlayForward size={32} />
      </motion.button>
    </div>
  );
};
