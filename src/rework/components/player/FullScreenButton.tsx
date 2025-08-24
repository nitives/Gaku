import { Attributes, useState, useEffect } from "react";
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
  VolumeSlider,
} from "@/components/player/new/controls/Controls";
import { showToast } from "@/hooks/useToast";
import Link from "next/link";

// Using dynamic imports with loading strategy to optimize performance
const AppleLyrics = dynamic(
  () =>
    import("../../../components/player/new/lyrics/AppleLyrics").then(
      (mod) => mod.AppleLyrics
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full">
        <span className="text-white/50">Loading lyrics...</span>
      </div>
    ),
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
    setVolume,
    volume,
  } = useAudioStoreNew();
  const PLACEHOLDER_IMAGE = useThemedPlaceholder();

  const currentTime = useAudioStoreNew((state) => state.currentTime ?? 0);
  const duration = useAudioStoreNew((state) => state.duration ?? 0);
  const seek = useAudioStoreNew((state) => state.seek);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    seek(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const [lyricsVisible, setLyricsVisible] = useState(false);
  const toggleLyrics = () => setLyricsVisible((prev) => !prev);

  const optionsButton = () =>
    showToast("warning", "Options not implemented yet");

  // Optimize heavy components when in fullscreen
  useEffect(() => {
    if (isFullscreen) {
      // Pause any intensive animations or calculations in background components
      document.body.classList.add("fullscreen-active");
      // Prevent scrolling when fullscreen is active
      document.body.style.overflow = "hidden";
    } else {
      document.body.classList.remove("fullscreen-active");
      // Restore scrolling when fullscreen is inactive
      document.body.style.overflow = "";
    }

    return () => {
      document.body.classList.remove("fullscreen-active");
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  const controlsBaseProps = {
    className:
      "controlsBase fixed inset-0 flex flex-col bg-black text-white z-[110] standalone:pt-10 !visible !pointer-events-auto",
    initial: { opacity: 0, filter: "blur(10px)" },
    animate: { opacity: 1, filter: "blur(0px)" },
    exit: { opacity: 0, filter: "blur(10px)" },
    transition: { duration: 0.3, ease: "easeInOut" },
  };

  return (
    <AnimatePresence>
      {isFullscreen && (
        <motion.div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            height: "100vh",
            width: "100vw",
          }}
          {...controlsBaseProps}
        >
          <motion.div className="flex justify-start z-20 absolute w-full pointer-events-none">
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
                className="relative max-sm:scale-[0.8] max-sm:translate-x-[-1rem] max-sm:translate-y-[-1rem]"
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
                className="w-[25rem] max-md:w-[20rem] flex-col mt-3 flex justify-center items-center"
              >
                <motion.div
                  layout="position"
                  layoutId="playerInfo"
                  className="flex justify-between items-center w-full"
                >
                  <motion.div className="flex flex-col">
                    <motion.h2
                      layout="position"
                      layoutId="playerTitle"
                      className="text-lg text-left font-semibold"
                    >
                      {currentSong?.name}
                    </motion.h2>
                    <motion.h2
                      layout="position"
                      layoutId="playerArtist"
                      className="text-sm text-left text-white/75 cursor-pointer hover:underline"
                    >
                      <Link
                        href={`/artist/${currentSong?.artist.id}/${currentSong?.artist.id}`}
                        onClick={(e) => {
                          // If we're already on the artist page, don't navigate:
                          setFullscreen(false);
                          if (
                            window.location.pathname.includes(
                              currentSong?.artist.id?.toString() || ""
                            )
                          ) {
                            e.preventDefault(); // Prevent Link's normal routing
                            setFullscreen(false);
                          }
                        }}
                      >
                        {currentSong?.artist.name}
                      </Link>
                    </motion.h2>
                  </motion.div>
                  <motion.div className="flex gap-2">
                    <LyricButton
                      active={lyricsVisible}
                      onClick={toggleLyrics}
                    />
                    <OptionsButton onClick={optionsButton} />
                  </motion.div>
                </motion.div>
                <motion.div
                  layout="position"
                  layoutId="playerControls"
                  className="flex-col mt-4 flex items-center w-full gap-2"
                >
                  <div className="flex w-full items-center gap-2">
                    <span className="text-xs text-white/75 select-none">
                      {formatTime(currentTime)}
                    </span>
                    <DurationSlider
                      duration={duration}
                      currentTime={currentTime}
                      onChange={handleSeekChange}
                    />
                    <span
                      className="text-xs text-white/75 select-none cursor-pointer"
                      onClick={() => {
                        const timeLeftElement =
                          document.getElementById("timeLeft");
                        if (timeLeftElement) {
                          const isShowingTotal =
                            timeLeftElement.dataset.showing === "total";
                          timeLeftElement.dataset.showing = isShowingTotal
                            ? "remaining"
                            : "total";
                          timeLeftElement.textContent = isShowingTotal
                            ? `-${formatTime(duration - currentTime)}`
                            : formatTime(duration);
                        }
                      }}
                    >
                      <span id="timeLeft" data-showing="total">
                        {formatTime(duration)}
                      </span>
                    </span>
                  </div>
                  <div>
                    <ExpandedPlayerControls
                      onPlayPause={() => setIsPlaying(!isPlaying)}
                      playing={isPlaying}
                      onNext={nextSong}
                      onPrev={previousSong}
                    />
                  </div>
                  <div className="flex items-center w-full justify-between">
                    <VolumeSlider
                      onChange={handleVolumeChange}
                      volume={volume}
                    />
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
            fps={240}
            playing={isPlaying}
            style={{
              position: "fixed",
              width: "100%",
              height: "100%",
              inset: "0",
              // zIndex: 1,
            }}
            album={currentSong?.artwork.url}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const FullScreen = () => {
  return (
    <>
      <Screen key="expanded" />
    </>
  );
};

FullScreen.Button = FullScreenButton;
FullScreen.Screen = Screen;
export { FullScreen };
