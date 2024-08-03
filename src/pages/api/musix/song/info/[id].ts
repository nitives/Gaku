import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const MUSIX_API_KEY = process.env.MUSIX_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { isrc } = req.query;

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const response = await axios.get(
      `http://api.musixmatch.com/ws/1.1/track.get?track_isrc=${isrc}&format=json&apikey=${MUSIX_API_KEY}`
    );

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch track data" });
  }
}
