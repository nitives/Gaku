import { SoundCloudArtist } from "@/lib/types/soundcloud";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import style from "./Banner.module.css";
import { AppleKit } from "@/lib/audio/fetchers";

export const Banner = ({ artist }: { artist: SoundCloudArtist | null }) => {
  const [apple, setAppleData] = useState<any | null>(null);

  useEffect(() => {
    const fetchAppleData = async () => {
      const data = await AppleKit.getArtistData(artist?.username || "");
      setAppleData(data);
    };
    fetchAppleData();
  }, [artist?.username]);

  // Banner manipulations
  const bannerWidth = "2000";
  const bannerHeight = "1000";
  const bannerCon = "ea-60";
  const bannerFormat = "jpg";

  // Safely check if Apple data exists and then retrieve banner
  const appleBanner = {
    src: apple?.data?.[0]
      ? apple?.resources?.artists[
          apple.data[0].id
        ]?.attributes?.editorialArtwork?.centeredFullscreenBackground?.url?.replace(
          /\/\{\w+\}x\{\w+\}\{\w*\}\.\{?\w+\}?/,
          `/${bannerWidth}x${bannerHeight}${bannerCon}.${bannerFormat}`
        )
      : undefined,
    bgColor: `#${
      apple?.resources?.artists[apple.data[0].id].attributes?.editorialArtwork
        ?.centeredFullscreenBackground?.bgColor
    }`,
  };

  // SoundCloud fallback
  const soundcloudBanner = artist?.visuals?.visuals[0]?.visual_url;

  // If appleBanner is truthy, use it; otherwise fallback to SoundCloud
  const bannerSrc = appleBanner.src || soundcloudBanner;

  return (
    <div
      className={style.Banner}
      style={{
        position: "relative",
        aspectRatio: appleBanner ? "1478/646" : "1240/260",
      }}
    >
      <div className={style.BannerOverlay}>
        <h1>{artist?.username}</h1>
      </div>
      <Image
        objectFit="cover"
        loading="lazy"
        fill
        style={{ backgroundColor: appleBanner.bgColor }}
        src={
          bannerSrc ? bannerSrc : "/assets/placeholders/banner-placeholder.svg" // optional fallback if both are missing
        }
        alt={`${artist?.username}'s Banner`}
      />
    </div>
  );
};
