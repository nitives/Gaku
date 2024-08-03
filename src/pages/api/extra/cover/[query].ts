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

  try {
    console.log("Scraping started");

    // Fetch the HTML from the SoundCloud page
    const response = await axios.get(
      query
    );
    console.log("Response received!");

    // Parse the HTML using JSDOM
    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    console.log("Document Initialized!");

    // Find the meta tag with property `og:image`
    const metaTag = document.querySelector('meta[property="og:image"]');

    if (metaTag) {
      console.log("Meta tag found!", metaTag);

      // Extract the content attribute which contains the image URL
      const imageUrl = metaTag.getAttribute("content");

      if (imageUrl) {
        console.log("Image URL extracted!", imageUrl);
        // Return the image URL as JSON
        return res.status(200).json({ imageUrl });
      } else {
        console.log("Image URL not found in the meta tag content!");
      }
    } else {
      console.log("Meta tag with og:image not found!");
    }

    // If the meta tag or URL is not found, return a 404 error
    return res.status(404).json({ error: "Artwork not found" });
  } catch (error) {
    console.error("Failed to fetch track data:", error);
    return res.status(500).json({ error: "Failed to fetch track data" });
  }
}
