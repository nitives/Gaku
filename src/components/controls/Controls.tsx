"use client";
import { useAudioStore } from "@/context/AudioContext";
import React, { useEffect, useMemo, useRef, useState } from "react";
import style from "./Controls.module.css";

import { IoPlay, IoPlayBack, IoPlayForward } from "react-icons/io5";
import { PiPauseFill } from "react-icons/pi";
import { Volume2, VolumeX } from "lucide-react";

import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";
import { TitleOverflowAnimator } from "@/components/mobile/TitleOverflowAnimator";
import { Song } from "@/lib/audio/types";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { CloseButton } from "@/components/controls/CloseButton";
import dynamic from "next/dynamic";
import AnimatedCover from "@/components/player/AnimatedCover";
import { LyricIcon } from "@/components/icons/LyricIcon";
import { Options } from "@/components/icons/Options";
import { useThemedPlaceholder } from "@/lib/utils/themedPlaceholder";
import { SoundCloudKit } from "@/lib/audio/fetchers";
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
    useAudioStore();
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

  const PLACEHOLDER_IMAGE = useThemedPlaceholder();
  const IMAGEHD = SoundCloudKit.getHD(song?.artwork?.url || "");

  const currentTime = useAudioStore((state) => state.currentTime ?? 0);
  const duration = useAudioStore((state) => state.duration ?? 0);
  const seek = useAudioStore((state) => state.seek);

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
              src={IMAGEHD || PLACEHOLDER_IMAGE}
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
  const IMAGEHD = SoundCloudKit.getHD(song?.artwork?.url || "");

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
        src={IMAGEHD || PLACEHOLDER_IMAGE}
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
    whileHover: { backgroundColor: "rgba(255, 255, 255, 0.125)" },
    whileTap: {
      scale: 0.9,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17,
    },
    className: "flex flex-col items-center rounded-full p-2",
  };
  return (
    <motion.button
      title="Lyrics"
      {...buttonMotionProps}
      onClick={onClick}
      style={{
        backgroundColor: active
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(255, 255, 255, 0.05)",
      }}
      className="flex items-center justify-center size-8 rounded-full"
    >
      <LyricIcon className="size-[20px] fill-white" />
    </motion.button>
  );
};

export const OptionsButton = ({ onClick }: { onClick: () => void }) => {
  const buttonMotionProps = {
    whileHover: { backgroundColor: "rgba(255, 255, 255, 0.125)" },
    whileTap: {
      scale: 0.9,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17,
    },
    className:
      "flex flex-col items-center rounded-full p-2 justify-center size-8",
  };
  return (
    <motion.button
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.05)",
      }}
      title="Options"
      {...buttonMotionProps}
      onClick={onClick}
    >
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
  const sliderRef = useRef<HTMLInputElement>(null);

  // Calculate seek percentage only when needed
  const seekPercentage = useMemo(() => {
    return (currentTime / (duration || 1)) * 100 || 0;
  }, [currentTime, duration]);

  // Update the slider position using transform instead of CSS variables
  useEffect(() => {
    if (sliderRef.current) {
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        if (sliderRef.current) {
          sliderRef.current.style.setProperty(
            "--seek-value",
            `${seekPercentage}%`
          );
        }
      });
    }
  }, [seekPercentage]);

  return (
    <div className="flex items-center gap-2 w-full">
      <motion.input
        ref={sliderRef}
        type="range"
        min={0}
        max={duration || 1}
        value={currentTime}
        onChange={onChange}
        // whileHover={{ scaleY: 1.5 }}
        // whileTap={{ scaleY: 0.995 }}
        className="gaku-slider seek-slider"
      />
    </div>
  );
};

