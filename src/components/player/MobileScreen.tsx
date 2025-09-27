"use client";
import { ChangeEvent, MouseEvent, useEffect, useState } from "react";
import { AnimatePresence, motion, MotionProps } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useAudioStore } from "@/context/AudioContext";
import { showToast } from "@/hooks/useToast";
import { useThemedPlaceholder } from "@/lib/utils/themedPlaceholder";
import {
  AppleCover,
  DurationSlider,
  ExpandedPlayerControls,
  formatTime,
  LyricButton,
  OptionsButton,
} from "@/components/controls/Controls";
import { VibrantText } from "../vibrant-text";

const AppleLyrics = dynamic(
  () => import("../lyrics/AppleLyrics").then((mod) => mod.AppleLyrics),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-40 w-full items-center justify-center text-white/50">
        Loading lyrics...
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

const buttonMotionProps = {
  whileHover: { backgroundColor: "rgba(255, 255, 255, 0.12)" },
  whileTap: {
    scale: 0.92,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  transition: { duration: 0.18, ease: "easeOut" },
} satisfies MotionProps;

export const MobileScreen = () => {
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
  } = useAudioStore();

  const currentTime = useAudioStore((state) => state.currentTime ?? 0);
  const duration = useAudioStore((state) => state.duration ?? 0);
  const seek = useAudioStore((state) => state.seek);
  const PLACEHOLDER_IMAGE = useThemedPlaceholder();

  const [lyricsVisible, setLyricsVisible] = useState(false);

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

  const handleSeekChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    seek(newTime);
  };

  const toggleLyrics = () => setLyricsVisible((prev) => !prev);
  const handleQueueClick = () => showToast("info", "Up Next is coming soon");
  const handleOptionsClick = () =>
    showToast("warning", "Options not implemented yet");

  const artworkSrc =
    currentSong?.artwork?.hdUrl ||
    currentSong?.artwork?.url ||
    PLACEHOLDER_IMAGE;

  const artistPermalink =
    currentSong?.artist?.permalink || String(currentSong?.artist?.id || "");
  const artistId = currentSong?.artist?.id;
  const artistHref = artistId
    ? `/artist/${artistPermalink}/${artistId}`
    : undefined;
  const artistName = currentSong?.artist?.name || "Unknown Artist";
  const coverLayoutId = "mobile-fullscreen-cover";

  const handleArtistClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!artistHref) return;
    setFullscreen(false);
    if (
      typeof window !== "undefined" &&
      artistId &&
      window.location.pathname.includes(String(artistId))
    ) {
      e.preventDefault();
    }
  };

  const controlsBaseProps = {
    className:
      "controlsBase fixed inset-0 flex flex-col bg-black text-white z-[110] max-sm:pt-10 !visible !pointer-events-auto",
    initial: { opacity: 0, filter: "blur(10px)" },
    animate: { opacity: 1, filter: "blur(0px)" },
    exit: { opacity: 0, filter: "blur(10px)" },
    transition: { duration: 0.3, ease: "easeInOut" },
    style: { height: "100vh", backdropFilter: "blur(20px)" },
  } satisfies MotionProps & { className: string };

  return (
    <AnimatePresence>
      {isFullscreen && (
        <motion.div {...controlsBaseProps}>
          <BackgroundRender
            fps={90}
            playing={isPlaying}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
            album={currentSong?.artwork?.url}
          />
          <div
            className="relative z-10 flex h-full flex-col"
            style={{
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.25rem)",
            }}
          >
            <header className="flex items-center justify-between gap-4 px-4 pt-6 pb-4">
              <div className="flex min-w-0 items-center gap-3">
                <motion.button
                  {...buttonMotionProps}
                  className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white"
                  aria-label="Collapse player"
                  onClick={() => setFullscreen(false)}
                >
                  <ChevronDown className="size-6" />
                </motion.button>

                <motion.div
                  layout
                  initial={false}
                  animate={{
                    opacity: lyricsVisible ? 1 : 0,
                    filter: lyricsVisible ? "none" : "blur(10px)",
                    translateX: lyricsVisible ? 0 : 48,
                    marginLeft: lyricsVisible ? 0 : "-48px",
                  }}
                  transition={{ duration: 0.25, ease: [0.4, 0.0, 0.2, 1] }}
                  style={{
                    overflow: "hidden",
                    borderRadius: "0.75rem",
                    // prevent invisible box from catching clicks when collapsed
                    pointerEvents: lyricsVisible ? "auto" : "none",
                  }}
                  className="relative"
                >
                  <AppleCover
                    isAnimated={Boolean(currentSong?.artwork?.animatedURL)}
                    isDesktop={false}
                    song={currentSong || undefined}
                    imageSize={48}
                  />
                </motion.div>
                <motion.div layout className="min-w-0 flex flex-col">
                  <VibrantText
                    tint="rgb(255, 255, 255, 0.75)"
                    className="font-semibold leading-tight"
                  >
                    {currentSong?.name || "Not playing"}
                  </VibrantText>

                  <Link
                    className="text-white/50"
                    href={artistHref || "#"}
                    onClick={handleArtistClick}
                  >
                    <VibrantText className="text-sm">{artistName}</VibrantText>
                  </Link>
                </motion.div>
              </div>

              <div className="flex items-center gap-2">
                <OptionsButton onClick={handleOptionsClick} />
              </div>
            </header>

            <div className="flex flex-col h-[calc(100dvh-130px)]">
              <div
                id="mobile-fullscreen-main"
                style={{
                  maxHeight: "55vh",
                  overflow: "hidden",
                  overscrollBehavior: "none",
                  touchAction: "none",
                }}
                className="flex-[1_65.5%]"
              >
                <div className="flex flex-col size-full justify-around">
                  {!lyricsVisible && (
                    <div
                      id="mobile-fullscreen-artwork"
                      className="grid content-center h-full w-full leading-[0] relative"
                    >
                      <div
                        key="mobile-full-cover"
                        style={{
                          transform: "translate(-50%, -50%)",
                          transformOrigin: "center",
                          left: "50%",
                          top: "50%",
                        }}
                        className="absolute"
                      >
                        <Image
                          className="rounded-[2rem] opacity-25 blur-md select-none pointer-events-none"
                          src={
                            currentSong?.artwork?.hdUrl ||
                            currentSong?.artwork?.url ||
                            PLACEHOLDER_IMAGE
                          }
                          style={{
                            height: "var(--artwork-override-height, auto)",
                            maxHeight:
                              "var(--artwork-override-max-height, none)",
                            maxWidth: "var(--artwork-override-max-width, none)",
                            minHeight: "var(--artwork-override-min-height, 0)",
                            minWidth: "var(--artwork-override-min-width, 0)",
                          }}
                          alt={currentSong?.name || "Missing Image"}
                          width={400}
                          height={400}
                          quality={10}
                          unoptimized={true}
                          draggable={false}
                        />
                        <span className="absolute inset-0 flex items-center justify-center w-full rounded-[2rem] overflow-hidden">
                          <AppleCover
                            isAnimated={Boolean(
                              currentSong?.artwork?.animatedURL
                            )}
                            style={{
                              height: "var(--artwork-override-height, auto)",
                              maxHeight:
                                "var(--artwork-override-max-height, none)",
                              maxWidth:
                                "var(--artwork-override-max-width, none)",
                              minHeight:
                                "var(--artwork-override-min-height, 0)",
                              minWidth: "var(--artwork-override-min-width, 0)",
                              pointerEvents: "none",
                              aspectRatio: "1 / 1",
                            }}
                            isDesktop={true}
                            song={currentSong || undefined}
                          />
                        </span>
                      </div>
                    </div>
                  )}

                  {lyricsVisible && <AppleLyrics />}
                </div>
              </div>
              <div
                id="mobile-fullscreen-controls"
                className="flex-[0_100_calc(34.5%_-_54px)] mx-8"
              >
                <div className="flex flex-col h-full">
                  <div className="min-w-0 flex flex-col">
                    <VibrantText
                      tint="rgb(255, 255, 255, 0.75)"
                      className="font-semibold leading-tight"
                    >
                      {currentSong?.name || "Not playing"}
                    </VibrantText>

                    <Link
                      className="text-white/50"
                      href={artistHref || "#"}
                      onClick={handleArtistClick}
                    >
                      <VibrantText className="text-sm">
                        {artistName}
                      </VibrantText>
                    </Link>
                  </div>
                  <div
                    id="mobile-fullscreen-playback-slider"
                    className="flex w-full flex-col gap-2"
                  >
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration) || "--:--"}</span>
                    </div>
                    <DurationSlider
                      duration={duration}
                      currentTime={currentTime}
                      onChange={handleSeekChange}
                    />
                  </div>
                  <div className="mx-auto my-8 flex items-center justify-center scale-[1]">
                    <ExpandedPlayerControls
                      onPlayPause={() => setIsPlaying(!isPlaying)}
                      playing={isPlaying}
                      onNext={nextSong}
                      onPrev={previousSong}
                    />
                  </div>
                  <div
                    id="mobile-fullscreen-toggle"
                    className="mt-[auto] mx-[2rem] mb-[1rem]"
                  >
                    <div className="flex justify-around mt-[1.5rem] mix-blend-plus-lighter">
                      <LyricButton
                        active={lyricsVisible}
                        onClick={toggleLyrics}
                      />
                      <OptionsButton onClick={handleOptionsClick} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
