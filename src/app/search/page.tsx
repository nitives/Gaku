"use client";
import { AudioPlayerHLS } from "@/components/AudioPlayerHLS";
import { ColorGen } from "@/components/ColorGen";
import {
  Header,
  Heading,
  Input,
  SafeView,
  ScrollHeader,
  SubHeading,
} from "@/components/mobile/SafeView";
import { SearchCard } from "@/components/mobile/SearchCard";
import { fetchPlaylistM3U8, FetchSearch } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useAudioStore from "@/context/AudioContext";

export default function Home() {
  const {
    setCurrentTrack: setGlobalCurrentTrack,
    setPlaylistUrl: setGlobalPlaylistUrl,
    isPlaying,
    setIsPlaying,
    cover,
    setHDCover,
  } = useAudioStore();

  const [search, setSearchData] = useState<any>(null);
  const [localPlaylistUrl, setLocalPlaylistUrl] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [localCurrentTrack, setLocalCurrentTrack] = useState<any>(null);
  const router = useRouter();

  const handleSearch = async () => {
    const data = await FetchSearch(query);
    setSearchData(data);
    console.log("data:", data);
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const handleFetchPlaylist = async (item: any) => {
    const data = await fetchPlaylistM3U8(item.permalink_url);
    console.log("handleFetchPlaylist | data:", data);
    setGlobalPlaylistUrl(data);
    setGlobalCurrentTrack(item);
    setIsPlaying(true);
    setLocalPlaylistUrl(data);
    setLocalCurrentTrack(item);
    if (item.permalink_url) {
      console.log("fetchPlaylist to fetchCover -", item.permalink_url);
      fetchCover(item.permalink_url);
    }
    console.log("playlistUrl:", data);
  };

  const fetchCover = async (query: string) => {
    const url = encodeURIComponent(query);
    const response = await fetch(`/api/extra/cover/${url}`);
    console.log("fetchCover | response:", response);
    const data = await response.json();
    console.log("fetchCover | Query:", query, "img:", data);
    setHDCover(data.imageUrl);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const formatDuration = (duration: number): string => {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  let regionNames = new Intl.DisplayNames(["en"], { type: "region" });

  const navigateToAlbum = (item: any) => {
    router.push(`/playlist/${item.id}`);
  };

  const navigateToArtist = (item: any) => {
    router.push(`/artist/${item.id}/${item.username.toLowerCase().replace(/\s+/g, '-')}`);
  };

  return (
    <>
      <SafeView className="!px-0 z-10 relative">
        {localCurrentTrack && cover && (
          <ColorGen src={cover || localCurrentTrack.artwork_url} />
        )}
        <div className="px-5">
          <ScrollHeader
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            onSearch={handleSearch}
            value={query}
            title="Search"
            autoFocus={true}
          />
          <Heading>Search</Heading>
          <Input
            value={query}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            placeholder="Search"
            onSearch={handleSearch}
            className="mb-5"
            autoFocus={true}
          />
        </div>
        {search && (
          <SafeView className="w-full pb-[2rem] !pt-0">
            {search.collection.map((item: any, index: number) => (
              <div key={index} className="w-full flex flex-col gap-4">
                <div
                  key={index}
                  className="w-full flex flex-col gap-4 border-b active:bg-background/5 transition-colors duration-100 cursor-pointer"
                >
                  <SearchCard
                    onClick={() => {
                      if (item.kind === "user") {
                        navigateToArtist(item);
                      } else if (item.kind === "playlist") {
                        navigateToAlbum(item);
                      } else {
                        handleFetchPlaylist(item);
                      }
                    }}
                    id={item.id}
                    isExplicit={item.publisher_metadata?.explicit === true}
                    premium={item.monetization_model === "SUB_HIGH_TIER"}
                    playlist={item.kind === "playlist"}
                    track={item.kind === "track"}
                    artist={item.kind === "user"}
                    title={item.kind === "user" ? item.username : item.title}
                    artistName={item?.user?.username}
                    image={
                      item.kind === "user"
                        ? item.avatar_url
                        : item.artwork_url ||
                          item?.tracks?.[0]?.artwork_url ||
                          ""
                    }
                  />
                </div>
              </div>
            ))}
          </SafeView>
        )}
      </SafeView>
      <div className="min-h-screen min-w-[99vw] flex justify-center absolute items-center z-[1] top-[-35rem]">
        <div className="ambient-bg" />
      </div>
    </>
  );
}
