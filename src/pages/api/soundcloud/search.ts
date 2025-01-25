import { SEARCH_PAGE } from "@/lib/constants";
import { conf } from "@/lib/config";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * Usage:
 *   /api/soundcloud?q=someArtist         => default to mini search
 *   /api/soundcloud?q=someArtist&type=mini => explicitly mini
 *   /api/soundcloud?q=someArtist&type=full => full search
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { q, type } = req.query;
  const query = q as string;
  // default to "mini" if type is not provided
  const searchType = (type as string) || "mini";

  const key = conf().SOUNDCLOUD.CLIENT_ID;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required.' });
  }

  if (!key) {
    return res
      .status(500)
      .json({ error: "SoundCloud Client ID is not configured." });
  }

  try {
    // --------------------------------------
    // 1) FULL SEARCH
    // --------------------------------------
    if (searchType === "full") {
      const fullUrl = `https://api-v2.soundcloud.com/search?q=${encodeURIComponent(
        query
      )}&client_id=${key}&limit=20&offset=0`;

      const fullResponse = await fetch(fullUrl);
      if (!fullResponse.ok) {
        throw new Error("Failed to fetch from SoundCloud full search.");
      }
      const fullData = await fullResponse.json();
      return res.status(200).json({ full: fullData });
    }

    // --------------------------------------
    // 2) MINI SEARCH (the existing approach)
    // --------------------------------------
    // fetch from 'search/queries' (small) and normal 'search' (large)
    const SCSearchResponseSmall = await fetch(
      `https://api-v2.soundcloud.com/search/queries?q=${encodeURIComponent(
        query
      )}&client_id=${key}&limit=${SEARCH_PAGE.SMALL.LIMIT}&offset=${
        SEARCH_PAGE.SMALL.OFFSET
      }&linked_partitioning=1&app_version=1737027715&app_locale=en`
    );
    if (!SCSearchResponseSmall.ok) {
      throw new Error("Failed to fetch mini (small) SoundCloud search.");
    }

    const SCSearchResponseLarge = await fetch(
      `https://api-v2.soundcloud.com/search?q=${encodeURIComponent(
        query
      )}&variant_ids=&query_urn=soundcloud%3Asearch-autocomplete%3Adeb7f341d9164082a21433260720aa9e&facet=model&user_id=681620-889553-566128-420969&client_id=${key}&limit=${
        SEARCH_PAGE.LARGE.LIMIT
      }&offset=${
        SEARCH_PAGE.LARGE.OFFSET
      }&linked_partitioning=1&app_version=1737027715&app_locale=en`
    );
    if (!SCSearchResponseLarge.ok) {
      throw new Error("Failed to fetch mini (large) SoundCloud search.");
    }

    const small = await SCSearchResponseSmall.json();
    const large = await SCSearchResponseLarge.json();

    return res.status(200).json({
      small,
      large,
    });
  } catch (error: unknown) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while searching data." });
  }
}
