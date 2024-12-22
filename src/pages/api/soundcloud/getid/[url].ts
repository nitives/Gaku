import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { JSDOM } from "jsdom";

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
    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    // Find the meta tag with property `al:ios:url`
    const metaTag = document.querySelector('meta[property="al:ios:url"]');

    if (metaTag) {
      const content = metaTag.getAttribute("content");
      if (content) {
        const trackId = content.replace(
          /soundcloud:\/\/(sounds|playlists):/,
          ""
        );
        return res.status(200).json({ trackId });
      }
    }

    // If the meta tag or content is not found, return a 404 error
    return res.status(404).json({ error: "Track ID not found" });
  } catch (error) {
    console.error("Failed to fetch track ID:", error);
    return res.status(500).json({ error: "Failed to fetch track ID" });
  }
}
