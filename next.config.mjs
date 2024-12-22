import MillionLint from "@million/lint";
/** @type {import('next').NextConfig} */
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
    ],
  },
};

// export default MillionLint.next()(nextConfig);
export default nextConfig;
