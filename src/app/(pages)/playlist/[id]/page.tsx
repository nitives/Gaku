"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AudioPlayerHLS } from "@/components/AudioPlayerHLS";
import { fetchPlaylistM3U8 } from "@/lib/utils";
import Image from "next/image";
import { SafeView, BackButton } from "@/components/mobile/SafeView";
import { IoPlay, IoShuffle } from "react-icons/io5";
import { motion } from "framer-motion";
import { ColorGen } from "@/components/ColorGen";
import { Lossless } from "@/components/Icons/Lossless";
import "../../../../styles/album.css";
import Link from "next/link";
import { useAudio } from "@/context/AudioContext";
import { Skeleton } from "@/components/ui/skeleton";
import { PlaylistSkeleton } from "@/components/skeletons/PlaylistSkeleton";

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
  const [playlist, setPlaylist] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchPlaylist(id);
    }
  }, [id]);

  console.log("playing:", globalCurrentTrack, isPlaying);

  const fetchPlaylist = async (playlistId: string) => {
    const response = await fetch(`/api/playlist/${playlistId}`);
    const data = await response.json();
    console.log("fetchPlaylist | data: ", data);
    setPlaylist(data);
    setGlobalPlaylist(data.tracks); // Ensure this matches the function name in your context
    if (data.permalink_url) {
      console.log("fetchPlaylist to fetchCover -", data.permalink_url);
      fetchCover(data.permalink_url);
    }
  };

  const fetchCover = async (query: string) => {
    const url = encodeURIComponent(query);
    const response = await fetch(`/api/extra/cover/${url}`);
    console.log("fetchCover | response:", response);
    const data = await response.json();
    console.log("fetchCover | Query:", query, "img:", data);
    setHDCover(data.imageUrl);
  };

  const playTrack = async (track: any, index: number) => {
    const url = await fetchPlaylistM3U8(track.permalink_url);
    setGlobalPlaylistUrl(url);
    setGlobalCurrentTrack({ ...track, index });
    setIsPlaying(true);
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

  // const artistNameRemove = (artistName: string, trackTitle: string): string => {
  //   // Create a regular expression to match the artist name and a dash
  //   const regex = new RegExp(`^${artistName}\\s*-\\s*`, "i");
  //   // Replace the artist name and dash with an empty string
  //   return trackTitle.replace(regex, "").trim();
  // };

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


  if (!playlist) return <PlaylistSkeleton />;

  console.log("playlist.tracks:", playlist.tracks);

  return (
    <>
      <SafeView className="z-10 relative">
        {cover && <ColorGen src={cover || playlist?.tracks[0].artwork_url} />}
        <BackButton />

        <div className="flex flex-col items-center justify-center gap-1 bg-blend-overlay pt-4">
          <div className="album-container album-shadow">
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
            />
            <div className="album-border" />
          </div>

          <div className="flex flex-col items-center justify-center">
            <p className="album:title font-bold text-xl">{playlist.title}</p>
            <Link
              href={`/artist/${playlist.user.id}`}
              className="text-[var(--ambient)] text-center cursor-pointer"
            >
              {playlist.user.username}
            </Link>
            <div className="flex text-xs spacer items-center justify-center">
              <p className="font-normal text-sm text-muted-foreground dark:text-muted-foreground/50 text-center w-56 flex items-center justify-center gap-1">
                <span className="whitespace-nowrap">{playlist.genre}</span>·
                <span title={formatDate(playlist.created_at)}>
                  {formatDate(playlist.created_at, "year")}
                </span>
                ·
                <Lossless className="fill-muted-foreground dark:fill-muted-foreground/50 font-normal" />
              </p>
            </div>
          </div>

          <div className="flex w-full justify-between items-start gap-5 pb-5 pt-2">
            <motion.button
              whileTap={{
                scale: 0.95,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              }}
              onClick={() => playTrack(playlist.tracks[0], 0)}
              className="flex justify-center items-center gap-[1px] w-full text-[var(--ambient)] bg-[hsl(var(--foreground)/0.025)] border border-[hsl(var(--foreground)/0.05)] py-3 rounded-2xl cursor-pointer interact-buttons"
            >
              <IoPlay size={20} />
              Play
            </motion.button>
            <motion.button
              whileTap={{
                scale: 0.95,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              }}
              onClick={playNextTrack} // Handle the next button click
              className="flex justify-center items-center gap-[1px] w-full text-[var(--ambient)] bg-[hsl(var(--foreground)/0.025)] border border-[hsl(var(--foreground)/0.05)] py-3 rounded-2xl cursor-pointer interact-buttons"
            >
              <IoShuffle size={20} />
              Shuffle
            </motion.button>
          </div>
        </div>

        <ul className="music-cards">
          {playlist.tracks.map((track: any, index: number) => (
            <li
              key={track.id}
              onClick={() => playTrack(track, index)}
              className="cursor-pointer flex"
            >
              <span>
                <motion.span
                  initial={{ color: "inherit" }} // Initial color (normal track number color)
                  animate={
                    globalCurrentTrack &&
                    globalCurrentTrack.id === track.id &&
                    isPlaying
                      ? { color: "var(--ambient)" } // Transition to accent color when playing
                      : { color: "inherit" } // Normal color when not playing
                  }
                  transition={{ duration: 0.3, ease: "easeInOut" }} // Customize the transition duration as needed
                >
                  {index + 1}
                </motion.span>
              </span>
              {/* {artistNameRemove(playlist.user.username, track.title)} */}
              {track.title}
            </li>
          ))}
        </ul>
      </SafeView>
      <motion.div
        className="min-h-screen min-w-screen opacity-50 flex justify-center absolute items-center z-[1] top-[-35rem]"
        initial={{ opacity: 0 }}
        animate={{ opacity: isPlaying ? 1 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        key="ambient-bg-animation" // key ensures the animation triggers when added
      >
        <div className="ambient-bg" />
      </motion.div>
    </>
  );
}
