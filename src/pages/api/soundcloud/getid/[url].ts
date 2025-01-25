import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { url } = req.query;
  const decodedUrl = Array.isArray(url) ? url[0] : url;

  if (!decodedUrl) {
    return res.status(400).json({ error: "URL parameter is required" });
  }

  try {
    const response = await axios.get(decodedUrl);
    const html = response.data;

    // Use a regex to find the meta tag content quickly
    const metaMatch = html.match(
      /<meta property=["']al:ios:url["'] content=["']([^"']+)["']/
    );
    if (metaMatch && metaMatch[1]) {
      const content = metaMatch[1];
      const trackId = content.replace(/soundcloud:\/\/(sounds|playlists):/, "");
      return res.status(200).json({ trackId });
    }

    return res.status(404).json({ error: "Track ID not found" });
  } catch (error) {
    console.error("Failed to fetch track ID:", error);
    return res.status(500).json({ error: "Failed to fetch track ID" });
  }
}
