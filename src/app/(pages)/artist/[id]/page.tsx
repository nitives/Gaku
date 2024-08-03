"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  Heading,
  SafeView,
  ScrollContainer,
  SubHeading,
} from "@/components/mobile/SafeView";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function PlaylistPage() {
  const params = useParams();
  const id = params?.id as string;
  const [artist, setArtist] = useState<any>(null);
  const [spotlight, setSpotlight] = useState<any>(null);
  const [recent, setRecent] = useState<any>(null);
  const [song, setSongData] = useState<any>(null);

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
    const response = await fetch(`/api/song/info/${artistId}`);
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

  return (
    <>
      <SafeView>
        <Dialog>
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
        </ScrollContainer>
      </SafeView>
    </>
  );
}
