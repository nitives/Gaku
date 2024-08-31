"use client";
import { useEffect, useRef, useState } from "react";
import { useLibrary } from "../../hooks/useLibrary";
import {
  Heading,
  Input,
  SafeView,
  SubHeading,
} from "@/components/mobile/SafeView";
import { useAudio } from "@/context/AudioContext";
import {
  IoAddCircle,
  IoCheckmark,
  IoCopyOutline,
  IoCreate,
  IoEyeOffOutline,
  IoEyeOutline,
  IoKey,
  IoPlay,
  IoPencil,
  IoSaveOutline,
  IoTrash,
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
  const {
    library,
    setLibrary,
    createLibrary,
    importLibrary,
    updateLibraryName,
    globalLibraryKey,
  } = useLibrary();

  const { setPlaylistUrl, setCurrentTrack, setIsPlaying } = useAudio();
  const [importKey, setImportKey] = useState("");
  const [isKeyHidden, setIsKeyHidden] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [libraryName, setLibraryName] = useState("");
  const [canNameLibrary, setCanNameLibrary] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (globalLibraryKey) {
      fetchLibraryData(globalLibraryKey);
    }
  }, [globalLibraryKey]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const fetchLibraryData = async (key: string) => {
    try {
      const response = await fetch(`/api/library/sync?key=${key}`);
      if (response.ok) {
        const data = await response.json();
        setLibrary(data);
        setLibraryName(data.name || "");
        setCanNameLibrary(true);
      }
    } catch (error) {
      console.error("Error fetching library data:", error);
    }
  };

  const handleCreateLibrary = () => {
    createLibrary();
    setCanNameLibrary(true);
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
        setCanNameLibrary(true);
        setLibraryName(response.name || "");
        toast.success("Library imported successfully");
      }
    } catch (error) {
      toast.error("Error importing library");
    }
  };

  const handleSaveLibraryName = async () => {
    if (library && libraryName.trim()) {
      try {
        await updateLibraryName(library.key, libraryName.trim());
        toast.success("Library name saved successfully");
      } catch (error) {
        toast.error("Error saving library name");
      }
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
        setGlobalPlaylist(remainingSongs);
        const firstSong = remainingSongs[0];
        console.log("firstSong.id 1:", firstSong.id);

        try {
          console.log("firstSong.id 2:", firstSong.id);
          const response = await fetch(`/api/track/info/${firstSong.id}`);
          const songData = await response.json();
          const playlistUrl = await fetchPlaylistM3U8(songData.permalink_url);

          setCurrentTrack(songData);
          setPlaylistUrl(playlistUrl);
          setIsPlaying(true);

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
    if (globalLibraryKey) {
      try {
        const response = await fetch(
          `/api/library/sync?key=${globalLibraryKey}`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
          toast.success("Library deleted successfully");
          localStorage.removeItem("GAKU_libraryKey");
          setLibrary(null);
          setLibraryName("");
          setCanNameLibrary(false);
        } else {
          toast.error("Error deleting library");
        }
      } catch (error) {
        toast.error("Error deleting library");
        console.error("Error deleting library:", error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveLibraryName();
    }
  };

  return (
    <>
      <SafeView>
        <Heading>
          <div className="flex items-start gap-1">
            Library{" "}
            <span className="px-1 !text-xs mb-0.5 w-fit rounded-sm text-background bg-accent">
              BETA
            </span>
          </div>
        </Heading>
        <SubHeading className="*:text-xs *:leading-5 mb-2">
          <div className="flex py-1 px-2 font-normal bg-destructive/15 border-destructive border rounded-xl">
            <p>
              Some features may not work as intended, the library is an
              experimental feature, just like the rest of this app.
            </p>
          </div>
        </SubHeading>
        <div>
          {!library ? (
            <div>
              <div className="standalone:w-full flex gap-2">
                <button
                  className="min-w-[7.25rem] transition-all duration-150 max-sm:w-full py-1 px-1 standalone:px-2 standalone:py-2 standalone:mb-2 flex justify-center rounded-xl hover:text-foreground text-muted-foreground hover:bg-foreground/5 standalone:bg-foreground/5 items-center gap-2"
                  onClick={handleCreateLibrary}
                >
                  <p>Create Library</p>
                  <IoCreate />
                </button>
                <button
                  className="min-w-[7.25rem] transition-all duration-150 max-sm:w-full py-1 px-1 standalone:px-2 standalone:py-2 standalone:mb-2 flex justify-center rounded-xl hover:text-foreground text-muted-foreground hover:bg-foreground/5 standalone:bg-foreground/5 items-center gap-2"
                  onClick={handleImportLibrary}
                >
                  <p>Import Library</p>
                  <IoAddCircle />
                </button>
              </div>
              <div>
                <Input
                  type="text"
                  value={importKey}
                  onChange={(e) => setImportKey(e.target.value)}
                  placeholder="Enter library key"
                  icon={<IoKey className="text-muted-foreground" />}
                />
              </div>
            </div>
          ) : (
            <div>
              {canNameLibrary && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    {isEditing ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={libraryName}
                        onChange={(e) => setLibraryName(e.target.value)}
                        onBlur={handleSaveLibraryName}
                        onKeyDown={handleKeyDown}
                        className="bg-transparent border-none focus:outline-none text-2xl font-bold"
                        autoFocus
                      />
                    ) : (
                      <SubHeading onClick={() => setIsEditing(true)}>
                        {libraryName || "Untitled Library"}
                      </SubHeading>
                    )}
                    {/* <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <IoPencil size={16} />
                    </button> */}
                  </div>
                </>
              )}
              <button
                className="min-w-[7.25rem] transition-all duration-150 max-sm:w-full py-1 px-1 mb-1 flex justify-center rounded-xl hover:text-foreground text-muted-foreground hover:bg-foreground/5 bg-foreground/5 items-center gap-2"
                onClick={handlePlayAll}
              >
                <>
                  <p>Play All</p>
                  <IoPlay />
                </>
              </button>
              <div className="grid gap-2">
                <div className="flex gap-1 w-full">
                  <button
                    className="min-w-[7.25rem] transition-all duration-150 max-sm:w-full max-sm:justify-center py-1 px-2 flex justify-end rounded-xl hover:text-foreground text-muted-foreground hover:bg-foreground/5 bg-foreground/5 items-center gap-2"
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
                    className="min-w-[7.25rem] transition-all duration-150 max-sm:w-full max-sm:justify-center py-1 px-2 flex justify-end rounded-xl hover:text-foreground text-muted-foreground hover:bg-foreground/5 bg-foreground/5 items-center gap-2"
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
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="min-w-[7.25rem] transition-all duration-150 bg-destructive hover:bg-destructive/90 text-background dark:text-foreground hover:text-foreground standalone:w-full py-1 px-1 standalone:px-2 standalone:py-2 standalone:mb-2 flex justify-center rounded-xl items-center gap-2">
                      <p>Delete Library</p>
                      <IoTrash />
                    </button>
                    {/* <Button
                        className="hover:text-foreground rounded-xl"
                        variant="destructive"
                      >
                        Delete Library
                      </Button> */}
                  </AlertDialogTrigger>
                  <AlertDialogContent className="!rounded-2xl max-md:scale-90">
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
                      <AlertDialogCancel className="transition-all duration-150 hover:text-foreground hover:bg-foreground/5 rounded-xl">
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
