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
import { useAudio } from "@/context/AudioContext";

export default function Home() {
  const {
    setCurrentTrack: setGlobalCurrentTrack,
    setPlaylistUrl: setGlobalPlaylistUrl,
    isPlaying,
    setIsPlaying,
    cover,
    setHDCover,
  } = useAudio();

  const [search, setSearchData] = useState<any>(null);
  const [localPlaylistUrl, setLocalPlaylistUrl] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [localCurrentTrack, setLocalCurrentTrack] = useState<any>(null);
  // const [cover, setHDCover] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    console.log("isScrolled:", window.scrollY);

    window.addEventListener("scroll", handleScroll);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
    router.push(`/artist/${item.id}`);
  };

  return (
    <>
      <SafeView className="!px-0 z-10 relative">
        {localCurrentTrack && cover && (
          <ColorGen src={cover || localCurrentTrack.artwork_url} />
        )}
        <div className="px-5">
          {/* <Header title="Search">

          </Header> */}
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

        {/* <div className="px-5">
          <Heading className="mb-0 standalone:top-[6vh] relative">Search</Heading>
          
        </div>
        <div
          className={`sticky top-[-1px] z-10 px-5 py-4 standalone:pt-[6vh]  ${
            isScrolled
              ? "bg-white/5 backdrop-blur-lg border-b"
              : "bg-transparent"
          } transition-all duration-300`}
        >
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
          />
        </div> */}

        {/* <div className="flex gap-2">
          <input
            type="search"
            value={query}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            placeholder="Enter search query"
            className="px-4 py-2 border rounded placeholder:text-muted"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-orange-500 text-white rounded"
          >
            Search
          </button>
        </div> */}
        {/* {localPlaylistUrl && localCurrentTrack && (
          <div className="w-full">
            <AudioPlayerHLS
              height="100%"
              img={cover || localCurrentTrack.artwork_url || ""}
              title={localCurrentTrack.title}
              artist={localCurrentTrack.user.username}
              album={localCurrentTrack.publisher_metadata?.album_title || ""}
              src={localPlaylistUrl}
              isExplicit={
                localCurrentTrack.publisher_metadata?.explicit === true
              }
            />
          </div>
        )} */}
        {search && (
          <SafeView className="w-full pb-[2rem] !pt-0">
            {search.collection.map((item: any, index: number) => (
              <div key={index} className="w-full flex flex-col gap-4">
                <div
                  key={index}
                  onClick={() => {
                    if (item.kind === "user") {
                      navigateToArtist(item);
                    } else if (item.kind === "playlist") {
                      navigateToAlbum(item);
                    } else {
                      handleFetchPlaylist(item);
                    }
                  }}
                  className="w-full flex flex-col gap-4 border-b active:bg-white/5 transition-colors duration-100 cursor-pointer"
                >
                  <SearchCard
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
      <div className="min-h-screen min-w-[100vw] flex justify-center absolute items-center z-[1] top-[-35rem]">
        <div className="ambient-bg" />
      </div>
    </>
  );
}
