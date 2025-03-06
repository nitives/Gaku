import MillionLint from "@million/lint";
/** @type {import('next').NextConfig} */
const nextConfig = {
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
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
};

// export default MillionLint.next()(nextConfig);
export default nextConfig;
