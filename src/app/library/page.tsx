"use client";
import { useState } from "react";
import { useLibrary } from "../../hooks/useLibrary";
import { Heading, SafeView, SubHeading } from "@/components/mobile/SafeView";
import { useAudio } from "@/context/AudioContext";
import {
  IoCheckmark,
  IoCopyOutline,
  IoEyeOffOutline,
  IoEyeOutline,
  IoPlay,
} from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { LibraryCard } from "@/components/mobile/LibraryCard";
import { fetchPlaylistM3U8 } from "@/lib/utils";

export default function Library() {
  const {
    currentTrack: globalCurrentTrack,
    setCurrentTrack: setGlobalCurrentTrack,
    playlistUrl: globalPlaylistUrl,
    setPlaylistUrl: setGlobalPlaylistUrl,
    setGlobalPlaylist,
    setHDCover,
  } = useAudio();
  const { library, createLibrary, importLibrary } = useLibrary();
  const { setPlaylistUrl, setCurrentTrack, setIsPlaying } = useAudio();
  const [importKey, setImportKey] = useState("");
  const [isKeyHidden, setIsKeyHidden] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  const handleCreateLibrary = () => {
    createLibrary();
    toast.success("Library created and synced");
  };

  const handleImportLibrary = async () => {
    if (!importKey.trim()) {
      toast.error("Please enter a library key.");
      return;
    }

    try {
      const response = await importLibrary(importKey);
      if (response.error) {
        toast.error("Library key not found.");
      } else {
        setImportKey("");
        toast.success("Library imported successfully");
      }
    } catch (error) {
      toast.error("Error importing library");
    }
  };

  const handlePlayAll = () => {
    if (library && library.songs.length > 0) {
      const [firstSong] = library.songs;
      handlePlaySong(firstSong.id);
    }
  };

  const handlePlaySong = async (songId: string) => {
    const songIndex = library?.songs.findIndex((song) => song.id === songId);
    if (songIndex !== undefined && songIndex >= 0) {
      const remainingSongs = library?.songs.slice(songIndex);
      if (remainingSongs) {
        setGlobalPlaylist(remainingSongs); // Set the remaining songs as the global playlist
        const firstSong = remainingSongs[0];
        console.log("firstSong.id 1:", firstSong.id);

        try {
          // Fetch the playlist URL using the permalink_url of the first song

          // Fetch the song data from API
          console.log("firstSong.id 2:", firstSong.id);
          const response = await fetch(`/api/track/info/${firstSong.id}`);
          const songData = await response.json();
          const playlistUrl = await fetchPlaylistM3U8(songData.permalink_url);

          // Set the current track and the playlist URL
          setCurrentTrack(songData);
          setPlaylistUrl(playlistUrl);
          setIsPlaying(true);

          // Optionally, fetch and set the cover image if needed
          if (songData.permalink_url) {
            fetchCover(songData.permalink_url);
          }

          console.log("playlistUrl:", playlistUrl);
        } catch (error) {
          console.error("Error fetching song or playlist data:", error);
        }
      }
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

  const toggleKeyVisibility = () => {
    setIsKeyHidden(!isKeyHidden);
  };

  const copyKeyToClipboard = () => {
    if (library) {
      navigator.clipboard.writeText(library.key);
      setIsCopied(true);
      toast.success("Library key copied to clipboard");
      setTimeout(() => setIsCopied(false), 1000);
    }
  };

  const handleDeleteLibrary = async () => {
    if (library) {
      try {
        const response = await fetch(`/api/library/sync?key=${library.key}`, {
          method: "DELETE",
        });
        if (response.ok) {
          toast.success("Library deleted successfully");
          localStorage.removeItem("userLibrary");
        } else {
          toast.error("Error deleting library");
        }
      } catch (error) {
        toast.error("Error deleting library");
        console.error("Error deleting library:", error);
      }
    }
  };

  return (
    <>
      <SafeView>
        <Heading>Library (BETA)</Heading>
        <SubHeading>
          NOTICE: Queue / Next song doesn&apos;t work currently
        </SubHeading>
        <div>
          {!library ? (
            <div>
              <button onClick={handleCreateLibrary}>Create Library</button>
              <div>
                <input
                  type="text"
                  value={importKey}
                  onChange={(e) => setImportKey(e.target.value)}
                  placeholder="Enter library key"
                />
                <button onClick={handleImportLibrary}>Import Library</button>
              </div>
            </div>
          ) : (
            <div>
              <button
                className="min-w-[7.25rem] py-1 px-1 flex justify-center rounded-xl hover:text-foreground text-muted-foreground hover:bg-foreground/5 bg-transparent items-center gap-2"
                onClick={handlePlayAll}
              >
                <>
                  <p>Play All</p>
                  <IoPlay />
                </>
              </button>
              <div className="grid gap-2">
                <div className="flex gap-1">
                  <button
                    className="min-w-[7.25rem] py-1 px-2 flex justify-end rounded-xl hover:text-foreground text-muted-foreground hover:bg-foreground/5 bg-transparent items-center gap-2"
                    onClick={toggleKeyVisibility}
                  >
                    {isKeyHidden ? (
                      <>
                        <p>Show Key</p>
                        <IoEyeOffOutline />
                      </>
                    ) : (
                      <>
                        <p>Hide Key</p>
                        <IoEyeOutline />
                      </>
                    )}
                  </button>
                  <button
                    className="min-w-[7.25rem] py-1 px-2 flex justify-end rounded-xl hover:text-foreground text-muted-foreground hover:bg-foreground/5 bg-transparent items-center gap-2"
                    onClick={copyKeyToClipboard}
                  >
                    <p>Copy Key</p>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={isCopied ? "check" : "copy"}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                      >
                        {isCopied ? <IoCheckmark /> : <IoCopyOutline />}
                      </motion.div>
                    </AnimatePresence>
                  </button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="hover:text-foreground rounded-xl"
                        variant="destructive"
                      >
                        Delete Library
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="!rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your library and remove your data from our
                          servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="hover:text-foreground hover:bg-foreground/5 rounded-xl">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="rounded-xl"
                          onClick={handleDeleteLibrary}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <div className="flex gap-2">
                  <div className="bg-foreground dark:bg-foreground/10 text-green-500 w-fit py-2 px-3 rounded-xl selection:bg-green-500 selection:text-black">
                    <p className="">
                      Library Key |{" "}
                      {isKeyHidden ? (
                        <span className="select-all font-mono">
                          ********************************
                        </span>
                      ) : (
                        <span className="select-all font-mono">
                          {library.key}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="py-4">
                <ul className="flex flex-col gap-1">
                  {library.songs.map((song) => (
                    <LibraryCard
                      key={song.id}
                      songId={song.id}
                      onClick={() => handlePlaySong(song.id)}
                    />
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </SafeView>
    </>
  );
}
