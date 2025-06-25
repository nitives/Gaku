import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { conf } from "@/lib/config";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const KEY = conf().SOUNDCLOUD.CLIENT_ID;
    const APIKEY = conf().SOUNDCLOUD.API_KEY;

    try {
      const response = await axios.get(
        `https://api-v2.soundcloud.com/mixed-selections?client_id=${KEY}`,
        {
          headers: {
            Authorization: `OAuth ${APIKEY}`,
          },
        }
      );

      // List of tracking_feature_name values to include
      const includedFeatureNames = [
        "buzzing",
        "trending-by-genre",
        "curated-charts-top-50",
        "curated-trending-music-on-soundcloud",
        "curated-fresh-pressed",
        "curated-scenes-corners-of-soundcloud",
        "curated-hip-hop",
        "curated-pop",
        "curated-electronic",
        "curated-chill",
        "curated-introducing-buzzing",
        "curated-get-up",
        "curated-rb",
        "curated-holiday",
        "curated-country",
      ];

      // Filter the main collection by tracking_feature_name
      const filteredCollection = response.data.collection.filter((item: any) =>
        includedFeatureNames.includes(item.tracking_feature_name)
      );

      // Add artwork_url_hd and remove items with avatar_url
      const enhancedCollection = filteredCollection.map((item: any) => ({
        ...item,
        items: {
          ...item.items,
          collection: item.items.collection.map((nestedItem: any) => {
            // Add artwork_url_hd and avatar_url_hd at the top of the item
            const updatedItem = {
              avatar_url_hd: nestedItem.avatar_url
                ? nestedItem.avatar_url.replace("large", "t500x500")
                : null,
              avatar_url: nestedItem.avatar_url || null,
              artwork_url_hd: nestedItem.artwork_url
                ? nestedItem.artwork_url.replace("large", "t500x500")
                : null,
              artwork_url: nestedItem.artwork_url || null,
              ...nestedItem, // Spread the rest of the properties after the specific ones
            };

            return updatedItem;
          }),
        },
      }));

      // Return the filtered and enhanced collection
      res.status(200).json({
        ...response.data,
        collection: enhancedCollection,
      });
    } catch (error) {
      console.error("Error fetching SoundCloud data:", error);
      res.status(500).json({ error: "An error occurred" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
