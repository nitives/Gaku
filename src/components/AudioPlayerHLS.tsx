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
} from "react-icons/io5";
import { FaPause } from "react-icons/fa6";
import Image from "next/image";
import { motion } from "framer-motion";
import { TitleOverflowAnimator } from "./mobile/TitleOverflowAnimator";
import { useAudio } from "@/context/AudioContext";
import { AnimatedLyrics } from "./AnimatedLyrics";

export const AudioPlayerHLS = ({
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
  const { currentTrack, playlistUrl, isPlaying, setIsPlaying } = useAudio();
  const [volume, setVolume] = useState(initialVolume);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [duration, setDuration] = useState(0);
  const [played, setPlayed] = useState(0);
  const playerRef = useRef<ReactPlayer>(null);

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
            playbackRate: playerRef.current.getInternalPlayer().playbackRate,
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
        title={title}
        img={img}
        onNext={onNext}
        onPrevious={handlePrevious}
        onPlayPause={onPlayPause}
        setIsPlaying={setIsPlaying} // Pass the global state updater to Controls
        playerRef={playerRef} // Pass the playerRef to Controls
      />
    </>
  );
};

const Controls = ({
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
  img,
  onNext,
  onPrevious,
  onPlayPause,
  setIsPlaying, // Add this prop to update the global state
  playerRef, // Add the playerRef prop
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
  title?: string;
  img?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  onPlayPause?: (playing: boolean) => void;
  setIsPlaying?: (isPlaying: boolean) => void; // Add this prop to update the global state
  playerRef: React.RefObject<ReactPlayer>; // Accept the playerRef prop
}) => {
  const [localPlayed, setLocalPlayed] = useState(played * duration);

  useEffect(() => {
    setLocalPlayed(played * duration);
  }, [played, duration]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleMute = () => {
    setMuted(!muted);
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

  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
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

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="navbar-mobile-container">
        <NavbarMiniControls
          play={handlePlayPause}
          playing={playing}
          title={title}
          img={img}
          onNext={onNext}
        />
      </div>

      <div className="controls">
        <div className="w-full">
          <div className="items-center flex w-full">
            <input
              className="w-full"
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
          <div className="w-full justify-between flex">
            <span>{formatTime(localPlayed)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center w-full justify-center">
          <motion.button
            whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
            whileTap={{
              scale: 0.85,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            }}
            transition={{ duration: 0.125, ease: "easeInOut" }}
            onClick={onPrevious}
            className="flex flex-col items-center rounded-full p-2"
          >
            <IoPlayBack size={40} />
          </motion.button>
          <motion.button
            onClick={handlePlayPause}
            whileTap={{ scale: 0.85 }}
            transition={{ duration: 0.1, ease: "easeInOut" }}
          >
            {playing ? <IoPause size={40} /> : <IoPlay size={40} />}
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
            <IoPlayForward size={40} />
          </motion.button>
        </div>
        {!isStandalone && (
          <div className="flex items-center gap-2 w-full p">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={handleVolumeChange}
              className="w-full"
            />
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
          </div>
        )}
      </div>
      <AnimatedLyrics
        onSeek={(time) => playerRef.current?.seekTo(time)}
        delay={1}
        localPlayed={localPlayed}
      />
    </div>
  );
};

export const NavbarMiniControls = ({
  img,
  title,
  playing,
  play,
  onNext,
}: {
  img: string;
  title?: string;
  playing?: boolean;
  play?: () => void;
  onNext?: () => void;
}) => {
  return (
    <div className="navbar-mini-container">
      <div className="w-full h-fit mini-control backdrop-blur-md p-2 rounded-[14px] flex justify-between bg-foreground">
        <div className="flex items-center">
          <Image
            className="size-11 rounded-lg"
            src={img}
            alt={title}
            width={200}
            height={200}
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
  );
};
