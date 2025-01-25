import { Attributes, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LucideFullscreen } from "lucide-react";
import dynamic from "next/dynamic";
import { useAudioStoreNew } from "@/context/AudioContextNew";
import { useThemedPlaceholder } from "@/lib/utils/themedPlaceholder";
import Image from "next/image";
import { CloseButton } from "@/components/player/new/controls/components/CloseButton";
import {
  AppleCover,
  buttonMotionProps,
  DurationSlider,
  ExpandedPlayerControls,
  formatTime,
  LyricButton,
  OptionsButton,
} from "@/components/player/new/controls/Controls";

// Also fixing document not defined error
const AppleLyrics = dynamic(
  () =>
    import("../../../components/player/new/lyrics/AppleLyrics").then(
      (mod) => mod.AppleLyrics
    ),
  {
    ssr: false,
  }
);
const BackgroundRender = dynamic(
  () =>
    import("@applemusic-like-lyrics/react").then((mod) => mod.BackgroundRender),
  {
    ssr: false,
  }
);

const FullScreenButton = () => {
  const setFullscreen = useAudioStoreNew((state) => state.setFullscreen);
  return (
    <motion.button onClick={() => setFullscreen(true)} {...buttonMotionProps}>
      <LucideFullscreen />
    </motion.button>
  );
};

const Screen = () => {
  const {
    isFullscreen,
    setFullscreen,
    currentSong,
    isPlaying,
    setIsPlaying,
    nextSong,
    previousSong,
  } = useAudioStoreNew();
  const PLACEHOLDER_IMAGE = useThemedPlaceholder();

  const currentTime = useAudioStoreNew((state) => state.currentTime ?? 0);
  const duration = useAudioStoreNew((state) => state.duration ?? 0);
  const seek = useAudioStoreNew((state) => state.seek);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    seek(newTime);
  };

  const [lyricsVisible, setLyricsVisible] = useState(false);
  const toggleLyrics = () => setLyricsVisible((prev) => !prev);

  const controlsBaseProps = {
    className:
      "fixed inset-0 flex flex-col bg-black text-white z-[110] standalone:pt-10",
    initial: { opacity: 0, filter: "blur(10px)" },
    animate: { opacity: 1, filter: "blur(0px)" },
    exit: { opacity: 0, filter: "blur(10px)" },
    transition: { duration: 0.3, ease: "easeInOut" },
  };

  return (
    <AnimatePresence>
      {isFullscreen && (
        <motion.div {...controlsBaseProps}>
          <motion.div className="flex justify-start z-20 absolute w-full">
            <CloseButton onClick={() => setFullscreen(false)} />
          </motion.div>
          <motion.div className="flex-1 flex items-center justify-center z-10">
            <motion.span
              layout="preserve-aspect"
              className="justify-center h-full flex-col items-center flex w-full"
            >
              <motion.div
                layout="position"
                layoutId="playerImage"
                className="relative"
              >
                <Image
                  className="rounded-[1rem] blur-md opacity-25 translate-y-1 select-none"
                  src={
                    currentSong?.artwork?.hdUrl ||
                    currentSong?.artwork?.url ||
                    PLACEHOLDER_IMAGE
                  }
                  alt={currentSong?.name || "Missing Image"}
                  width={400}
                  height={400}
                  quality={10}
                  unoptimized={true}
                  draggable={false}
                />
                <span className="absolute inset-0 flex items-center justify-center">
                  <AppleCover
                    isAnimated={Boolean(currentSong?.artwork?.animatedURL)}
                    isDesktop={true}
                    song={currentSong || undefined}
                  />
                </span>
              </motion.div>
              <motion.div
                layout="position"
                className="w-[20rem] flex-col mt-3 flex justify-center items-center"
              >
                <motion.div
                  layout="position"
                  layoutId="playerInfo"
                  className="w-full justify-center items-center flex flex-col"
                >
                  <motion.h2
                    layout="position"
                    layoutId="playerTitle"
                    className="text-lg text-center font-semibold"
                  >
                    {currentSong?.name}
                  </motion.h2>
                  <motion.h2
                    layout="position"
                    layoutId="playerArtist"
                    className="text-sm text-center text-white/75 cursor-pointer hover:underline"
                    onClick={() => {
                      const artistUrl = `/artist/${currentSong?.artist.id}/${currentSong?.artist.id}`;
                      if (
                        window.location.pathname.includes(
                          currentSong?.artist.id.toString() || ""
                        )
                      ) {
                        setFullscreen(false);
                      } else {
                        window.location.href = artistUrl;
                      }
                    }}
                  >
                    {currentSong?.artist.name}
                  </motion.h2>
                </motion.div>
                <motion.div
                  layout="position"
                  layoutId="playerControls"
                  className="flex-col mt-4 flex items-center w-full gap-2"
                >
                  {/* WAS "isDesktop" vvvv */}
                  {true && (
                    <div className="flex w-full items-center gap-2">
                      <span className="text-xs text-white/75 select-none">
                        {formatTime(currentTime)}
                      </span>
                      <DurationSlider
                        duration={duration}
                        currentTime={currentTime}
                        onChange={handleSeekChange}
                      />
                      <span className="text-xs text-white/75 select-none">
                        {formatTime(duration)}
                      </span>
                    </div>
                  )}
                  <div>
                    <ExpandedPlayerControls
                      onPlayPause={() => setIsPlaying(!isPlaying)}
                      playing={isPlaying}
                      onNext={nextSong}
                      onPrev={previousSong}
                    />
                  </div>
                  <div className="flex items-center gap-2 justify-between w-full">
                    <LyricButton
                      active={lyricsVisible}
                      onClick={toggleLyrics}
                    />
                    <OptionsButton onClick={toggleLyrics} />
                  </div>
                </motion.div>
              </motion.div>
            </motion.span>
            {/* WAS "lyricsVisible" vvvv */}
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
            fps={24}
            playing={isPlaying}
            style={{
              position: "fixed",
              width: "100%",
              height: "100%",
              inset: "0",
            }}
            album={currentSong?.artwork.url}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const FullScreen = () => {
  <>
    <Screen key="expanded" />
  </>;
};

FullScreen.Button = FullScreenButton;
FullScreen.Screen = Screen;
export { FullScreen };
