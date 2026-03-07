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
import { RiVerifiedBadgeFill } from "react-icons/ri";

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

  if (!editorialVideo) {
    const scUsername = artist.username || "";
    const mappedName = artistMappings[scUsername] ?? scUsername;
    const scBanner = artist.visuals?.visuals?.[0]?.visual_url;

    if (scBanner) {
      return (
        <div
          className={style.Banner}
          style={{ position: "relative", aspectRatio: "3/1" }}
        >
          <Image
            fill
            priority
            style={{ objectFit: "cover" }}
            src={scBanner}
            alt={`${mappedName}'s Banner`}
            draggable={false}
          />
          <div
            className={style.BannerOverlay}
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,0.65) 100%)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Image
                src={artist.avatar_url}
                alt={mappedName}
                width={56}
                height={56}
                draggable={false}
                style={{ borderRadius: "50%", flexShrink: 0 }}
              />
              <h1
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                }}
              >
                {mappedName}
                {artist.verified && (
                  <span style={{ color: "var(--keyColor)", fontSize: "1.25rem" }}>
                    <RiVerifiedBadgeFill />
                  </span>
                )}
              </h1>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 flex items-center gap-4 user-select-none">
        <Image
          src={artist.avatar_url}
          alt={`${mappedName}'s Avatar`}
          width={80}
          height={80}
          draggable={false}
          style={{
            borderRadius: "50%",
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
          }}
        />
        <h1
          style={{
            zIndex: 2,
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            fontWeight: 700,
            fontSize: "2rem",
            color: "white",
            display: "flex",
            alignItems: "center",
            position: "relative",
          }}
        >
          {mappedName}
          {artist.verified && (
            <span
              style={{
                marginLeft: "8px",
                color: "var(--keyColor)",
                fontSize: "1.5rem",
              }}
            >
              <RiVerifiedBadgeFill />
            </span>
          )}
          <span className="absolute -bottom-4">
            {artist.city && (
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--systemSecondary)",
                }}
              >
                {artist.city}
              </span>
            )}
          </span>
        </h1>
      </div>
    );
  }

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
        `/${bannerWidth}x${bannerHeight}${bannerCon}.${bannerFormat}`,
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
          src={editorialVideo}
          playing
          className={style.BannerVideo}
          loop
          muted
          playsInline
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
