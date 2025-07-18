"use client";
import { useRef, useState, useEffect } from "react";
import ReactPlayer from "react-player";
import {
  IoPause,
  IoPlay,
  IoPlayBack,
  IoPlayForward,
  IoVolumeMedium,
  IoVolumeMute,
  IoVolumeOff,
} from "react-icons/io5";
import { FaPause } from "react-icons/fa6";
import Image from "next/image";
import { AnimatePresence, motion, transform } from "framer-motion";
import { TitleOverflowAnimator } from "../mobile/TitleOverflowAnimator";
import useAudioStore from "@/context/AudioContext";
import "../../styles/overlay.css";
import "../../styles/playercontrols.css";
import { CanvasBackground } from "../CanvasBackground";
import { BubbleChat, XMark } from "react-ios-icons";
import { useTheme } from "next-themes";
import { Lyric } from "@/lib/types";

import LyricsView from "../lyrics/LyricsView";
import timelessData from "../../../etc/test/timeless.json";
import { LyricIcon } from "../Icons/LyricIcon";

export const AudioPlayer = ({
  src,
  width,
  height,
  volume: initialVolume = 0.1,
  title,
  artist,
  album,
  img,
  onEnded,
  onNext,
  onPrevious,
  isExplicit,
  onPlayPause,
}: {
  src: string | string[] | MediaStream | undefined;
  width?: string | number | undefined;
  height?: string | number | undefined;
  volume?: number | undefined;
  title?: string;
  artist?: string;
  album?: string;
  img?: string;
  onEnded?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  isExplicit?: boolean;
  onPlayPause?: (playing: boolean) => void;
}) => {
  const { setIsPlaying } = useAudioStore();
  const [volume, setVolume] = useState(initialVolume);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [duration, setDuration] = useState(0);
  const [played, setPlayed] = useState(0);
  const playerRef = useRef<ReactPlayer>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if ("mediaSession" in navigator) {
      const isIPhone = /iPhone/i.test(navigator.userAgent);
      const displayTitle = isIPhone && isExplicit ? `${title} 🅴` : title;
      navigator.mediaSession.metadata = new MediaMetadata({
        title: displayTitle || "Unknown Title",
        artist: artist || "Unknown Artist",
        album: album || "",
        artwork: [
          {
            src: img || "default-image.jpg",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      });

      navigator.mediaSession.setActionHandler("play", () => {
        setPlaying(true);
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        setPlaying(false);
      });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        console.log('User clicked "Next Track" icon.');
        if (onNext) {
          onNext();
        }
      });
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        console.log('User clicked "Previous Track" icon.');
        if (playerRef.current && playerRef.current.getCurrentTime() > 3) {
          playerRef.current.seekTo(0);
        } else if (onPrevious) {
          onPrevious();
        }
      });
      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (details.seekTime && playerRef.current) {
          playerRef.current.seekTo(details.seekTime, "seconds");
        }
      });

      const updatePositionState = () => {
        if (playerRef.current) {
          navigator.mediaSession.setPositionState({
            duration: duration,
            playbackRate: playerRef?.current.getInternalPlayer().playbackRate,
            position: playerRef.current.getCurrentTime(),
          });
        }
      };

      const positionUpdateInterval = setInterval(updatePositionState, 1000);

      return () => {
        clearInterval(positionUpdateInterval);
      };
    }
  }, [title, artist, img, onNext, onPrevious, duration]);

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const handleProgress = (state: { played: number }) => {
    setPlayed(state.played);
  };

  const handlePrevious = () => {
    if (playerRef.current && playerRef.current.getCurrentTime() > 3) {
      playerRef.current.seekTo(0);
    } else if (onPrevious) {
      onPrevious();
    }
  };

  const handleBack = () => {
    setIsExpanded(false); // Close the expanded view
  };

  return (
    <>
      <ReactPlayer
        ref={playerRef}
        volume={muted ? 0 : volume}
        url={src}
        playing={playing}
        width="0px"
        height="0px"
        onDuration={handleDuration}
        onProgress={handleProgress}
        onEnded={onEnded}
      />
      {isExpanded ? (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <ExpandedPlayerControls
            volume={volume}
            setVolume={setVolume}
            muted={muted}
            setMuted={setMuted}
            playing={playing}
            setPlaying={setPlaying}
            duration={duration}
            played={played}
            onSeek={(time) => playerRef.current?.seekTo(time)}
            title={title || "Unknown Title"}
            artist={artist || "Unknown Artist"}
            img={img}
            onNext={onNext}
            onPrevious={handlePrevious}
            onPlayPause={onPlayPause}
            setIsPlaying={setIsPlaying}
            playerRef={playerRef}
            onBack={handleBack}
          />
        </motion.div>
      ) : (
        <Controls
          volume={volume}
          setVolume={setVolume}
          muted={muted}
          setMuted={setMuted}
          playing={playing}
          setPlaying={setPlaying}
          duration={duration}
          played={played}
          onSeek={(time) => playerRef.current?.seekTo(time)}
          title={title || "Unknown Title"}
          artist={artist || "Unknown Artist"}
          img={img}
          onNext={onNext}
          onPrevious={handlePrevious}
          onPlayPause={onPlayPause}
          setIsPlaying={setIsPlaying}
          playerRef={playerRef}
          onExpand={() => setIsExpanded(!isExpanded)}
        />
      )}
    </>
  );
};

