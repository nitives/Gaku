import { SoundCloudArtist } from "@/lib/types/soundcloud";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import style from "./Banner.module.css";
import { AppleKit } from "@/lib/audio/fetchers";

function getFirstEditorialArtwork(appleData: any): {
  url?: string;
  bgColor?: string;
} {
  if (!appleData?.data?.length || !appleData?.resources) return {};
  for (const item of appleData.data) {
    const resourceType = item.type;
    const resourceId = item.id;
    const resource = appleData.resources[resourceType]?.[resourceId];

    const editorial =
      resource?.attributes?.editorialArtwork?.centeredFullscreenBackground;
    if (editorial?.url) {
      return {
        url: editorial.url,
        bgColor: editorial.bgColor,
      };
    }
  }
  return {};
}

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

  // 1) Get the first editorial artwork { url, bgColor } from Apple
  const { url: editorialUrl, bgColor } = getFirstEditorialArtwork(apple);

  // 2) If editorialUrl exists, transform it by replacing /{w}x{h}{c}.{f} with your custom size
  const appleBannerUrl = editorialUrl
    ? editorialUrl.replace(
        /\/\{\w+\}x\{\w+\}\{\w*\}\.\{?\w+\}?/,
        `/${bannerWidth}x${bannerHeight}${bannerCon}.${bannerFormat}`
      )
    : undefined;

  // 3) Fallback to SoundCloud banner if Apple doesn't exist
  const soundcloudBanner = artist?.visuals?.visuals[0]?.visual_url;
  const bannerSrc =
    appleBannerUrl ||
    soundcloudBanner ||
    "/assets/placeholders/banner-placeholder.svg";
  const bannerBgColor = bgColor ? `#${bgColor}` : undefined;

  return (
    <div
      className={style.Banner}
      style={{
        position: "relative",
        aspectRatio: appleBannerUrl ? "1478/646" : "1240/260",
      }}
    >
      <div className={style.BannerOverlay}>
        <h1>{artist?.username}</h1>
      </div>
      <Image
        // objectFit="cover"
        // loading="lazy"
        fill
        priority
        style={{ backgroundColor: bannerBgColor, objectFit: "cover" }}
        src={bannerSrc}
        alt={`${artist?.username}'s Banner`}
      />
    </div>
  );
};
