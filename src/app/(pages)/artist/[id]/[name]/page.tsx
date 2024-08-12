"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  BackButton,
  Heading,
  SafeView,
  ScrollContainer,
  SubHeading,
} from "@/components/mobile/SafeView";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { useAudio } from "@/context/AudioContext";
import { fetchPlaylistM3U8 } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { usePathname, useRouter } from "next/navigation";

export default function PlaylistPage() {
  const { setCurrentTrack, setPlaylistUrl, setIsPlaying, setHDCover } =
    useAudio();
  const params = useParams();
  const id = params?.id as string;
  const [artist, setArtist] = useState<any>(null);
  const [spotlight, setSpotlight] = useState<any>(null);
  const [recent, setRecent] = useState<any>(null);
  const [song, setSongData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchArtist(id);
      fetchRecent(id);
      fetchSpotlight(id);
    }
  }, [id]);

  const fetchArtist = async (artistId: string) => {
    const response = await fetch(`/api/artist/info/${artistId}`);
    const data = await response.json();
    console.log("fetchArtist | data: ", data);
    setArtist(data);
  };

  const fetchSongdata = async (artistId: string) => {
    const response = await fetch(`/api/track/info/${artistId}`);
    const data = await response.json();
    console.log("fetchSongdata | data: ", data);
    setSongData(data);
  };

  const fetchRecent = async (artistId: string) => {
    const response = await fetch(`/api/artist/recent/${artistId}`);
    const data = await response.json();
    console.log("fetchRecent | data: ", data);
    setRecent(data);
  };

  const fetchSpotlight = async (artistId: string) => {
    const response = await fetch(`/api/artist/spotlight/${artistId}`);
    const data = await response.json();
    console.log("fetchSpotlight | data: ", data);
    setSpotlight(data);
  };

  const playSong = async (item: any) => {
    if (item.kind === "playlist") {
      router.push(`/playlist/${item.id}`);
    } else {
      const playlistUrl = await fetchPlaylistM3U8(item.permalink_url);
      setCurrentTrack(item);
      setPlaylistUrl(playlistUrl);
      setIsPlaying(true);
      setHDCover(item.artwork_url || item.user.avatar_url);
    }
  };

  return (
    <>
      <header className="w-full sm:h-fit h-[25vh] flex artist-header flex-col sm:aspect-[4.77/1] sm:rounded-b-2xl sm:border-b border-border relative overflow-hidden">
        <div className="absolute justify-start items-end flex p-4 translate-x-[0%] z-20 bg-red-500/0 w-full h-full">
          <BackButton className="absolute pt-10 standalone:pt-4 top-[0] left-[1.25rem] text-white/10 active:text-white/50 hover:text-white/50" />
          <div className="flex flex-col text-white">
            {artist?.verified === true && (
              <div className="flex gap-1 items-center">
                <span className="top-0.5">
                  <RiVerifiedBadgeFill className="text-[#699fff]" />
                </span>
                <p className="drop-shadow-2xl text-sm select-none">
                  Verified Artist
                </p>
              </div>
            )}
            <h1 className="drop-shadow-lg font-bold sm:text-6xl text-4xl">
              {artist?.username}
            </h1>
          </div>
        </div>
        <Image
          className="size-full relative z-10 object-cover select-none"
          width={960}
          height={200}
          src={artist?.visuals?.visuals?.[0]?.visual_url || artist?.avatar_url}
          alt={artist?.username}
          unoptimized={true}
        />
      </header>
      <SafeView>
        <SubHeading>Spotlight</SubHeading>
        <div className="-mx-5">
          <ScrollContainer className="px-5 pt-2 w-full">
            {spotlight?.collection.map((song: any, index: number) => (
              <div
                key={index}
                className="flex flex-col gap-1 cursor-pointer"
                onClick={() => playSong(song)}
              >
                <div
                  title={song?.title}
                  className="size-40 border border-border/50 shadow-md rounded-xl overflow-hidden bg-border/15"
                >
                  <Image
                    className="size-full rounded-xl scale-[.999]"
                    width={200}
                    height={200}
                    src={song?.artwork_url || song?.tracks?.[0]?.artwork_url}
                    alt={song?.title}
                    draggable={false}
                    unoptimized={true}
                  />
                </div>
                <span className="block">
                  <span className="flex items-center gap-1">
                    <p
                      title={`${song?.title} ${
                        song?.publisher_metadata?.explicit === true ? "🅴" : ""
                      }`}
                      className="text-sm truncate w-40 space-y-4"
                    >
                      {song?.title}
                      {song?.publisher_metadata?.explicit === true && (
                        <span className="text-muted-foreground pl-1">🅴</span>
                      )}
                    </p>
                  </span>
                  <p
                    className="text-xs text-muted-foreground"
                    title={new Date(song.display_date).toLocaleDateString(
                      "en-US",
                      { year: "numeric", month: "long", day: "numeric" }
                    )}
                  >
                    {new Date(song.display_date).getFullYear()}
                  </p>
                </span>
              </div>
            ))}
          </ScrollContainer>
        </div>
        {/* <Dialog>
          <DialogTrigger>
            <header className="w-full h-fit flex flex-col rounded-xl border-2 max-md:border overflow-hidden">
              <Image
                className="size-full"
                width={960}
                height={200}
                src={
                  artist?.visuals?.visuals?.[0]?.visual_url ||
                  artist?.avatar_url
                }
                alt={artist?.username}
                draggable={false}
                style={{
                  filter: !artist?.visuals?.visuals?.[0]?.visual_url
                    ? "blur(100px) brightness(1.5) saturate(2)"
                    : "none",
                  transform: !artist?.visuals?.visuals?.[0]?.visual_url
                    ? "scale(1.5)"
                    : "none",
                  width: !artist?.visuals?.visuals?.[0]?.visual_url
                    ? "100vw"
                    : "none",
                  height: !artist?.visuals?.visuals?.[0]?.visual_url
                    ? "100%"
                    : "none",
                }}
              />
              <div className="w-screen absolute translate-x-[-1.5rem] px-10 py-10">
                <div className="aspect-square border-2 max-md:border rounded-full size-[15vw]">
                  {artist?.avatar_url ? (
                    <Image
                      className="w-full rounded-full"
                      width={400}
                      height={400}
                      src={artist?.avatar_url}
                      alt={artist?.username}
                      draggable={false}
                    />
                  ) : (
                    <>
                      <div className="size-[5rem] rounded-full bg-muted border" />
                    </>
                  )}
                </div>
              </div>
            </header>
          </DialogTrigger>
          <DialogContent className="w-[90vw] h-fit rounded-2xl p-2 overflow-hidden">
            <Image
              className="w-full rounded-2xl"
              width={960}
              height={200}
              src={
                artist?.visuals?.visuals?.[0]?.visual_url || artist?.avatar_url
              }
              alt={artist?.username}
              draggable={false}
              style={{
                filter: !artist?.visuals?.visuals?.[0]?.visual_url
                  ? "blur(20px)"
                  : "none",
                transform: !artist?.visuals?.visuals?.[0]?.visual_url
                  ? "scale(1.1)"
                  : "none",
                width: !artist?.visuals?.visuals?.[0]?.visual_url
                  ? "100vw"
                  : "none",
                height: !artist?.visuals?.visuals?.[0]?.visual_url
                  ? "100%"
                  : "none",
              }}
            />
          </DialogContent>
        </Dialog>
        <div className="pt-7">
          <Heading className="mb-0">
            <div className="flex items-center gap-2 standalone:gap-1">
              {artist?.username || "Artist"}
              {artist?.verified === true && (
                <span className="text-muted-foreground">
                  <RiVerifiedBadgeFill
                    size={30}
                    className="text-[#699fff] standalone:text-[#4a99e9] standalone:scale-75 translate-y-[0.2rem]"
                  />
                </span>
              )}
            </div>
          </Heading>
          <p className="text-sm text-muted-foreground font-medium">
            {artist?.full_name}
          </p>
        </div>
        <div>
          <SubHeading className="pt-2">Latest</SubHeading>
          <div className="flex w-full gap-1 mt-3">
            <div className="size-24 border border-border/15 rounded-xl overflow-hidden bg-border/15">
              <Image
                className="size-full rounded-xl scale-[.999]"
                width={200}
                height={200}
                src={
                  recent?.collection[0]?.artwork_url ||
                  recent?.collection[0].tracks?.[0]?.artwork_url
                }
                alt={recent?.collection[0]?.title}
                draggable={false}
              />
            </div>
            <div className="py-2">
              <p className="text-muted-foreground font-medium text-sm">
                LATEST RELEASE{" "}
              </p>
              <span className="flex items-center gap-1">
                <p className="font-medium">{recent?.collection[0]?.title}</p>
                {recent?.collection[0]?.publisher_metadata?.explicit ===
                  true && <span className="text-muted-foreground">🅴</span>}
              </span>
            </div>
          </div>
        </div>
        <SubHeading className="mb-0 pt-10">Spotlight</SubHeading>
        <ScrollContainer className="pt-5 w-full">
          {spotlight?.collection.map((song: any, index: number) => (
            <div key={index} className="flex flex-col gap-1">
              <div className="size-40 border border-border/15 rounded-xl overflow-hidden bg-border/15">
                <Image
                  className="size-full rounded-xl scale-[.999]"
                  width={200}
                  height={200}
                  src={song?.artwork_url || song?.tracks?.[0]?.artwork_url}
                  alt={song?.title}
                  draggable={false}
                />
              </div>
              <span className="block">
                <span className="flex items-center gap-1">
                  <p className="text-sm truncate w-40">{song.title}</p>
                  {song?.publisher_metadata?.explicit === true && (
                    <span className="text-muted-foreground translate-x-[-450%]">
                      🅴
                    </span>
                  )}
                </span>
                <p
                  className="text-xs text-muted-foreground"
                  title={new Date(song.display_date).toLocaleDateString(
                    "en-US",
                    { year: "numeric", month: "long", day: "numeric" }
                  )}
                >
                  {new Date(song.display_date).getFullYear()}
                </p>
              </span>
            </div>
          ))}
        </ScrollContainer>
        <SubHeading className="mb-0 pt-10">Recent</SubHeading>
        <ScrollContainer className="pt-5 w-full">
          {recent?.collection.map((song: any, index: number) => (
            <div key={index} className="flex flex-col gap-1">
              <div className="size-40 border border-border/15 rounded-xl overflow-hidden bg-border/15">
                <Image
                  className="size-full rounded-xl scale-[.999]"
                  width={200}
                  height={200}
                  src={song?.artwork_url || song?.tracks?.[0]?.artwork_url}
                  alt={song?.title}
                  draggable={false}
                />
              </div>
              <span className="block">
                <span className="flex items-center gap-1">
                  <p className="text-sm truncate w-40">{song.title}</p>
                  {song?.publisher_metadata?.explicit === true && (
                    <span className="text-muted-foreground translate-x-[-450%]">
                      🅴
                    </span>
                  )}
                </span>
                <p
                  className="text-xs text-muted-foreground"
                  title={new Date(song.display_date).toLocaleDateString(
                    "en-US",
                    { year: "numeric", month: "long", day: "numeric" }
                  )}
                >
                  {new Date(song.display_date).getFullYear()}
                </p>
              </span>
            </div>
          ))}
        </ScrollContainer> */}
      </SafeView>
    </>
  );
}