export const VolumeSlider = ({
  volume,
  onChange,
  animated = true,
}: {
  volume: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  animated?: boolean;
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);

  // Convert decimal volume (0-1) to percentage for display
  const volumePercentage = volume * 100;

  // Set CSS variable for volume slider track styling
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--volume-value",
      `${volumePercentage}%`
    );
  }, [volumePercentage]);

  const handleMute = () => {
    if (isMuted) {
      // Unmute: restore previous volume
      const newEvent = {
        target: {
          value: previousVolume.toString(),
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(newEvent);
      setIsMuted(false);
    } else {
      // Mute: save current volume and set to 0
      setPreviousVolume(volume);
      const newEvent = {
        target: {
          value: "0",
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(newEvent);
      setIsMuted(true);
    }
  };

  if (!animated)
    return (
      <div className="flex items-center gap-2 w-full">
        <button
          title={isMuted ? "Unmute" : "Mute"}
          aria-label={isMuted ? "Unmute" : "Mute"}
          onClick={handleMute}
        >
          <VolumeIcon
            volume={volume}
            isMuted={isMuted}
            fill="var(--foreground)"
            size={12}
          />
        </button>
        <input
          className="gaku-slider volume-slider"
          type="range"
          min={0}
          max={1}
          step="0.01"
          value={volume}
          onChange={onChange}
        />
      </div>
    );

  return (
    <div className="flex items-center gap-2 w-full">
      <motion.button
        title={isMuted ? "Unmute" : "Mute"}
        whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.125)" }}
        whileTap={{ scale: 0.9, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
        transition={{ duration: 0.125, ease: "easeInOut" }}
        onClick={handleMute}
        className="p-1.5 rounded-full bg-transparent"
      >
        {volume === 0 || isMuted ? (
          <VolumeX size={20} className="text-white/80" />
        ) : (
          <Volume2 size={20} className="text-white/80" />
        )}
      </motion.button>
      <motion.input
        whileHover={{ scaleY: 1.5 }}
        whileTap={{ scaleY: 0.995 }}
        className="gaku-slider volume-slider"
        type="range"
        min={0}
        max={1}
        step="0.01"
        value={volume}
        onChange={onChange}
      />
    </div>
  );
};

interface VolumeIconProps {
  volume: number; // A value between 0 and 1
  isMuted: boolean; // Mute status
  className?: string;
  fill?: string; // Fill color
  size?: number; // Size of the icon
  width?: number; // Width of the icon
  height?: number; // Height of the icon
}

export const VolumeIcon: React.FC<VolumeIconProps> = ({
  volume,
  isMuted,
  className,
  fill,
  size,
  width,
  height,
}) => {
  if (isMuted || volume === 0) {
    // MUTE/0% ICON
    return (
      <svg
        width={size || width || "23"}
        height={size || height || "24"}
        viewBox="0 0 23 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M4.94792 16.8551H8.25402C8.36066 16.8551 8.44808 16.8839 8.52589 16.95L13.4871 21.5853C14.0843 22.1431 14.5655 22.3826 15.1636 22.3826C15.832 22.3826 16.3481 22.0421 16.5715 21.3551L2.95058 7.74378C2.55801 8.1748 2.35059 8.82401 2.35059 9.68721V14.1439C2.35059 15.9633 3.22972 16.8551 4.94792 16.8551ZM16.683 14.7645V2.97964C16.683 2.11456 16.0458 1.41964 15.1519 1.41964C14.5568 1.41964 14.1387 1.67417 13.4871 2.27675L8.94073 6.49598C8.89058 6.53652 8.8287 6.57918 8.76683 6.58129H8.47854L16.683 14.7645Z"
          fill={fill || "currentColor"}
        />
        <path
          d="M20.7703 23.5182C21.1345 23.8803 21.7394 23.8824 22.0898 23.5182C22.4519 23.1464 22.454 22.5628 22.0898 22.2007L1.60125 1.71426C1.23914 1.35004 0.634218 1.35004 0.27 1.71426C-0.09 2.06676 -0.09 2.68129 0.27 3.03379L20.7703 23.5182Z"
          fill={fill || "currentColor"}
        />
      </svg>
    );
  } else if (volume < 0.34) {
    // 33% LOW ICON
    return (
      <svg
        width={size || width || "22"}
        height={size || height || "21"}
        viewBox="0 0 22 21"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M12.8205 20.9747C13.6952 20.9747 14.3304 20.3395 14.3304 19.4744V1.57171C14.3304 0.706638 13.6952 0.0117188 12.8013 0.0117188C12.2041 0.0117188 11.7785 0.25664 11.1462 0.868826L6.23296 5.4593C6.16476 5.52539 6.06984 5.56055 5.9632 5.56055H2.64538C0.927185 5.56055 0 6.5175 0 8.32734V12.6783C0 14.4977 0.927185 15.4472 2.64538 15.4472H5.96109C6.06773 15.4472 6.16265 15.476 6.23085 15.5421L11.1462 20.1773C11.7241 20.7351 12.2149 20.9747 12.8205 20.9747Z"
          fill={fill || "currentColor"}
        />
        <path
          d="M18.5033 15.6804C18.9871 16.0005 19.6391 15.8932 19.9977 15.3792C20.9401 14.1218 21.5024 12.3335 21.5024 10.4815C21.5024 8.62945 20.9401 6.85078 19.9977 5.57953C19.6391 5.06977 18.9871 4.95071 18.5033 5.28258C17.9322 5.65711 17.8302 6.3464 18.2757 7.00194C18.9238 7.92257 19.2915 9.17484 19.2915 10.4815C19.2915 11.7881 18.9142 13.0287 18.2757 13.961C17.8398 14.6241 17.9322 15.2962 18.5033 15.6804Z"
          fill={fill || "currentColor"}
        />
      </svg>
    );
  } else if (volume < 0.67) {
    // 66% MED ICON
    return (
      <svg
        width={size || width || "28"}
        height={size || height || "21"}
        viewBox="0 0 28 21"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M12.8205 20.9747C13.6952 20.9747 14.3304 20.3395 14.3304 19.4744V1.57171C14.3304 0.706638 13.6952 0.0117188 12.8013 0.0117188C12.2041 0.0117188 11.7881 0.26625 11.1462 0.868826L6.23296 5.4593C6.16476 5.52539 6.06984 5.56055 5.9632 5.56055H2.64538C0.927185 5.56055 0 6.5175 0 8.32734V12.6783C0 14.4977 0.927185 15.4472 2.64538 15.4472H5.96109C6.06773 15.4472 6.16265 15.476 6.23085 15.5421L11.1462 20.1773C11.7241 20.7351 12.2149 20.9747 12.8205 20.9747Z"
          fill={fill || "currentColor"}
        />
        <path
          d="M18.5131 15.6804C18.9969 16.0005 19.6489 15.8932 20.0075 15.3792C20.952 14.1218 21.5122 12.3335 21.5122 10.4815C21.5122 8.62945 20.952 6.85078 20.0075 5.57953C19.6489 5.06977 18.9969 4.95071 18.5131 5.28258C17.942 5.65711 17.84 6.3464 18.2877 7.00194C18.9357 7.92257 19.3013 9.17484 19.3013 10.4815C19.3013 11.7881 18.924 13.0287 18.2877 13.961C17.8496 14.6241 17.942 15.2962 18.5131 15.6804Z"
          fill={fill || "currentColor"}
        />
        <path
          d="M23.1864 18.8128C23.7128 19.1479 24.3615 19.0193 24.7264 18.4875C26.2517 16.3322 27.137 13.4477 27.137 10.4815C27.137 7.51523 26.2613 4.61156 24.7264 2.47336C24.3615 1.94368 23.7128 1.81501 23.1864 2.15016C22.6346 2.49797 22.5559 3.18375 22.9611 3.79077C24.2089 5.61023 24.9282 8.00648 24.9282 10.4815C24.9282 12.9565 24.1897 15.3314 22.9611 17.1701C22.5655 17.7771 22.6346 18.465 23.1864 18.8128Z"
          fill={fill || "currentColor"}
        />
      </svg>
    );
  } else {
    // 100% / FULL ICON
    return (
      <svg
        width={size || width || "33"}
        height={size || height || "24"}
        viewBox="0 0 33 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M12.8205 22.1641C13.6952 22.1641 14.3304 21.5289 14.3304 20.6639V2.76112C14.3304 1.89605 13.6952 1.20113 12.8013 1.20113C12.2041 1.20113 11.7785 1.44605 11.1462 2.05824L6.23296 6.64871C6.16476 6.7148 6.06984 6.74996 5.9632 6.74996H2.64538C0.927185 6.74996 0 7.70691 0 9.51675V13.8677C0 15.6871 0.927185 16.6366 2.64538 16.6366H5.96109C6.06773 16.6366 6.16265 16.6654 6.23085 16.7315L11.1462 21.3667C11.7241 21.9246 12.2149 22.1641 12.8205 22.1641Z"
          fill={fill || "currentColor"}
        />
        <path
          d="M18.5034 16.8698C18.9872 17.1899 19.6392 17.0826 19.9978 16.5686C20.9402 15.3112 21.5025 13.5229 21.5025 11.6709C21.5025 9.81886 20.9402 8.04019 19.9978 6.76894C19.6392 6.25918 18.9872 6.14012 18.5034 6.47199C17.9323 6.84652 17.8303 7.53581 18.2758 8.19135C18.9239 9.11198 19.2916 10.3642 19.2916 11.6709C19.2916 12.9775 18.9143 14.2181 18.2758 15.1504C17.8399 15.8135 17.9323 16.4856 18.5034 16.8698Z"
          fill={fill || "currentColor"}
        />
        <path
          d="M23.1865 20.0022C23.7129 20.3374 24.3616 20.2087 24.7265 19.6769C26.2518 17.5216 27.1371 14.6371 27.1371 11.6709C27.1371 8.70464 26.2614 5.80097 24.7265 3.66277C24.3616 3.13309 23.7129 3.00442 23.1865 3.33957C22.6347 3.68738 22.556 4.37316 22.9612 4.98018C24.209 6.79964 24.9283 9.19589 24.9283 11.6709C24.9283 14.1459 24.1898 16.5208 22.9612 18.3595C22.5656 18.9665 22.6347 19.6544 23.1865 20.0022Z"
          fill={fill || "currentColor"}
        />
        <path
          d="M27.8953 23.1731C28.4013 23.5124 29.0852 23.3636 29.448 22.8063C31.5157 19.7233 32.7503 15.8835 32.7503 11.6772C32.7503 7.46339 31.4868 3.64074 29.448 0.550275C29.0852 -0.0187835 28.4013 -0.155892 27.8953 0.183481C27.3424 0.538792 27.2648 1.21824 27.6466 1.82105C29.4419 4.54893 30.5587 7.93448 30.5587 11.6772C30.5587 15.4103 29.4419 18.8172 27.6466 21.5355C27.2648 22.1383 27.3424 22.8156 27.8953 23.1731Z"
          fill={fill || "currentColor"}
        />
      </svg>
    );
  }
};
