import MillionLint from "@million/lint";
import nextPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const withPWA = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  devIndicators: {
    appIsrStatus: false,
  },
  env: {
    SOUNDCLOUD_API_KEY: process.env.SOUNDCLOUD_API_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i1.sndcdn.com",
      },
      {
        protocol: "https",
        hostname: "a1.sndcdn.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "t3.ftcdn.net",
      },
      {
        protocol: "https",
        hostname: "images.genius.com",
      },
      {
        protocol: "https",
        hostname: "is1-ssl.mzstatic.com",
      },
    ],
  },
};

// Apply PWA config
export default withPWA(nextConfig);
