"use client";
import {
  Heading,
  SafeView,
  ScrollContainer,
  SubHeading,
} from "@/components/mobile/SafeView";
import { SongCard } from "@/components/mobile/home/SongCard";
import { Skeleton } from "@/components/ui/skeleton";
import useAudioStore from "@/context/AudioContext";
import { useAudioStoreNew } from "@/context/AudioContextNew";
import { mapSCDataToSongOrPlaylist } from "@/lib/audio/fetchers";
import {
  FetchHipHopEvents,
  FetchNewHotEvents,
  fetchPlaylistM3U8,
} from "@/lib/utils";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function Home() {
  const [topHipHop, setTopHipHop] = useState<any>(null);
  const [newHot, setNewHot] = useState<any>(null);

  const { setQueue, addToQueue } = useAudioStoreNew();

  const EXPIRATION_HOURS = 12; // 12 hours
  const STORAGE_KEY = "GakuLocal/homedata";

  const fetchHDCover = async (query: string) => {
    const url = encodeURIComponent(query);
    const response = await fetch(`/api/extra/cover/${url}`);
    const data = await response.json();
    return data.imageUrl;
  };

  const fetchHDCoversForTracks = async (tracks: any[]) => {
    return Promise.all(
      tracks.map(async (track) => {
        const hdCover = await fetchHDCover(track.permalink_url);
        return { ...track, hdCover };
      })
    );
  };

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
    const topHipHopResult = {
      ...topHipHopData,
      tracks: topHipHopWithHDCovers,
      playlistHDCover: topHipHopPlaylistCover,
    };
    const newHotResult = {
      ...newHotData,
      tracks: newHotWithHDCovers,
      playlistHDCover: newHotPlaylistCover,
    };
    return { topHipHop: topHipHopResult, newHot: newHotResult };
  };

  const handleFetchPlaylist = async (url: string) => {
    if (!url) return;
    const { initialSongs, loadRemaining } = await mapSCDataToSongOrPlaylist(
      url,
      3
    );
    await setQueue(initialSongs);
    const remainingSongs = await loadRemaining();
    addToQueue(remainingSongs);
  };

  useEffect(() => {
    // On mount, check localStorage for cached data
    const storedData = localStorage.getItem(STORAGE_KEY);

    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        const { timestamp, data } = parsed;

        // Check if data is expired
        const now = Date.now();
        const twelveHoursInMs = EXPIRATION_HOURS * 60 * 60 * 1000;

        if (now - timestamp < twelveHoursInMs) {
          // Data is still valid
          setTopHipHop(data.topHipHop);
          setNewHot(data.newHot);
          return;
        } else {
          // Data is expired, remove it
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        // If parsing error or something invalid, just remove and refetch
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    // If no valid data found, fetch new data
    const initializeData = async () => {
      const { topHipHop: fetchedTopHipHop, newHot: fetchedNewHot } =
        await fetchData();
      setTopHipHop(fetchedTopHipHop);
      setNewHot(fetchedNewHot);
      const toStore = {
        timestamp: Date.now(),
        data: {
          topHipHop: fetchedTopHipHop,
          newHot: fetchedNewHot,
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    };

    initializeData();
  }, []);

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
              onClick={() => handleFetchPlaylist(track.permalink_url)}
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
              onClick={() => handleFetchPlaylist(track.permalink_url)}
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
