import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const APPLE_AUTH = process.env.APPLE_AUTH;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query, type } = req.query;

  if (req.method === "GET") {
    try {
      // Determine the type of search (albums or songs)
      const searchType = type === "albums" ? "albums" : "songs";

      console.log(`AppleKit API | Query: ${query} | Type: ${searchType}`);

      // First request to search for the song or album
      // Usage: /api/apple/song/[query]?type=albums or /api/apple/song/[query]?type=songs

      // https://api.music.apple.com/v1/catalog/us/search?types=albums&term=LYFESTYLE
      const searchResponse = await axios.get(
        `https://api.music.apple.com/v1/catalog/us/search?limit=5&term=${query}&types=${searchType}`,
        {
          headers: {
            Origin: "https://music.apple.com",
            Authorization: `Bearer ${APPLE_AUTH}`,
          },
        }
      );

      const albumId = searchResponse.data.results.albums.data[0].id;

      // Finds ID by name
      // const album = searchResponse.data.results.albums.data.find(
      //   (album: any) => album.attributes.name.toLowerCase() === (query as string).toLowerCase()
      // );

      // if (!album) {
      //   return res.status(404).json({ error: "Album not found" });
      // }
      // const albumId = album.id;

      // Second request to get detailed album information
      const albumResponse = await axios.get(
        `https://amp-api.music.apple.com/v1/catalog/us/albums/${albumId}?l=en-US&extend=editorialArtwork%2CeditorialVideo%2CextendedAssetUrls%2Coffers%2CtrackCount%2Ctags`,
        {
          headers: {
            Origin: "https://music.apple.com",
            Authorization: `Bearer ${APPLE_AUTH}`,
          },
        }
      );

      res.status(200).json(albumResponse.data);
    } catch (error) {
      res.status(500).json({
        error: "An error occurred while fetching the song info | MusicKit",
      });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
