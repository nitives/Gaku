import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const response = await axios.get("https://api-v2.soundcloud.com/search", {
        params: {
          ...req.query,
          facet: "model",
          limit: 60,
          offset: 0,
        },
        headers: {
          Authorization: `OAuth ${process.env.SOUNDCLOUD_API_KEY}`,
        },
      });
      res.status(200).json(response.data);
    } catch (error) {
      res.status(500).json({ error: "An error occurred" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
