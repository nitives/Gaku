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

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "ID is required" });
  }

  try {
    console.log("API | Fetching playlist URL from ID: " + id);
    const playlistResponse = await axios.get(
      `https://api-v2.soundcloud.com/playlists/${id}`,
      {
        headers: {
          Host: "api-v2.soundcloud.com",
          Authorization: `OAuth ${process.env.SOUNDCLOUD_API_KEY}`,
        },
      }
    );

    const url = playlistResponse.data.permalink_url;
    console.log("API | Fetched playlist URL: " + playlistResponse);

    res.status(200).json({ url });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the playlist" });
  }
}
