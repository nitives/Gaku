"use client";
import {
  Heading,
  SafeView,
  ScrollContainer,
  SubHeading,
} from "@/components/mobile/SafeView";
import { SongCard } from "@/components/mobile/home/SongCard";
import { FetchHipHopEvents, FetchNewHotEvents } from "@/lib/utils";
import React, { useState, useEffect } from "react";

export default function Home() {
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

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <SafeView>
      <header className="flex justify-between">
        <Heading className="mb-0">Home</Heading>
        <div className="size-7 bg-muted rounded-full" />
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
              src={track.hdCover || track.artwork_url}
              title={track.title}
              artist={track.user.username}
            />
          ))}
          {topHipHop && (
            <SongCard
              src={topHipHop.playlistHDCover || topHipHop.artwork_url}
              title={`View All: ${topHipHop.title}`}
              artist="Top Hip Hop Charts"
            />
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
              src={track.hdCover || track.artwork_url}
              title={track.title}
              artist={track.user.username}
            />
          ))}
          {newHot && (
            <SongCard
              src={newHot.playlistHDCover || newHot.artwork_url}
              title={`View All: ${newHot.title}`}
              artist="New & Hot"
            />
          )}
        </ScrollContainer>
      </div>
    </SafeView>
  );
}
