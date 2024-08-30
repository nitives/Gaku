"use client";
import {
  Heading,
  SafeView,
  ScrollContainer,
  SubHeading,
} from "@/components/mobile/SafeView";
import { SongCard } from "@/components/mobile/home/SongCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAudio } from "@/context/AudioContext";
import {
  FetchHipHopEvents,
  FetchNewHotEvents,
  fetchPlaylistM3U8,
} from "@/lib/utils";
import Link from "next/link";
import React, { useState, useEffect } from "react";

export default function Home() {
  const {
    setCurrentTrack: setGlobalCurrentTrack,
    setPlaylistUrl: setGlobalPlaylistUrl,
    setIsPlaying,
    setHDCover,
  } = useAudio();
  const [topHipHop, setTopHipHop] = useState<any>(null);
  const [newHot, setNewHot] = useState<any>(null);

  const fetchData = async () => {
    const topHipHopData = await FetchHipHopEvents();
    const newHotData = await FetchNewHotEvents();
    const topHipHopWithHDCovers = await fetchHDCoversForTracks(
      topHipHopData.tracks.slice(0, 5)
    );
    const newHotWithHDCovers = await fetchHDCoversForTracks(
      newHotData.tracks.slice(0, 5)
    );

    const topHipHopPlaylistCover = await fetchHDCover(
      topHipHopData.artwork_url
    );
    const newHotPlaylistCover = await fetchHDCover(newHotData.artwork_url);

    setTopHipHop({
      ...topHipHopData,
      tracks: topHipHopWithHDCovers,
      playlistHDCover: topHipHopPlaylistCover,
    });
    setNewHot({
      ...newHotData,
      tracks: newHotWithHDCovers,
      playlistHDCover: newHotPlaylistCover,
    });
  };

  const fetchHDCoversForTracks = async (tracks: any[]) => {
    return Promise.all(
      tracks.map(async (track) => {
        const hdCover = await fetchHDCover(track.permalink_url);
        return { ...track, hdCover };
      })
    );
  };

  const fetchHDCover = async (query: string) => {
    const url = encodeURIComponent(query);
    const response = await fetch(`/api/extra/cover/${url}`);
    const data = await response.json();
    return data.imageUrl;
  };

  const handleFetchPlaylist = async (item: any) => {
    const data = await fetchPlaylistM3U8(item.permalink_url);
    console.log("handleFetchPlaylist | data:", data);
    setGlobalPlaylistUrl(data);
    setGlobalCurrentTrack(item);
    setIsPlaying(true);
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

  useEffect(() => {
    fetchData();
  }, []);

  console.log("topHipHop", topHipHop);

  return (
    <SafeView>
      <header className="flex justify-between">
        <Heading className="mb-0">Home</Heading>
        <Skeleton className="size-7 bg-muted rounded-full" />
      </header>
      <SubHeading
        link={`/playlist/${topHipHop?.id}`}
        subtitle={topHipHop?.description}
        className="mb-4"
      >
        Top Hip Hop Charts
      </SubHeading>
      <div className="-mx-5">
        <ScrollContainer className="px-5 w-full">
          {topHipHop?.tracks.slice(0, 5).map((track: any, index: number) => (
            <SongCard
              key={index}
              img={track.hdCover || track.artwork_url}
              title={track.title}
              artist={track.user.username}
              id={track.id}
              kind={track.kind}
              onClick={() => handleFetchPlaylist(track)}
            />
          ))}
          {topHipHop && (
            <Link href={`/playlist/${topHipHop.id}`}>
              <SongCard
                img={topHipHop.playlistHDCover || topHipHop.artwork_url}
                title={`View All: ${topHipHop.title}`}
                artist="Top Hip Hop Charts"
              />
            </Link>
          )}
        </ScrollContainer>
      </div>
      <br />
      <SubHeading
        link={`/playlist/${newHot?.id}`}
        subtitle={newHot?.description}
        className="mb-4"
      >
        New & Hot
      </SubHeading>
      <div className="-mx-5">
        <ScrollContainer className="px-5 w-full">
          {newHot?.tracks.slice(0, 5).map((track: any, index: number) => (
            <SongCard
              key={index}
              img={track.hdCover || track.artwork_url}
              title={track.title}
              artist={track.user.username}
              id={track.id}
              kind={track.kind}
              onClick={() => handleFetchPlaylist(track)}
            />
          ))}
          {newHot && (
            <Link href={`/playlist/${newHot.id}`}>
              <SongCard
                img={newHot.playlistHDCover || newHot.artwork_url}
                title={`View All: ${newHot.title}`}
                artist="New & Hot"
              />
            </Link>
          )}
        </ScrollContainer>
      </div>
    </SafeView>
  );
}
