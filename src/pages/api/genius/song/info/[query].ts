import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const GENIUS_ACCESS_TOKEN = process.env.GENIUS_ACCESS_TOKEN;

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
    const response = await axios.get(
      `https://api.genius.com/search?q=${query}&access_token=${GENIUS_ACCESS_TOKEN}`
    );

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch track data" });
  }
}
