import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const response = await axios.get(
        `https://api-v2.soundcloud.com/tracks/${id}?client_id=${process.env.SOUNDCLOUD_CLIENT_ID}`,
        {
          headers: {
            Host: "api-v2.soundcloud.com",
            Authorization: `OAuth ${process.env.SOUNDCLOUD_API_KEY}`, // Ensure the client ID is set in your .env file
          },
        }
      );

      res.status(200).json(response.data);
    } catch (error) {
      console.error("Error fetching track data:", error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching the track data" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
