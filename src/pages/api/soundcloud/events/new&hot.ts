import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const response = await axios.get(
        `https://api-v2.soundcloud.com/playlists/1712717571?representation=full&client_id=${process.env.SOUNDCLOUD_CLIENT_ID}`,
        {
          headers: {
            Authorization: `OAuth ${process.env.SOUNDCLOUD_API_KEY}`,
          },
        }
      );
      res.status(200).json(response.data);
    } catch (error) {
      res.status(500).json({ error: "An error occurred" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
