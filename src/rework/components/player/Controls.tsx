import React from "react";
import style from "./Controls.module.css";
import { IoPlay, IoPlayBack, IoPlayForward } from "react-icons/io5";
import { PiPauseFill } from "react-icons/pi";
import { motion } from "framer-motion";
import { useAudioStoreNew } from "@/context/AudioContextNew";

export const Controls = () => {
  const { currentSong, isPlaying, setIsPlaying, nextSong, previousSong } =
    useAudioStoreNew();
  const handlePlayPause = () => {
    if (!currentSong) return;
    setIsPlaying(!isPlaying);
  };
  return (
    <div data-name="Controls Container" className={style.ControlsContainer}>
      <ControlButtons
        playing={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={nextSong}
        onPrev={previousSong}
      />
    </div>
  );
};

const ControlButtons = ({
  playing,
  onPlayPause,
  onNext,
  onPrev,
}: {
  playing: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev?: () => void;
}) => {
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
        <IoPlayBack size={26} />
      </motion.button>
      <motion.button {...buttonMotionProps} onClick={onPlayPause}>
        {playing ? <PiPauseFill size={26} /> : <IoPlay size={26} />}
      </motion.button>
      <motion.button {...buttonMotionProps} onClick={onNext}>
        <IoPlayForward size={26} />
      </motion.button>
    </div>
  );
};
