import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const APPLE_AUTH =
  "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IldlYlBsYXlLaWQifQ.eyJpc3MiOiJBTVBXZWJQbGF5IiwiaWF0IjoxNzE2NTk3MDM1LCJleHAiOjE3MjM4NTQ2MzUsInJvb3RfaHR0cHNfb3JpZ2luIjpbImFwcGxlLmNvbSJdfQ.SekUtyaU8onE-rVZBQLyyo80yb474ps144vwgPzzdPIET2XTtukLTqMc6mGjz1H8BYgA3cjQFJbO5258yJsRUg";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query } = req.query;

  if (req.method === "GET") {
    try {
      // First request to search for the song
      // console.log("Starting  search for:", query);
      const searchResponse = await axios.get(
        `https://api.music.apple.com/v1/catalog/us/search?term=${encodeURIComponent(
          query as string
        )}&limit=10&types=albums`,
        {
          headers: {
            Origin: "https://music.apple.com",
            Authorization: `Bearer ${APPLE_AUTH}`,
          },
        }
      );

      // console.log(
      //   "Search Response meta:",
      //   searchResponse.data.results.albums.data[0].id
      // );

      const albumId = searchResponse.data.results.albums.data[0].id;

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