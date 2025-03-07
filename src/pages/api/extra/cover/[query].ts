import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { JSDOM } from "jsdom";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query } = req.query;

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Ensure that query is a string and not undefined or an array
  const queryString = Array.isArray(query) ? query[0] : query;

  if (!queryString) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    // Check if the query is a direct artwork URL
    if (queryString.includes("sndcdn.com/artworks")) {
      const hdImageUrl = queryString.replace("large", "t500x500");
      return res.status(200).json({ imageUrl: hdImageUrl });
    }

    // Fetch the HTML from the SoundCloud page
    const response = await axios.get(queryString);

    // Parse the HTML using JSDOM
    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    // Find the meta tag with property `og:image`
    const metaTag = document.querySelector('meta[property="og:image"]');

    if (metaTag) {
      // Extract the content attribute which contains the image URL
      const imageUrl = metaTag.getAttribute("content");

      if (imageUrl) {
        // Modify the image URL to get the HD version
        const hdImageUrl = imageUrl.replace("large", "t500x500");
        return res.status(200).json({ imageUrl: hdImageUrl });
      }
    }

    // If the meta tag or URL is not found, return a 404 error
    return res.status(404).json({ error: "Artwork not found" });
  } catch (error) {
    console.error("Failed to fetch track data:", error);
    return res.status(500).json({ error: "Failed to fetch track data" });
  }
}
