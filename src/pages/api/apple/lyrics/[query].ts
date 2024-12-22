import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const APPLE_AUTH = process.env.APPLE_AUTH;
const USER_TOKEN = process.env.APPLE_MEDIA_USER_TOKEN;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query } = req.query;

  if (req.method === "GET") {
    try {
      // First request to search for the song
      console.log("Apple | Lyrics | Starting search for:", query);
      const searchResponse = await axios.get(
        `https://api.music.apple.com/v1/catalog/us/search?types=songs&term=${
          query as string
        }&limit=10`,
        {
          headers: {
            Origin: "https://music.apple.com",
            Authorization: `Bearer ${APPLE_AUTH}`,
          },
        }
      );

      const songID = searchResponse.data.results.songs.data[0].id;

      const songResponse = await axios.get(
        `https://amp-api.music.apple.com/v1/catalog/us/songs/${songID}/syllable-lyrics`,
        {
          headers: {
            Origin: "https://music.apple.com",
            Authorization: `Bearer ${APPLE_AUTH}`,
            "media-user-token": USER_TOKEN,
          },
        }
      );

      if (songResponse.data.data[0].attributes) {
        console.log("Apple | Lyrics | Success");
      } else {
        console.log("Apple | Lyrics | Failed");
      }

      res.status(200).json(songResponse.data);

      const lyrics = songResponse.data;
      const artwork =
        searchResponse.data.results.songs.data[0].attributes.artwork;

      res.status(200).json({ lyrics, artwork });
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
