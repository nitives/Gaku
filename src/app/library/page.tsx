"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useLibrary } from "@/hooks/useLibrary";
import {
  Heading,
  Input,
  SafeView,
  SubHeading,
} from "@/components/mobile/SafeView";
import useAudioStore from "@/context/AudioContext";
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
  IoEllipsisHorizontal,
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
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import toast from "react-hot-toast";
import { LibraryCard } from "@/components/mobile/LibraryCard";
import { fetchPlaylistM3U8, fetchUserData } from "@/lib/utils";

export default function Library() {
  const {
    setGlobalPlaylist,
    setHDCover,
    setPlaylistUrl,
    setCurrentTrack,
    setIsPlaying,
    currentTrack,
  } = useAudioStore();
  const {
    library,
    setLibrary,
    createLibrary,
    importLibrary,
    updateLibraryName,
    globalLibraryKey,
  } = useLibrary();
  const [importKey, setImportKey] = useState("");
  const [isKeyHidden, setIsKeyHidden] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [libraryName, setLibraryName] = useState("");
  const [canNameLibrary, setCanNameLibrary] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState(null);

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

  useEffect(() => {
    if (currentTrack) {
      setPlayingId(currentTrack.id);
    }
  }, [currentTrack]);

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

  const showToast = (type: "success" | "error" | "warning") => {
    switch (type) {
      case "success":
        toast.success("Added to library");
        break;
      case "error":
        toast.error("This is an error message!");
        break;
      case "warning":
        toast("This is a warning message!", { icon: "⚠️" });
        break;
      default:
        break;
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
    if (library) {
      const nameToSave = libraryName.trim() || "My Library";
      try {
        await updateLibraryName(library.key, nameToSave);
        setLibraryName(nameToSave);
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

  const handlePlaySong = useCallback(
    async (songId: string) => {
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
    },
    [library, setGlobalPlaylist, setCurrentTrack, setPlaylistUrl, setIsPlaying]
  );

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
      setIsEditing(false);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  const handleFetchUserData = async () => {
    if (username) {
      const data = await fetchUserData(username);
      setUserData(data);
    }
  };

  const DrawerDialog = ({
    children,
    title,
    description,
  }: {
    children: React.ReactNode;
    title: string;
    description: string;
  }) => {
    const isDesktop = useMediaQuery("(min-width: 768px)");

    const content = library ? (
      <>
        <div className="flex gap-1 w-full">
          <button
            data-autofocus="false"
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
            data-autofocus="false"
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
            <button
              data-autofocus="false"
              className="min-w-[7.25rem] transition-all duration-150 bg-destructive hover:bg-destructive/90 text-background dark:text-foreground hover:text-foreground standalone:w-full py-1 px-1 standalone:px-2 standalone:py-2 standalone:mb-2 flex justify-center rounded-xl items-center gap-2"
            >
              <p>Delete Library</p>
              <IoTrash />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="!rounded-2xl max-md:scale-90">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                library and remove your data from our servers.
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
          <div className="bg-foreground dark:bg-foreground/10 text-green-500 w-full py-2 px-3 rounded-xl selection:bg-green-500 selection:text-black">
            <p className="">
              Library Key |{" "}
              {isKeyHidden ? (
                <span className="select-all font-mono">
                  ********************************
                </span>
              ) : (
                <span className="select-all font-mono">{library.key}</span>
              )}
            </p>
          </div>
        </div>
      </>
    ) : (
      <div className="flex flex-col items-center justify-center p-4">
        <p className="text-lg font-semibold mb-4">Create a library first</p>
        <button
          data-autofocus="false"
          className="min-w-[7.25rem] transition-all duration-150 py-2 px-4 flex justify-center rounded-xl text-foreground bg-foreground/10 hover:bg-foreground/20 items-center gap-2"
          onClick={handleCreateLibrary}
        >
          <p>Create Library</p>
          <IoCreate />
        </button>
      </div>
    );

    if (isDesktop) {
      return (
        <Dialog>
          <DialogTrigger asChild>{children}</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            {content}
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Drawer>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  };

  // Extracting the icon component to prevent re-creation on every render
  const keyIcon = <IoKey className="text-muted-foreground" />;
  const playAllButton = (
    <button
      className="min-w-fit transition-all duration-150 max-sm:w-full max-sm:justify-center py-1 px-2 flex justify-center rounded-xl hover:text-foreground text-muted-foreground hover:bg-foreground/5 bg-foreground/5 items-center gap-2"
      onClick={handlePlayAll}
    >
      <>
        <p>Play All</p>
        <IoPlay />
      </>
    </button>
  );

  // Memoizing the onChange handler for the Input component
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setImportKey(e.target.value);
    },
    []
  );

  return (
    <>
      <SafeView className="!px-0">
        <Heading className="px-5">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-1 w-full">
              Library{" "}
              <span className="px-1 !text-xs mb-0.5 w-fit rounded-sm text-background bg-accent">
                BETA
              </span>
            </div>
            <DrawerDialog title="Library Options" description="">
              <button className="p-1.5 rounded-full bg-white/0 hover:bg-white/10 standalone:bg-white/10 standalone:hover:bg-white/20 duration-150 transition-all">
                <IoEllipsisHorizontal size={20} />
              </button>
            </DrawerDialog>
          </div>
        </Heading>
        <div>
          {!library ? (
            <div className="px-5">
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
                  onChange={handleInputChange} // Using memoized onChange handler
                  placeholder="Enter library key"
                  icon={keyIcon}
                />
              </div>
            </div>
          ) : (
            <div>
              {canNameLibrary && (
                <>
                  <div className="flex items-center gap-2 mb-2 px-5">
                    {isEditing ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={libraryName}
                        onChange={(e) => setLibraryName(e.target.value)}
                        onBlur={handleSaveLibraryName}
                        onKeyDown={handleKeyDown}
                        placeholder="My Library"
                        className="bg-transparent border-none focus:outline-none text-2xl font-bold placeholder:text-foreground/50"
                        autoFocus
                      />
                    ) : (
                      <SubHeading onClick={() => setIsEditing(true)}>
                        {libraryName || "Untitled Library"}
                      </SubHeading>
                    )}
                  </div>
                </>
              )}
              <div className="grid gap-2 px-5">{playAllButton}</div>
              <div className="py-4">
                <ul className="flex flex-col gap-1 library-card-container">
                  {library.songs.map((song) => (
                    <LibraryCard
                      key={song.id}
                      songId={song.id}
                      handlePlaySong={() => handlePlaySong(song.id)} // Using memoized handlePlaySong
                      isPlaying={playingId == song.id}
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