const ExpandedPlayerControls = ({
  volume,
  setVolume,
  muted,
  setMuted,
  playing,
  setPlaying,
  duration,
  played,
  onSeek,
  title,
  artist,
  img,
  onNext,
  onPrevious,
  onPlayPause,
  setIsPlaying,
  playerRef,
  onBack, // Add onBack prop to handle closing the expanded view
}: {
  volume: number;
  setVolume: (volume: number) => void;
  muted: boolean;
  setMuted: (muted: boolean) => void;
  playing: boolean;
  setPlaying: (playing: boolean) => void;
  duration: number;
  played: number;
  onSeek: (time: number) => void;
  title: string;
  artist: string;
  img?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  onPlayPause?: (playing: boolean) => void;
  setIsPlaying?: (isPlaying: boolean) => void;
  playerRef: React.RefObject<ReactPlayer>;
  onBack: () => void; // Add this prop to trigger the close action
}) => {
  const [localPlayed, setLocalPlayed] = useState(played * duration);
  const [showLyrics, setShowLyrics] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);
  const { theme } = useTheme();

  // Load current volume to slider visual on first load
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--volume-value",
      `${volume * 100}%`
    );
  }, [volume]);

  useEffect(() => {
    const percentagePlayed = played * 100;
    document.documentElement.style.setProperty(
      "--seek-value",
      `${percentagePlayed}%`
    );
    setLocalPlayed(played * duration);
  }, [played, duration]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = ""; // Re-enable scrolling when unmounted
    };
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMuted(false);
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    document.documentElement.style.setProperty(
      "--volume-value",
      `${newVolume * 100}%`
    );
  };

  const handleMute = () => {
    if (muted) {
      setMuted(false);
      setVolume(previousVolume);
    } else {
      setPreviousVolume(volume);
      setMuted(true);
      setVolume(0);
    }
  };

  const handlePlayPause = () => {
    const newPlayingState = !playing;
    setPlaying(newPlayingState);

    if (setIsPlaying) {
      setIsPlaying(newPlayingState); // Update the global isPlaying state
    }

    if (onPlayPause) {
      onPlayPause(newPlayingState);
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setLocalPlayed(time);
  };

  const handleSeekMouseUp = (
    e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>
  ) => {
    const time = parseFloat((e.target as HTMLInputElement).value);
    onSeek(time);
  };

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, "0");
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  const toggleLyrics = () => {
    setShowLyrics(!showLyrics);
  };

  const useDisplayMode = () => {
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
      // Check if the app is running in standalone mode
      const mediaQuery = window.matchMedia("(display-mode: standalone)");
      setIsStandalone(mediaQuery.matches);

      // Listen for changes in display mode
      const handleChange = (e: MediaQueryListEvent) =>
        setIsStandalone(e.matches);
      mediaQuery.addListener(handleChange);

      return () => mediaQuery.removeListener(handleChange);
    }, []);

    return isStandalone;
  };

  const isStandalone = useDisplayMode();

  const coverVariants = {
    open: { scale: 1.5, x: "40vw", y: "-10vh", transition: { duration: 0.3 } },
    closed: { scale: 1, x: "40vw", y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="overlay bg-black">
      <AnimatePresence>
        <div className="overlay-close-container">
          <button onClick={onBack} className="overlay-close" />
        </div>
        <motion.div
          layout="position"
          className="mt-[2rem] w-full h-fit flex justify-between"
        >
          <CanvasBackground
            // animated
            // blur={isStandalone ? "100" : "200"}
            blur={3}
            src={img || ""}
            warpIntensity={120}
            brightness={playing ? 0.9 : 0.5}
          >
            <div className="px-5">
              <motion.div
                layout="position"
                layoutId="cover"
                // animate={!showLyrics ? { height: "450px" } : { height: "100px" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`flex text-white z-50 transition-all duration-300 w-full pointer-events-none ${
                  !showLyrics
                    ? "justify-center items-center h-[50vh] relative pt-20"
                    : "h-[50vh] absolute"
                }`}
              >
                <motion.div
                  onClick={() => showLyrics && toggleLyrics()}
                  layout="position"
                  className="pointer-events-auto max-w-[25rem] aspect-square shadow-sm"
                  transition={{ duration: 0.5, type: "spring" }}
                  animate={
                    !showLyrics
                      ? {
                          width: "75vw",
                          height: "auto",
                          scale: playing ? 1 : 0.9,
                        }
                      : {
                          width: "3.5rem",
                          height: "3.5rem",
                          scale: playing ? 1 : 1,
                        }
                  }
                >
                  <Image
                    layout="position"
                    className="rounded-lg w-full h-full object-cover"
                    src={
                      img ||
                      (theme === "light"
                        ? "/assets/placeholders/missing_song_light.png"
                        : "/assets/placeholders/missing_song_dark.png")
                    }
                    alt={title || ""}
                    width={336}
                    height={336}
                    draggable={false}
                    unoptimized={true}
                  />
                </motion.div>

                {showLyrics && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                    transition={{ duration: 0.5, type: "spring" }}
                    layout="position"
                  >
                    <span className="font-semibold text-white/90">
                      <TitleOverflowAnimator>{title}</TitleOverflowAnimator>
                    </span>
                    <p className="pl-2.5 text-white/50 text-sm">{artist}</p>
                  </motion.div>
                )}
              </motion.div>
              <div
                className={`w-full ${
                  showLyrics
                    ? "h-[7.5vh] max-sm:h-[5vh]"
                    : "h-[15vh] max-sm:h-[10vh]"
                }`}
              />

              {showLyrics && (
                <div className="h-[55vh]">
                  {/* <AnimatedRichSyncLyrics
                    hasRichSync={true}
                    songTitle={title}
                    artistName={artist}
                    onSeek={(time) => playerRef.current?.seekTo(time)}
                    delay={1}
                    localPlayed={localPlayed}
                    duration={duration}
                  /> */}
                  <LyricsView
                    time={localPlayed}
                    artistName={artist}
                    songTitle={title}
                    duration={duration}
                    playing={playing}
                    seekTo={(time: number) => playerRef.current?.seekTo(time)}
                  />
                </div>
              )}

              <motion.div
                transition={{ duration: 0.5 }}
                layout="position"
                id="controls"
                className={`${
                  showLyrics
                    ? "pt-[3.75rem] max-sm:translate-y-10"
                    : "pt-[0rem]"
                }`}
              >
                <div className="w-full">
                  {!showLyrics && (
                    <motion.div
                      initial={{ opacity: 0, y: -25, filter: "blur(10px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -25, filter: "blur(10px)" }}
                      transition={{ duration: 0.5, type: "spring" }}
                      layout="position"
                      className="pb-4"
                    >
                      <span className="right-[0.625rem] relative font-semibold text-white/90">
                        <TitleOverflowAnimator className="!w-[90vw]">
                          {title}
                        </TitleOverflowAnimator>
                      </span>
                      <p className="text-white/50 text-sm">{artist}</p>
                    </motion.div>
                  )}
                  <div className="items-center flex w-full pb-1">
                    <motion.input
                      whileHover={{ scaleY: 1.5 }}
                      whileTap={{ scaleY: 0.995 }}
                      className="apple-slider seek-slider"
                      type="range"
                      min={0}
                      max={duration}
                      step="any"
                      value={localPlayed}
                      onChange={handleSeekChange}
                      onMouseUp={handleSeekMouseUp}
                      onTouchEnd={handleSeekMouseUp}
                    />
                  </div>
                  <div className="w-full justify-between flex text-white/50">
                    <span>{formatTime(localPlayed)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
                <div className="flex items-center w-full justify-center text-white">
                  <motion.button
                    whileHover={{
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                    }}
                    whileTap={{
                      scale: 0.85,
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    }}
                    transition={{ duration: 0.1, ease: "easeInOut" }}
                    onClick={onPrevious}
                    className="flex flex-col items-center rounded-full p-2"
                  >
                    <IoPlayBack size={40} />
                  </motion.button>
                  <motion.button
                    whileHover={{
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                    }}
                    onClick={handlePlayPause}
                    whileTap={{
                      scale: 0.85,
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    }}
                    transition={{ duration: 0.1, ease: "easeInOut" }}
                    className="flex flex-col items-center rounded-full p-2"
                  >
                    {playing ? <IoPause size={40} /> : <IoPlay size={40} />}
                  </motion.button>
                  <motion.button
                    whileHover={{
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                    }}
                    whileTap={{
                      scale: 0.85,
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                    }}
                    transition={{ duration: 0.1, ease: "easeInOut" }}
                    onClick={onNext}
                    className="flex flex-col items-center rounded-full p-2"
                  >
                    <IoPlayForward size={40} />
                  </motion.button>
                </div>
                {!isStandalone && (
                  <div className="flex items-center gap-2 w-full text-white">
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      transition={{ duration: 0.1, ease: "easeInOut" }}
                      onClick={handleMute}
                    >
                      {muted ? (
                        <IoVolumeMute size={30} />
                      ) : (
                        <IoVolumeMedium size={30} />
                      )}
                    </motion.button>
                    <motion.input
                      whileHover={{ scaleY: 1.5 }}
                      whileTap={{ scaleY: 0.995 }}
                      className="apple-slider volume-slider"
                      type="range"
                      min={0}
                      max={1}
                      step="any"
                      value={volume}
                      onChange={handleVolumeChange}
                    />
                  </div>
                )}
                <div className="w-full flex justify-between py-2 h-10">
                  <motion.button
                    onClick={toggleLyrics}
                    whileTap={{ scale: 0.85 }}
                    transition={{ duration: 0.1, ease: "easeInOut" }}
                  >
                    <LyricIcon
                      className={`transition-all duration-300 ${
                        showLyrics
                          ? "fill-white/75 text-white/75 stroke-white/75"
                          : "fill-white/10 text-white/10 stroke-white/10"
                      }`}
                    />
                  </motion.button>
                  <motion.button
                    onClick={onBack}
                    whileTap={{ scale: 0.85 }}
                    transition={{ duration: 0.1, ease: "easeInOut" }}
                  >
                    <XMark className="fill-white/10 text-white/10 stroke-white/10" />
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </CanvasBackground>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export const Controls = ({
  volume,
  setVolume,
  muted,
  setMuted,
  playing,
  setPlaying,
  duration,
  played,
  onSeek,
  title,
  artist,
  img,
  onNext,
  onPrevious,
  onPlayPause,
  setIsPlaying,
  playerRef,
  onExpand,
}: {
  volume: number;
  setVolume: (volume: number) => void;
  muted: boolean;
  setMuted: (muted: boolean) => void;
  playing: boolean;
  setPlaying: (playing: boolean) => void;
  duration: number;
  played: number;
  onSeek: (time: number) => void;
  title: string;
  artist: string;
  img?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  onPlayPause?: (playing: boolean) => void;
  setIsPlaying?: (isPlaying: boolean) => void; // Add this prop to update the global state
  playerRef: React.RefObject<ReactPlayer>;
  onExpand: () => void;
}) => {
  const handlePlayPause = () => {
    const newPlayingState = !playing;
    setPlaying(newPlayingState);

    if (setIsPlaying) {
      setIsPlaying(newPlayingState); // Update the global isPlaying state
    }

    if (onPlayPause) {
      onPlayPause(newPlayingState);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="navbar-mobile-container">
        <NavbarMiniControls
          img={img || ""}
          title={title}
          playing={playing}
          play={handlePlayPause}
          onNext={onNext}
          onExpand={onExpand}
        />
      </div>
    </div>
  );
};

export const NavbarMiniControls = ({
  img,
  title,
  playing,
  play,
  onNext,
  onExpand,
}: {
  img: string;
  title?: string;
  playing?: boolean;
  play?: () => void;
  onNext?: () => void;
  onExpand?: () => void;
}) => {
  const { theme } = useTheme();
  return (
    <div>
      <div className="navbar-mini-container">
        <div className="w-full h-fit mini-control backdrop-blur-lg p-2 rounded-[14px] flex justify-between bg-background/20 dark:bg-card/75">
          <div onClick={onExpand} className="flex items-center w-full">
            <Image
              className="size-11 rounded-lg"
              src={
                img ||
                (theme === "light"
                  ? "/assets/placeholders/missing_song_light.png"
                  : "/assets/placeholders/missing_song_dark.png")
              }
              alt={title || "Missing Image"}
              width={200}
              height={200}
              unoptimized={true}
              draggable={false}
            />
            <TitleOverflowAnimator>{title}</TitleOverflowAnimator>
          </div>
          <div className="flex items-center pr-2 gap-2">
            <motion.button
              whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
              whileTap={{
                scale: 0.85,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              }}
              transition={{ duration: 0.125, ease: "easeInOut" }}
              onClick={play}
              className="flex flex-col items-center rounded-full p-2"
            >
              {playing ? <FaPause size={26} /> : <IoPlay size={26} />}
            </motion.button>
            <motion.button
              whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
              whileTap={{
                scale: 0.85,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              }}
              transition={{ duration: 0.125, ease: "easeInOut" }}
              onClick={onNext}
              className="flex flex-col items-center rounded-full p-2"
            >
              <IoPlayForward size={26} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};
