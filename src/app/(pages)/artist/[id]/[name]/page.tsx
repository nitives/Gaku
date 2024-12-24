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
import useAudioStore from "@/context/AudioContext";
import { fetchPlaylistM3U8 } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { usePlaylistFetcher } from "@/lib/audio/play";

export default function PlaylistPage() {
  const { setCurrentTrack, setPlaylistUrl, setIsPlaying, setHDCover } =
    useAudioStore();
  const params = useParams();
  const id = params?.id as string;
  const [artist, setArtist] = useState<any>(null);
  const [spotlight, setSpotlight] = useState<any>(null);
  const router = useRouter();
  const [recent, setRecent] = useState<any>(null);

  const { handleFetchPlaylist } = usePlaylistFetcher();

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

  // const playSong = async (item: any) => {
  //   if (!item || !item.permalink_url) {
  //     toast.error("Song data unavailable!");
  //     return;
  //   }
  //   if (item.kind === "playlist") {
  //     router.push(`/playlist/${item.id}`);
  //   } else {
  //     const playlistUrl = await fetchPlaylistM3U8(item.permalink_url);
  //     setCurrentTrack(item);
  //     setPlaylistUrl(playlistUrl);
  //     setIsPlaying(true);
  //     setHDCover(item.artwork_url_hd || item.user.avatar_url);
  //   }
  // };

  return (
    <>
      <SafeView className="w-full">
        <header className="w-full h-fit flex flex-col rounded-xl border-2 max-md:border overflow-hidden">
          <Image
            className="size-full"
            width={960}
            height={200}
            src={
              artist?.visuals?.visuals?.[0]?.visual_url ||
              artist?.avatar_url ||
              "/assets/placeholders/missing_song_dark.png"
            }
            alt={artist?.username || "Artist"}
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
        </header>
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
                  recent?.collection[0]?.artwork_url_hd ||
                  recent?.collection[0].tracks?.[0]?.artwork_url_hd ||
                  "/assets/placeholders/missing_song_dark.png"
                }
                alt={recent?.collection[0]?.title || "Latest Release"}
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
            <MediaCard
              playSong={() => handleFetchPlaylist(song.permalink_url)}
              song={song}
              key={index}
            />
          ))}
        </ScrollContainer>
        <SubHeading className="mb-0 pt-10">Recent</SubHeading>
        <ScrollContainer className="pt-5 w-full">
          {recent?.collection.map((song: any, index: number) => (
            <MediaCard
              playSong={() => handleFetchPlaylist(song.permalink_url)}
              song={song}
              key={index}
            />
          ))}
        </ScrollContainer>
      </SafeView>
    </>
  );
}

const MediaCard = ({ song, playSong }: { song: any; playSong: () => void }) => {
  return (
    <div onClick={playSong} key={song.id} className="flex flex-col gap-1">
      <div className="size-40 border border-border/15 rounded-xl overflow-hidden bg-border/15">
        <Image
          className="size-full rounded-xl hover:brightness-75 cursor-pointer transition-all duration-200"
          width={200}
          height={200}
          src={
            song?.artwork_url_hd ||
            song?.tracks?.[0]?.artwork_url_hd ||
            "/assets/placeholders/missing_song_dark.png"
          }
          alt={song?.title || "Song"}
          draggable={false}
        />
      </div>
      <SongTitle
        title={song.title}
        explicit={song.publisher_metadata?.explicit || false}
        date={song.release_date}
      />
    </div>
  );
};

const SongTitle = ({
  title,
  explicit,
  date,
}: {
  title: string;
  explicit: boolean;
  date: string;
}) => {
  return (
    <span className="block">
      <span className="flex items-center gap-1">
        <p className="text-sm max-w-[140px] truncate">{title}</p>
        {explicit && (
          <span
            className="text-muted-foreground"
            title="Explicit Content"
            aria-label="Explicit"
          >
            🅴
          </span>
        )}
      </span>
      <p
        className="text-xs text-muted-foreground"
        title={new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      >
        {new Date(date).getFullYear()}
      </p>
    </span>
  );
};
