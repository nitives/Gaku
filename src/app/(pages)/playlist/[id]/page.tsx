"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { AudioPlayerHLS } from "@/components/AudioPlayerHLS";
import { fetchPlaylistM3U8 } from "@/lib/utils";
import Image from "next/image";
import { SafeView, BackButton } from "@/components/mobile/SafeView";
import { IoHeart, IoHeartOutline, IoPlay, IoShuffle } from "react-icons/io5";
import { AnimatePresence, motion } from "framer-motion";
import { ColorGen } from "@/components/ColorGen";
import { Lossless } from "@/components/Icons/Lossless";
import "../../../../styles/album.css";
import Link from "next/link";
import { useAudio } from "@/context/AudioContext";
import { PlaylistSkeleton } from "@/components/skeletons/PlaylistSkeleton";
import { useLibrary } from "@/hooks/useLibrary";
import { PausedIcon, PlayingIcon } from "@/components/Icons/PlayingIcon";
import AnimatedCover, { AnimatedCoverFull } from "@/components/AnimatedCover";
import { useMediaQuery } from "@/hooks/use-media-query";

export default function PlaylistPage() {
  const {
    currentTrack: globalCurrentTrack,
    setCurrentTrack: setGlobalCurrentTrack,
    playlistUrl: globalPlaylistUrl,
    setPlaylistUrl: setGlobalPlaylistUrl,
    isPlaying,
    setIsPlaying,
    cover,
    setHDCover,
    setGlobalPlaylist, // Ensure this is imported from the context
  } = useAudio();

  const params = useParams();
  const id = params?.id as string;
  const pRef = useRef<HTMLParagraphElement>(null);
  const [playlist, setPlaylist] = useState<any>(null);
  const { addSong, removeSong, isSongInLibrary } = useLibrary();
  const [apple, setAppleData] = useState<any>(null);
  const [animated, setAnimatedVideo] = useState(false);
  const [albumCover, setAlbumCover] = useState<string | null>(null);

  const handleLikeToggle = (track: any) => {
    const songId = `${track.title}-${playlist.user.username}`;
    if (isSongInLibrary(songId)) {
      removeSong(songId);
    } else {
      addSong({
        id: songId,
        title: track.title,
        artist: playlist.user.username,
      });
    }
  };

  useEffect(() => {
    if (id) {
      fetchPlaylist(id);
    }
  }, [id]);

  useEffect(() => {
    if (apple?.data[0]?.attributes?.editorialVideo) {
      setAnimatedVideo(apple.data[0].attributes.editorialVideo);
    } else {
      setAnimatedVideo(false);
    }
  }, [apple]);

  console.log("playing:", globalCurrentTrack, isPlaying);
  console.log("playlist:", playlist);
  const isDesktop = useMediaQuery("(min-width: 484px)");

  const fetchPlaylist = async (playlistID: string) => {
    const response = await fetch(`/api/playlist/${playlistID}`);
    const data = await response.json();
    console.log("fetchPlaylist | data: ", data);
    setPlaylist(data);
    setGlobalPlaylist(data.tracks); // Ensure this matches the function name in your context
    if (data.permalink_url) {
      console.log("fetchPlaylist to fetchCover -", data.permalink_url);
      fetchCover(data.permalink_url);
      fetchAppleKitData(data.title);
    }
  };

  const fetchCover = async (query: string) => {
    const url = encodeURIComponent(query);
    const response = await fetch(`/api/extra/cover/${url}`);
    console.log("fetchCover | response:", response);
    const data = await response.json();
    console.log("fetchCover | Query:", query, "img:", data);
    setAlbumCover(data.imageUrl); // Set album cover for currently viewed album
    console.log("fetchCover | img:", data.imageUrl);
  };

  const playTrack = async (track: any, index: number) => {
    const url = await fetchPlaylistM3U8(track.permalink_url);
    setGlobalPlaylistUrl(url);
    setGlobalCurrentTrack({ ...track, index });
    setHDCover(track.artwork_url || track.user.avatar_url); // Set the playing track's cover separately
    setIsPlaying(true);
  };

  const shufflePlaylist = async () => {
    if (playlist && playlist.tracks.length > 0) {
      const shuffledTracks = [...playlist.tracks].sort(
        () => Math.random() - 0.5
      );
      setGlobalPlaylist(shuffledTracks);

      const firstTrack = shuffledTracks[0];
      const url = await fetchPlaylistM3U8(firstTrack.permalink_url);

      setGlobalPlaylistUrl(url);
      setGlobalCurrentTrack({ ...firstTrack, index: 0 });
      setIsPlaying(true);
    }
  };

  const fetchAppleKitData = async (songTitle: string) => {
    try {
      console.log("fetchAppleKitData | songTitle:", songTitle);
      const response = await fetch(`/api/apple/song/${songTitle}`);
      const data = await response.json();
      setAppleData(data);
    } catch (error) {
      console.error("Error fetching Apple Music data:", error);
    }
  };

  const playNextTrack = () => {
    if (
      globalCurrentTrack &&
      globalCurrentTrack.index < playlist.tracks.length - 1
    ) {
      playTrack(
        playlist.tracks[globalCurrentTrack.index + 1],
        globalCurrentTrack.index + 1
      );
    }
  };

  const playPreviousTrack = () => {
    if (globalCurrentTrack && globalCurrentTrack.index > 0) {
      playTrack(
        playlist.tracks[globalCurrentTrack.index - 1],
        globalCurrentTrack.index - 1
      );
    }
  };

  const artistNameRemove = (artistName: string, trackTitle: string): string => {
    // Create a regular expression to match the artist name and a dash
    const regex = new RegExp(`^${artistName}\\s*-\\s*`, "i");
    // Check if the artist name is in the title
    if (regex.test(trackTitle)) {
      // Replace the artist name and dash with an empty string
      return trackTitle.replace(regex, "").trim();
    } else {
      // If the artist name is not in the title, return the original title
      return trackTitle;
    }
  };

  function formatDate(dateString: string | number | Date, format = "full") {
    const date = new Date(dateString);
    if (format === "year") {
      return date.getFullYear().toString();
    }
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  }

  const setPageTitle = () => {
    const title = globalCurrentTrack?.title
      ? `${globalCurrentTrack.title}`
      : "Gaku";
    document.title = title;
  };

  useEffect(() => {
    setPageTitle();
  }, [globalCurrentTrack?.title]);

  useEffect(() => {
    const bgColor =
      apple?.data[0]?.attributes?.editorialVideo?.motionDetailSquare
        ?.previewFrame?.bgColor;
    if (bgColor) {
      document.documentElement.style.setProperty(
        "--apple-animated-bg-color",
        `#${bgColor}`
      );
    }
  }, [animated]);

  useEffect(() => {
    if (pRef.current) {
      const pElement = pRef.current;
      const computedStyle = window.getComputedStyle(pElement);
      const lineHeight = parseFloat(computedStyle.lineHeight);
      const height = pElement.offsetHeight;
      const numberOfLines = Math.ceil(height / lineHeight);
      const getLineHeightOffset = (lines: any) => {
        switch (lines) {
          case 1:
            return "20px";
          case 2:
            return "0px";
          case 3:
            return "-20px";
          case 4:
            return "40px";
          default:
            return "0px";
        }
      };
      const lineHeightOffset = getLineHeightOffset(numberOfLines);
      console.log(
        "numberOfLines:",
        numberOfLines,
        "lineHeightOffset:",
        lineHeightOffset
      );
      document.documentElement.style.setProperty(
        "--line-height-offset-animated-cover",
        lineHeightOffset
      );
    }
  }, [apple, animated, isDesktop]);

  if (!playlist) return <PlaylistSkeleton />;

  console.log("playlist.tracks:", playlist.tracks);

  if (apple?.data) {
    console.log("MusicKit Data:", apple);
    if (apple?.data[0]?.attributes?.editorialVideo) {
      console.log("MusicKit Attributes:", apple);
      console.log(
        "MusicKit | editorialVideo:",
        apple?.data[0]?.attributes?.editorialVideo?.motionDetailSquare
      );
      console.log(
        "MusicKit | editorialVideo.bgColor:",
        apple?.data[0].attributes?.editorialVideo?.motionDetailSquare
          .previewFrame.bgColor
      );
    } else {
      console.log("MusicKit | No editorialVideo:", apple);
    }
  } else {
    console.log("No MusicKit Data");
    console.log("animated:", animated);
  }

  // const animated = apple?.data[0]?.attributes?.editorialVideo;

  return (
    <>
      <SafeView backButton className="z-10 relative !pt-0 !px-0">
        {cover && <ColorGen src={cover || playlist?.tracks[0].artwork_url} />}
        <div className="flex flex-col items-center justify-center gap-1 bg-blend-overlay pt-4 max-sm:pt-1">
          {animated ? (
            <>
              {!isDesktop ? (
                <>
                  <AnimatedCoverFull
                    hlsUrl={
                      apple.data[0].attributes.editorialVideo.motionDetailSquare
                        .video
                    }
                  />
                </>
              ) : (
                <>
                  <div className="album-container album-shadow">
                    <div className="rounded-[16px] overflow-hidden">
                      <AnimatedCover
                        hlsUrl={
                          apple.data[0].attributes.editorialVideo
                            .motionDetailSquare.video
                        }
                      />
                    </div>
                    <div className="album-border" />
                  </div>
                </>
              )}

              {/* <AnimatedCoverFull
                hlsUrl={
                  apple.data[0].attributes.editorialVideo.motionDetailSquare
                    .video
                }
              /> */}
              {/* <div className="album-container opacity-0 album-shadow">
                <Image
                  src={
                    cover ||
                    playlist?.tracks[0].artwork_url ||
                    globalCurrentTrack?.artwork_url ||
                    ""
                  }
                  alt={`${playlist.title} Album Cover`}
                  title={`${playlist.title} Album Cover`}
                  width={300}
                  height={300}
                  className="album-cover-img"
                  draggable={false}
                  unoptimized={true}
                />

                <div className="album-border" />
              </div> */}
            </>
          ) : (
            <div className="album-container album-shadow">
              <Image
                src={
                  albumCover ||
                  playlist?.tracks[0].artwork_url ||
                  "/assets/placeeholders/missing_song_dark.png"
                }
                alt={`${playlist.title} Album Cover`}
                title={`${playlist.title} Album Cover`}
                width={300}
                height={300}
                className="album-cover-img"
                draggable={false}
                unoptimized={true}
              />

              <div className="album-border" />
            </div>
          )}
          <div className="px-5 w-full">
            <div className="flex flex-col items-center justify-center">
              <p className="album:title font-medium text-xl">
                {playlist.title}
              </p>
              <Link
                href={`/artist/${playlist.user.id}/${playlist.user.username
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
                className={`${
                  animated && !isDesktop
                    ? "text-white/90"
                    : "text-[var(--ambient)]"
                }  transition-colors duration-300 text-center cursor-pointer text-xl`}
              >
                {playlist.user.username}
              </Link>
              <div className="flex flex-col text-xs items-center justify-center mt-2 font-medium">
                <p
                  className={` ${
                    animated && !isDesktop
                      ? "text-white/75"
                      : "text-muted-foreground dark:text-muted-foreground/50"
                  } text-[0.875rem] text-center w-56 flex items-center justify-center gap-1`}
                >
                  {animated && (
                    <>
                      <span className="whitespace-nowrap">
                        {apple?.data[0]?.attributes?.genreNames?.[0] ??
                          playlist.genre}
                      </span>
                      ·
                    </>
                  )}
                  <span title={formatDate(playlist.created_at)}>
                    {formatDate(playlist.created_at, "year")}
                  </span>

                  {apple?.data[0]?.attributes?.audioTraits[0] ===
                    "lossless" && (
                    <>
                      ·
                      <Lossless
                        className={`${
                          animated && !isDesktop
                            ? "fill-white/75"
                            : "fill-muted-foreground dark:fill-muted-foreground/50"
                        }`}
                      />
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="pb-5 pt-4 w-full">
              <div className="flex justify-between items-start gap-5">
                <motion.button
                  whileTap={{
                    scale: 0.95,
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  }}
                  onClick={() => playTrack(playlist.tracks[0], 0)}
                  className={`flex justify-center items-center gap-[1px] w-full transition-colors duration-300 ${
                    animated && !isDesktop
                      ? "bg-white/20 backdrop-blur-md text-white"
                      : "bg-[hsl(var(--foreground)/0.025)] border border-[hsl(var(--foreground)/0.05)] text-[var(--ambient)]"
                  } py-3.5 rounded-2xl cursor-pointer interact-buttons`}
                >
                  <IoPlay size={20} />
                  Play
                </motion.button>
                <motion.button
                  whileTap={{
                    scale: 0.95,
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  }}
                  onClick={shufflePlaylist} // Handle the next button click
                  className={`flex justify-center items-center gap-[1px] w-full transition-colors duration-300 ${
                    animated && !isDesktop
                      ? "bg-white/20 backdrop-blur-md text-white"
                      : "bg-[hsl(var(--foreground)/0.025)] border border-[hsl(var(--foreground)/0.05)] text-[var(--ambient)]"
                  } py-3.5 rounded-2xl cursor-pointer interact-buttons`}
                >
                  <IoShuffle size={20} />
                  Shuffle
                </motion.button>
              </div>
              <AnimatePresence>
                {animated ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full justify-center flex pt-3"
                  >
                    {apple?.data[0]?.attributes?.editorialNotes?.short ? (
                      <p
                        ref={pRef}
                        className={`${
                          animated && !isDesktop
                            ? "text-white/55"
                            : "text-muted-foreground dark:text-muted-foreground/50"
                        } text-sm font-[450] flex items-center justify-center`}
                      >
                        {apple?.data[0]?.attributes?.editorialNotes?.short}
                      </p>
                    ) : null}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          <ul className="music-cards w-full">
            {playlist.tracks.map((track: any, index: number) => (
              <li
                key={track.id}
                className="cursor-pointer flex items-center justify-between"
              >
                <div
                  onClick={() => playTrack(track, index)}
                  className="flex items-center"
                >
                  {globalCurrentTrack && globalCurrentTrack.id === track.id ? (
                    isPlaying ? (
                      <PlayingIcon className="" size={18} />
                    ) : (
                      <PausedIcon
                        className="color-[var(--ambient)] transition-all duration-300"
                        size={18}
                      />
                    )
                  ) : (
                    <span>{index + 1}</span>
                  )}
                  {artistNameRemove(playlist.user.username, track.title)}
                </div>
                <button
                  onClick={() => handleLikeToggle(track)}
                  className="ml-2"
                >
                  {isSongInLibrary(
                    `${track.title}-${playlist.user.username}`
                  ) ? (
                    <IoHeart className="scale-y-[.95] text-red-500" size={24} />
                  ) : (
                    <IoHeartOutline
                      className="scale-y-[.95] text-muted-foreground/30"
                      size={24}
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </SafeView>
      {/* <motion.div
        className="min-h-screen min-w-screen opacity-50 flex justify-center absolute items-center z-[1] top-[-35rem]"
        initial={{ opacity: 0 }}
        animate={{ opacity: isPlaying ? 1 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        key="ambient-bg-animation" // key ensures the animation triggers when added
      >
        <div className="ambient-bg" />
      </motion.div> */}
    </>
  );
}
