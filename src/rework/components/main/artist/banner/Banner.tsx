"use client";

import React from "react";
import Image from "next/image";
import ReactPlayer from "react-player";
import style from "./Banner.module.css";
import { useQuery } from "@tanstack/react-query";
import { AppleKit } from "@/lib/audio/fetchers";
import { dev } from "@/lib/utils";
import { SoundCloudArtist } from "@/lib/types/soundcloud";
import { artistMappings } from "@/lib/artist";

type EditorialResult = {
  url?: string;
  bgColor?: string;
  animated?: string; // The editorial video URL
};

// 1) Helper function to parse editorial data:
function getFirstEditorialArtwork(appleData: any): EditorialResult {
  if (!appleData?.data?.length || !appleData?.resources) return {};

  for (const item of appleData.data) {
    if (item.type !== "artists") continue;
    const resource = appleData.resources.artists?.[item.id];
    if (!resource) continue;

    const { editorialVideo, editorialArtwork } = resource.attributes ?? {};

    // Check editorialVideo first
    if (editorialVideo) {
      // We loop in a preferred order
      for (const key of [
        "motionArtistWide16x9",
        "motionArtistFullscreen16x9",
        "motionArtistSquare1x1",
      ]) {
        const videoBlock = editorialVideo[key];
        if (videoBlock?.previewFrame?.url && videoBlock?.video) {
          return {
            url: videoBlock.previewFrame.url,
            bgColor: videoBlock.previewFrame.bgColor,
            animated: videoBlock.video,
          };
        }
      }
    }

    // Then editorialArtwork fallback
    const ed = editorialArtwork?.centeredFullscreenBackground;
    if (ed?.url) {
      return { url: ed.url, bgColor: ed.bgColor };
    }
  }

  return {};
}

// 2) Our React Query fetcher:
async function fetchAppleData(artist: SoundCloudArtist) {
  const rawUsername = artist.username ?? "";
  const mappedName = artistMappings[rawUsername] ?? rawUsername;
  const data = await AppleKit.getArtistData(mappedName);
  dev.log("fetchAppleData | Banner | AppleKit.getArtistData", data);
  return data;
}

export const Banner = ({ artist }: { artist: SoundCloudArtist | null }) => {
  const { data: apple } = useQuery({
    queryKey: ["appleData", artist?.id],
    queryFn: () => fetchAppleData(artist!),
    enabled: !!artist?.id, // Only fetch if we have a valid artist ID
    staleTime: 1000 * 60 * 60, // 1 hour in milliseconds
  });

  if (!artist) {
    return null;
  }

  // 3) Once loaded, parse editorial data:
  const {
    url: editorialUrl,
    bgColor,
    animated: editorialVideo,
  } = getFirstEditorialArtwork(apple);

  // Decide which display name to show if we have a video
  const scUsername = artist.username || "";
  const mappedName = artistMappings[scUsername] ?? scUsername;
  const displayName = editorialVideo ? mappedName : scUsername;

  // If there's a static editorialUrl, transform it
  const bannerWidth = "2000";
  const bannerHeight = "1000";
  const bannerCon = "ea-60";
  const bannerFormat = "jpg";

  const appleBannerUrl = editorialUrl
    ? editorialUrl.replace(
        /\/\{\w+\}x\{\w+\}\{\w*\}\.\{?\w+\}?/,
        `/${bannerWidth}x${bannerHeight}${bannerCon}.${bannerFormat}`
      )
    : undefined;

  // fallback from SoundCloud or local placeholder
  const scBanner = artist.visuals?.visuals?.[0]?.visual_url;
  const fallbackSrc = "/assets/placeholders/banner-placeholder.svg";
  const bannerSrc = appleBannerUrl || scBanner || fallbackSrc;

  // 4) Render
  return (
    <div
      className={style.Banner}
      style={{
        position: "relative",
        aspectRatio: editorialVideo ? "1478/600" : "1240/260",
        backgroundColor: bgColor ? `#${bgColor}` : undefined,
      }}
    >
      <div className={style.BannerOverlay}>
        <h1>{displayName}</h1>
      </div>

      {editorialVideo ? (
        <ReactPlayer
          url={editorialVideo}
          playing
          className={style.BannerVideo}
          loop
          muted
          playsinline
          width="100%"
          height="100%"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            overflow: "hidden",
            objectFit: "cover",
          }}
        />
      ) : (
        <Image
          fill
          priority
          style={{ objectFit: "cover" }}
          src={bannerSrc}
          alt={`${artist.username}'s Banner`}
        />
      )}
    </div>
  );
};
