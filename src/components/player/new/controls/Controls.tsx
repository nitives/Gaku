import { useAudioStoreNew } from "@/context/AudioContextNew";
import React, { useEffect, useState } from "react";
import style from "./Controls.module.css";

import { IoPlay, IoPlayBack, IoPlayForward } from "react-icons/io5";
import { PiPauseFill } from "react-icons/pi";

import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";
import { TitleOverflowAnimator } from "@/components/mobile/TitleOverflowAnimator";
import { Song } from "@/lib/audio/types";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { CloseButton } from "./components/CloseButton";
import dynamic from "next/dynamic";
import AnimatedCover from "@/components/AnimatedCover";
import { LyricIcon } from "@/components/Icons/LyricIcon";
import { Options } from "@/components/Icons/Options";
import { useThemedPlaceholder } from "@/lib/utils/themedPlaceholder";
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
      <LayoutGroup>
        {/* Minimized Player */}
        {!isExpanded && (
          <div className={style.controlsContainer}>
            <div className={style.controls}>
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
      </LayoutGroup>
    </>
  );
};

export const playerImageProps = {
  initial: { filter: "blur(2px)" },
  animate: { filter: "blur(0px)" },
  exit: { filter: "blur(2px)" },
  layout: "position", // Ensures consistent layout animations
  transition: { ease: "easeInOut" },
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
    <div className="fixed bottom-[5rem] left-0 right-0">
      <div className={style.miniPlayer}>
        <motion.div
          onClick={onExpand}
          layout
          className="flex items-center w-full cursor-pointer"
        >
          <motion.div
            layoutId="playerImage"
            layout="preserve-aspect"
            className="relative overflow-hidden origin-center size-11"
          >
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

export const buttonMotionProps = {
  whileHover: { backgroundColor: "rgba(255, 255, 255, 0.05)" },
  whileTap: {
    scale: 0.85,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  transition: { duration: 0.125, ease: "easeInOut" },
  className: "flex flex-col items-center rounded-full p-2",
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

export interface ExpandedPlayerProps {
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
  const isDesktop = useMediaQuery("(min-width: 955px)");
  const [lyricsVisible, setLyricsVisible] = useState(false);
  const toggleLyrics = () => setLyricsVisible(!lyricsVisible);

  const currentTime = useAudioStoreNew((state) => state.currentTime ?? 0);
  const duration = useAudioStoreNew((state) => state.duration ?? 0);
  const seek = useAudioStoreNew((state) => state.seek);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    seek(newTime);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const controlsBaseProps = {
    // layout: true,
    className:
      "fixed inset-0 flex flex-col bg-black text-white z-[110] standalone:pt-10",
    initial: { opacity: 0, filter: "blur(10px)" },
    animate: { opacity: 1, filter: "blur(0px)" },
    exit: { opacity: 0, filter: "blur(10px)" },
    transition: { duration: 0.3, ease: "easeInOut" },
  };

  if (!isDesktop)
    return (
      <motion.div {...controlsBaseProps}>
        <motion.div layout style={{ zIndex: 10 }}>
          Mobile view
          <motion.div>
            <CloseButton onClick={onClose} />
          </motion.div>
          {/* Cover Art */}
          <motion.div
            {...playerImageProps}
            layout="preserve-aspect"
            layoutId="playerImage"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <motion.span>
              <AppleCover
                imageSize={250}
                isDesktop={isDesktop}
                song={song}
                isAnimated={Boolean(song?.artwork?.animatedURL)}
              />
            </motion.span>
          </motion.div>
          {/* Controls & Info */}
          <motion.div
            style={{
              display: "flex",
              flexDirection: "column",
              alignContent: "center",
            }}
          >
            {/* Info */}
            <motion.div>
              <motion.h2 className="text-lg font-semibold text-center">
                {song?.name}
              </motion.h2>
              <motion.h2 className="text-sm text-center text-white/75">
                {song?.artist.name}
              </motion.h2>
            </motion.div>
            {/* Controls */}
            <motion.div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <DurationSlider
                duration={duration}
                currentTime={currentTime}
                onChange={handleSeekChange}
              />
              <ExpandedPlayerControls
                onPlayPause={onPlayPause}
                playing={isPlaying}
                onNext={onNext}
                onPrev={onPrev}
              />
            </motion.div>
          </motion.div>
        </motion.div>
        {/* {lyricsVisible && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col size-full items-center justify-center"
          >
            <AppleLyrics />
          </motion.span>
        )} */}
        <BackgroundRender
          fps={30}
          playing={isPlaying}
          style={{
            position: "fixed",
            width: "100%",
            height: "100%",
            inset: "0",
          }}
          album={song?.artwork.url}
          // albumIsVideo={false}
        />
      </motion.div>
    );

  return (
    <motion.div {...controlsBaseProps}>
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
              : "flex-row h-fit px-4 items-start mt-16 mb-8 justify-start"
          } flex w-full`}
        >
          <motion.div
            // {...playerImageProps}
            layout="position"
            layoutId="playerImage"
            className="relative"
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
              width={400}
              height={400}
              quality={10}
              unoptimized={true}
              draggable={false}
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <AppleCover
                isAnimated={Boolean(song?.artwork?.animatedURL)}
                isDesktop={isDesktop}
                song={song}
              />
            </span>
          </motion.div>
          <motion.div
            layout="position"
            className={`${
              isDesktop ? "w-[20rem] flex-col mt-3" : "w-full h-fit px-4 -mt-2"
            } flex justify-center items-center`}
          >
            <motion.div
              layout="position"
              layoutId="playerInfo"
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
                  isDesktop ? "text-lg text-center" : "text-sm "
                } font-semibold`}
              >
                {song?.name}
              </motion.h2>
              <motion.h2
                layout="position"
                layoutId="playerArtist"
                className={`${
                  isDesktop ? "text-sm text-center" : "text-xs"
                } text-white/75 cursor-pointer`}
                onClick={() => {
                  const artistUrl = `/artist/${song?.artist.id}/${song?.artist.id}`;
                  if (
                    window.location.pathname.includes(
                      song?.artist.id.toString() || ""
                    )
                  ) {
                    onClose();
                  } else {
                    window.location.href = artistUrl;
                  }
                }}
              >
                {song?.artist.name}
              </motion.h2>
            </motion.div>
            <motion.div
              layout="position"
              layoutId="playerControls"
              className={`${
                isDesktop ? "flex-col mt-4" : "mt-0 justify-between"
              } flex items-center w-full gap-2`}
            >
              {isDesktop && (
                <div className="flex w-full items-center gap-2">
                  <span className="text-xs text-white/75">
                    {formatTime(currentTime)}
                  </span>
                  <DurationSlider
                    duration={duration}
                    currentTime={currentTime}
                    onChange={handleSeekChange}
                  />
                  <span className="text-xs text-white/75">
                    {formatTime(duration)}
                  </span>
                </div>
              )}
              <div>
                <ExpandedPlayerControls
                  onPlayPause={onPlayPause}
                  playing={isPlaying}
                  onNext={onNext}
                  onPrev={onPrev}
                />
              </div>
              <div
                className={`${
                  isDesktop ? "w-full" : ""
                } flex items-center gap-2 justify-between`}
              >
                {isDesktop && (
                  <LyricButton active={lyricsVisible} onClick={toggleLyrics} />
                )}
                <OptionsButton onClick={toggleLyrics} />
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
        fps={30}
        playing={isPlaying}
        style={{
          position: "fixed",
          width: "100%",
          height: "100%",
          inset: "0",
        }}
        album={song?.artwork.url}
        // albumIsVideo={false}
      />
    </motion.div>
  );
};

/**
 * Formats the given time in seconds to a mm:ss format.
 */
export function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export const ExpandedPlayerControls = ({
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
      <motion.button {...buttonMotionProps} onClick={onPrev}>
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

export const AppleCover = ({
  isDesktop,
  song,
  isAnimated,
  imageSize = 400,
}: {
  isDesktop: boolean;
  song: Song | undefined;
  isAnimated: boolean;
  imageSize?: number;
}) => {
  const PLACEHOLDER_IMAGE = useThemedPlaceholder();

  const squircleStyle = {
    width: imageSize,
    height: imageSize,
    clipPath:
      'path("M0.0,27.3 C0.0,12.26 12.26,0.0 27.3,0.0 L372.7,0.0 C387.74,0.0 400,12.26 400,27.3 L400,372.7 C400,387.74 387.74,400 372.7,400 L27.3,400 C12.26,400 0.0,387.74 0.0,372.7 Z")',
    overflow: "hidden",
  };

  if (isAnimated) {
    return (
      <div className="select-none" style={squircleStyle}>
        <AnimatedCover
          style={{
            width: imageSize,
            height: imageSize,
          }}
          url={song?.artwork?.animatedURL || ""}
        />
      </div>
    );
  }

  return (
    <div className="select-none" style={squircleStyle}>
      <Image
        className={isDesktop ? "" : ""}
        src={song?.artwork?.hdUrl || song?.artwork?.url || PLACEHOLDER_IMAGE}
        alt={song?.name || "Missing Image"}
        width={imageSize}
        height={imageSize}
        unoptimized={true}
        draggable={false}
      />
    </div>
  );
};

export const LyricButton = ({
  onClick,
  active,
}: {
  onClick: () => void;
  active: boolean;
}) => {
  const buttonMotionProps = {
    whileHover: { backgroundColor: "rgba(255, 255, 255, 0.05)" },
    whileTap: {
      scale: 0.9,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    transition: { duration: 0.125, ease: "easeInOut" },
    className: "flex flex-col items-center rounded-full p-2",
  };
  return (
    <motion.button
      {...buttonMotionProps}
      onClick={onClick}
      style={{
        backgroundColor: active ? "rgba(255, 255, 255, 0.1)" : "transparent",
      }}
      className="flex items-center justify-center w-10 h-10 rounded-full"
    >
      <LyricIcon className="size-[24px] fill-white" />
    </motion.button>
  );
};

export const OptionsButton = ({ onClick }: { onClick: () => void }) => {
  const buttonMotionProps = {
    whileHover: { backgroundColor: "rgba(255, 255, 255, 0.075)" },
    whileTap: {
      scale: 0.9,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    transition: { duration: 0.125, ease: "easeInOut" },
    style: {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
    },
    className:
      "flex flex-col items-center rounded-full p-2 justify-center size-10",
  };
  return (
    <motion.button {...buttonMotionProps} onClick={onClick}>
      <Options className="size-[24px] fill-white" />
    </motion.button>
  );
};

export const DurationSlider = ({
  duration,
  currentTime,
  onChange,
}: {
  duration: number;
  currentTime: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <>
      <input
        type="range"
        min={0}
        max={duration || 1}
        value={currentTime}
        onChange={onChange}
        className="flex-1 accent-white rounded-lg h-2"
      />
    </>
  );
};
